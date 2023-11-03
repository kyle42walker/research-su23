import { Graph, Vertex } from './graph'

// Information required to track a robot in the graph
export type Robot = {
  id: number
  startNode: number
  currentNode: number
  portsTraversed: number[]
}

type RandomWalkRobot = Robot & { state: 'active' | 'discarded' }
// type LocalCommunicationRobot = Robot & { state: 'exploring' | 'notifying' | 'waiting to notify' | 'discarded' }

// Manages the robots and their movement
export abstract class RobotCoordinator {
  graph: Graph
  graphHistory: { stepNumber: number, graphNodes: Vertex[] }[] = []
  visitedNodes: boolean[]
  robots: Robot[] = []
  robotStartingNode: number
  numberOfRobotsToGenerate: number
  robotIdCount = 0
  stepNumber = 0
  lambda: number
  edgeSurvivalProbability: number

  constructor (graph: Graph, lambda: number, edgeSurvivalProbability: number, numberOfRobotsToGenerate: number, robotStartingNode = 0) {
    this.graph = graph
    this.lambda = lambda
    this.edgeSurvivalProbability = edgeSurvivalProbability
    this.numberOfRobotsToGenerate = numberOfRobotsToGenerate
    this.robotStartingNode = robotStartingNode

    this.visitedNodes = new Array(graph.getNodeCount()).fill(false)
    this.visitedNodes[this.robotStartingNode] = true
    this.createRobots(numberOfRobotsToGenerate, robotStartingNode)
  }

  // Create robots and place them at the starting node
  createRobots (numberOfRobots: number, startingNode: number) {
    for (let i = 0; i < numberOfRobots; ++i) {
      const robot = {
        id: this.robotIdCount++,
        startNode: startingNode,
        currentNode: startingNode,
        portsTraversed: []
      }
      this.initializeRobot(robot)
      this.robots.push(robot)
    }
  }

  // Configure each robot's starting state
  abstract initializeRobot (robot: Robot): void

  // Step the simulation forward one time unit
  abstract step (): void

  // Run the simulation until a termination condition is met
  abstract run (): void
}

// A robot coordinator that implements a random walk dispersion algorithm
export class RandomWalkDispersionRobotCoordinator extends RobotCoordinator {
  robots: RandomWalkRobot[] = []

  initializeRobot (robot: RandomWalkRobot) {
    robot.state = 'active'
  }

  step () {
    // Remove random edges every lambda steps by negating edge weights
    if (this.stepNumber % this.lambda === 0) {
      this.graphHistory.push({ stepNumber: this.stepNumber, graphNodes: this.graph.deepCopyNodes() })
      this.graph.setRandomEdgeWeightSigns(this.edgeSurvivalProbability)
    }

    // Move all active robots
    const activeRobots = this.robots.filter(robot => robot.state === 'active')
    activeRobots.forEach((robot) => {
      // Stop any robots that have reached a new node
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
        robot.state = 'discarded'
        return // Continue forEach loop
      }

      // In directed graphs, the robot may get stuck at a leaf node
      const numberOfPorts = this.graph.getNumberOfPorts(robot.currentNode)
      if (numberOfPorts === 0) {
        robot.state = 'discarded'
        return // Continue forEach loop
      }

      // Move the robot to a random adjacent node with a positive edge weight
      // let port: number
      // do {
      //   port = Math.floor(Math.random() * numberOfPorts)
      // } while (this.graph.getEdgeWeightFromPort(robot.currentNode, port) < 0)

      const port = Math.floor(Math.random() * numberOfPorts)
      if (this.graph.getEdgeWeightFromPort(robot.currentNode, port) < 0) {
        // Mark the intended port as negative to indicate that it is not traversable
        robot.portsTraversed.push(-port - 100) // -100 to avoid collisions with other negative ports
        // Do nothing this step for this robot -- it will try again next step
        return // Continue forEach loop
      }
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, port)
      robot.portsTraversed.push(port)
    })

    ++this.stepNumber
  }

  run () {
    // Run until all robots are inactive
    while (this.robots.some(robot => robot.state === 'active') && this.visitedNodes.includes(false)) {
      this.step()
    }
  }
}

// A robot coordinator that implements a random walk exploration algorithm
export class RandomWalkExplorationRobotCoordinator extends RobotCoordinator {
  robots: RandomWalkRobot[] = []

  initializeRobot (robot: RandomWalkRobot) {
    robot.state = 'active'
  }

  step () {
    // Remove random edges every lambda steps by negating edge weights
    if (this.stepNumber % this.lambda === 0) {
      this.graphHistory.push({ stepNumber: this.stepNumber, graphNodes: this.graph.deepCopyNodes() })
      this.graph.setRandomEdgeWeightSigns(this.edgeSurvivalProbability)
    }

    // Move all robots
    this.robots.forEach((robot) => {
      // Mark visited nodes
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }

      // In directed graphs, the robot may get stuck in a leaf node
      const numberOfPorts = this.graph.getNumberOfPorts(robot.currentNode)
      if (numberOfPorts === 0) {
        robot.state = 'discarded'
        return // Continue forEach loop
      }

      // Move the robot to a random adjacent node
      const port = Math.floor(Math.random() * numberOfPorts)
      if (this.graph.getEdgeWeightFromPort(robot.currentNode, port) < 0) {
        // Mark the intended port as negative to indicate that it is not traversable
        robot.portsTraversed.push(-port - 100) // -100 to avoid collisions with other negative ports
        // Do nothing this step for this robot -- it will try again next step
        return // Continue forEach loop
      }
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, port)
      robot.portsTraversed.push(port)
    })

    ++this.stepNumber
  }

  run () {
    // Run until all nodes have been visited (or all are inactive in case of directed graphs with leaf nodes)
    while (this.visitedNodes.includes(false) && this.robots.some((robot) => robot.state === 'active')) {
      this.step()
    }
  }
}

// A robot coordinator that implements fast collaborative exploration of a tree with global communication
export class TreeExplorationWithGlobalCommunicationRobotCoordinator extends RobotCoordinator {
  // Indicies of parentPorts and childPorts correspond with nodeIds in the graph
  parentPorts: number[] = []
  childPorts: number[][] = []

  constructor (graph: Graph, lambda: number, edgeSurvivalProbability: number, numberOfRobotsToGenerate: number, robotStartingNode = 0) {
    super(graph, lambda, edgeSurvivalProbability, numberOfRobotsToGenerate, robotStartingNode)

    // Populate parentPorts and childPorts arrays
    this.treeify()
  }

  initializeRobot () {
    // Do nothing -- no special configuration required
  }

  step () {
    // Remove random edges every lambda steps by negating edge weights
    if (this.stepNumber % this.lambda === 0) {
      this.graphHistory.push({ stepNumber: this.stepNumber, graphNodes: this.graph.deepCopyNodes() })
      this.graph.setRandomEdgeWeightSigns(this.edgeSurvivalProbability)
    }

    // Indicies of plannedPorts correspond with robotIds in the robots array -- represents where the robot will move after all robots have finished planning
    const plannedPorts: number[] = []

    // For each visited node, find children and add them to the tree
    let visitedNode = 0
    // Indicies of visitedNodes correspond with nodeIds in the graph
    while (visitedNode !== -1) {
      // Get number of boundary nodes along each child port of this node
      const boundaryCount = this.childPorts[visitedNode].map((childPort) => this.computeBoundaryNodesOnPort(visitedNode, childPort))
      const boundaryCountSum = boundaryCount.reduce((a, b) => a + b, 0)

      // Determine number of robots to move to each child port
      const robotsOnNode = this.robots.filter((robot) => robot.currentNode === visitedNode)
      const robotsToEachChildPort = boundaryCount.map((count) => Math.floor(count / boundaryCountSum * robotsOnNode.length))
      const robotsToEachChildPortSum = robotsToEachChildPort.reduce((a, b) => a + b, 0)

      // For leaf nodes and nodes on completely explored branches, set plannedPort to -1
      if (boundaryCountSum === 0) {
        robotsOnNode.forEach((robot) => {
          plannedPorts[robot.id] = -1
        })
        visitedNode = this.visitedNodes.indexOf(true, visitedNode + 1) // -1 if no more visited nodes exist
        continue // Continue while loop
      }

      // Add remaining robots to port with highest boundary number -- ties go to lowest index port
      if (robotsToEachChildPortSum !== robotsOnNode.length) {
        const maxBoundaryNumber = boundaryCount.reduce((a, b) => Math.max(a, b), 0)
        const maxBoundaryNumberIndex = boundaryCount.indexOf(maxBoundaryNumber)
        robotsToEachChildPort[maxBoundaryNumberIndex] += robotsOnNode.length - robotsToEachChildPortSum
      }

      // Robots on this node are distributed to child ports proportionally to the boundary numbers
      let robotIndex = 0
      robotsToEachChildPort.forEach((count, childPortIndex) => {
        // Slice robotsOnNode to get robots for this child port
        const robotsForChildPort = robotsOnNode.slice(robotIndex, count + robotIndex)
        robotsForChildPort.forEach((robot) => {
          // Store planned robot move
          plannedPorts[robot.id] = this.childPorts[visitedNode][childPortIndex]
        })
        robotIndex += count
      })

      visitedNode = this.visitedNodes.indexOf(true, visitedNode + 1) // -1 if no more visited nodes exist
    }

    // Move all robots
    this.robots.forEach((robot) => {
      if (plannedPorts[robot.id] === -1) {
        return // Continue forEach loop -- skip robots that are not moving
      }

      // Check if the robot can move to the planned port
      if (this.graph.getEdgeWeightFromPort(robot.currentNode, plannedPorts[robot.id]) < 0) {
        // Mark the intended port as negative to indicate that it is not traversable
        robot.portsTraversed.push(-plannedPorts[robot.id] - 100) // -100 to avoid collisions with other negative ports
        // Do nothing this step for this robot -- it will try again next step
        return // Continue forEach loop
      }

      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, plannedPorts[robot.id])
      robot.portsTraversed.push(plannedPorts[robot.id])

      // Mark visited nodes
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }
    })

    // Generate new robots
    this.createRobots(this.numberOfRobotsToGenerate, 0)

    ++this.stepNumber
  }

  run () {
    // Run until all nodes have been visited
    while (this.visitedNodes.includes(false)) {
      this.step()
    }
  }

  // Represent the already tree-structured graph as a tree
  treeify () {
    // Initialize parent nodes to -1
    this.parentPorts = new Array(this.graph.getNodeCount()).fill(-1)

    this.graph.getNodeIds().forEach((nodeId) => {
      // Get children of nodeId
      this.childPorts[nodeId] = this.graph.getChildPorts(nodeId, this.parentPorts[nodeId])

      // Set parent of children to current node
      this.childPorts[nodeId].forEach((childPort) => {
        const childNode = this.graph.getAdjacentNodeFromPort(nodeId, childPort)
        this.parentPorts[childNode] = this.graph.getPortFromAdjacentNode(childNode, nodeId)
      })
    })
  }

  // Compute the number of boundary nodes on a port
  computeBoundaryNodesOnPort (nodeId: number, port: number): number {
    const subtreeRoot = this.graph.getAdjacentNodeFromPort(nodeId, port)

    if (!this.visitedNodes[nodeId] || !this.visitedNodes[subtreeRoot]) {
      return 1
    }

    // Add up boundary nodes in the subtree
    let sum = 0
    this.childPorts[subtreeRoot].forEach((childPort) => {
      sum += this.computeBoundaryNodesOnPort(subtreeRoot, childPort)
    })

    return sum
  }
}

// A robot coordinator that implements fast collaborative exploration of an arbitrary graph with global communication
export class ArbitraryGraphExplorationWithGlobalCommunicationRobotCoordinator extends RobotCoordinator {
  // Indicies of parentPorts and childPorts correspond with nodeIds in the graph
  parentPorts: number[] = []
  childPorts: number[][] = []

  constructor (graph: Graph, lambda: number, edgeSurvivalProbability: number, numberOfRobotsToGenerate: number, robotStartingNode = 0) {
    super(graph, lambda, edgeSurvivalProbability, numberOfRobotsToGenerate, robotStartingNode)

    // Initialize parent nodes to -1
    this.parentPorts = new Array(this.graph.getNodeCount()).fill(-1)
  }

  initializeRobot () {
    // Do nothing -- no special configuration required
  }

  // TODO -- if the node has been visited already, then remove it from the childPorts array of the less optimal path
  step () {
    // Indicies of plannedPorts correspond with robotIds in the robots array -- represents where the robot will move after all robots have finished planning
    const plannedPorts: number[] = []

    // Get all unique nodes with robots on them
    const nodesWithRobots: number[] = this.robots.map((robot) => robot.currentNode).filter((nodeId, index, array) => array.indexOf(nodeId) === index)

    // For each node with robots, find children and add them to the tree
    nodesWithRobots.forEach((nodeWithRobot) => {
      // Compute the child ports of this node, if they have not already been computed
      if (!this.childPorts[nodeWithRobot]) {
        this.childPorts[nodeWithRobot] = this.graph.getChildPorts(nodeWithRobot, this.parentPorts[nodeWithRobot])
      }

      // Get number of boundary nodes along each child port of this node
      const boundaryCount = this.childPorts[nodeWithRobot].map((childPort) => this.computeBoundaryNodesOnPort(nodeWithRobot, childPort))
      const boundaryCountSum = boundaryCount.reduce((a, b) => a + b, 0)

      // Determine number of robots to move to each child port
      const robotsOnNode = this.robots.filter((robot) => robot.currentNode === nodeWithRobot)
      const robotsToEachChildPort = boundaryCount.map((count) => Math.floor(count / boundaryCountSum * robotsOnNode.length))
      const robotsToEachChildPortSum = robotsToEachChildPort.reduce((a, b) => a + b, 0)

      // For leaf nodes and nodes on completely explored branches, set plannedPort to -1
      if (boundaryCountSum === 0) {
        robotsOnNode.forEach((robot) => {
          plannedPorts[robot.id] = -1
        })
        return // Continue forEach loop
      }

      // Add remaining robots to port with highest boundary number -- ties go to lowest index port
      // Compare the number of robots split evenly to each port with the number of robots on this node to see if there are any leftover
      if (robotsToEachChildPortSum !== robotsOnNode.length) {
        const maxBoundaryNumber = boundaryCount.reduce((a, b) => Math.max(a, b), 0)
        const maxBoundaryNumberIndex = boundaryCount.indexOf(maxBoundaryNumber) // returns first occurence of maxBoundaryNumber
        robotsToEachChildPort[maxBoundaryNumberIndex] += robotsOnNode.length - robotsToEachChildPortSum
      }

      // Robots on this node are distributed to child ports proportionally to the boundary numbers
      let robotIndex = 0
      robotsToEachChildPort.forEach((count, childPortIndex) => {
        // Slice robotsOnNode to get robots for this child port
        const robotsForChildPort = robotsOnNode.slice(robotIndex, count + robotIndex)
        robotsForChildPort.forEach((robot) => {
          // Store planned robot move
          plannedPorts[robot.id] = this.childPorts[nodeWithRobot][childPortIndex]
        })
        robotIndex += count
      })
    })

    // Move all robots
    this.robots.forEach((robot) => {
      if (plannedPorts[robot.id] === -1) {
        return // Continue forEach loop -- skip robots that are not moving
      }

      // Check if the robot can move to the planned port
      if (this.graph.getEdgeWeightFromPort(robot.currentNode, plannedPorts[robot.id]) < 0) {
        // Mark the intended port as negative to indicate that it is not traversable
        robot.portsTraversed.push(-plannedPorts[robot.id] - 100) // -100 to avoid collisions with other negative ports
        // Do nothing this step for this robot -- it will try again next step
        return // Continue forEach loop
      }

      // Store the current node as the parent of the planned node
      const plannedNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, plannedPorts[robot.id])
      this.parentPorts[plannedNode] = this.graph.getPortFromAdjacentNode(plannedNode, robot.currentNode)

      // Compute the child ports of the new node, if they have not already been computed
      if (!this.childPorts[plannedNode]) {
        this.childPorts[plannedNode] = this.graph.getChildPorts(plannedNode, this.parentPorts[plannedNode])
        // Only keep child ports that have not already been visited (to avoid multiple paths to the same node)
        this.childPorts[plannedNode].forEach((childPort) => {
          const childNode = this.graph.getAdjacentNodeFromPort(plannedNode, childPort)
          if (this.visitedNodes[childNode]) {
            this.childPorts[plannedNode] = this.childPorts[plannedNode].filter((port) => port !== childPort)
          }
        })
      }

      robot.currentNode = plannedNode
      robot.portsTraversed.push(plannedPorts[robot.id])

      // Mark visited nodes
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }
    })

    // Generate new robots
    this.createRobots(this.numberOfRobotsToGenerate, 0)

    ++this.stepNumber
  }

  run () {
    // Run until all nodes have been visited
    while (this.visitedNodes.includes(false)) {
      this.step()
    }
  }

  // Compute the number of boundary nodes on a port
  computeBoundaryNodesOnPort (nodeId: number, port: number): number {
    // Find the root of the subtree by looking down the port
    const subtreeRoot = this.graph.getAdjacentNodeFromPort(nodeId, port)

    if (!this.visitedNodes[nodeId] || !this.visitedNodes[subtreeRoot]) {
      return 1
    }

    // If the subtreeRoot has been visited, then its childPorts have already been computed
    // Add up boundary nodes in the subtree
    let sum = 0
    this.childPorts[subtreeRoot].forEach((childPort) => {
      sum += this.computeBoundaryNodesOnPort(subtreeRoot, childPort)
    })

    return sum
  }
}

// // A robot coordinator that implements fast collaborative exploration with local communication
// export class TreeExplorationWithLocalCommunicationRobotCoordinator extends RobotCoordinator {
//   robots: LocalCommunicationRobot[] = []

//   // Number of robots to create each step
//   numberOfRobots = 0

//   createRobots (numberOfRobots: number, startingNode: number): void {
//     super.createRobots(numberOfRobots, startingNode)

//     // numberOfRobots is updated here to maintain consistent function calls with other robot coordinators
//     this.numberOfRobots = numberOfRobots
//   }

//   initializeRobot (robot: LocalCommunicationRobot): void {
//     robot.state = 'exploring'
//   }

//   step () {
//     // Get indices of visited nodes
//     const visitedNodeIds = this.visitedNodes.map((visited, index) => visited ? index : -1).filter((index) => index !== -1)

//     visitedNodeIds.forEach((visitedNode) => {
//       // Get robots on this node
//       const robotsOnNode = this.robots.filter((robot) => robot.currentNode === visitedNode)
//       // const exploringRobots = robotsOnNode.filter((robot) => robot.state === 'exploring')
//       const notifyingRobots = robotsOnNode.filter((robot) => robot.state === 'notifying')
//       const waitingRobots = robotsOnNode.filter((robot) => robot.state === 'waiting to notify')

//       // Check if it is a leaf node
//       if (this.graph.getNumberOfPorts(visitedNode) === 1) { // Only the parent port
//         // TODO: Handle leaf nodes
//         return // Continue forEach loop
//       }

//       // For all nodes except the root, move notifying robots to the parent node
//       if (visitedNode !== 0) { // Assumes root is always node id 0
//         notifyingRobots.forEach((robot) => {
//           // Assumes parent is always at port 0
//           robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, 0)
//           robot.portsTraversed.push(0)
//         })
//       }

//       // Prepare second notifying robot
//       waitingRobots.forEach((robot) => {
//         robot.state = 'notifying'
//       })

//       // if (exploringRobots.length >= 2 && )
//     })
//   }

//   run () {
//     // Run until all nodes have been visited
//     while (this.visitedNodes.includes(false)) {
//       this.step()
//     }
//   }
// }

// // A robot coordinator that implements fast collaborative exploration with local communication
// export class TreeExplorationWithLocalCommunicationRobotCoordinator extends RobotCoordinator {
//   robotState: ('exploring' | 'notifying' | 'waiting to notify')[] = []

//   // Indicies correspond to robotIds -- stores the nodeIds that each robot knows exists
//   nodesKnownByRobots: number[][] = []

//   // Indicies of parentPorts and childPorts correspond with nodeIds in the graph
//   parentPorts: number[] = []
//   childPorts: number[][] = []

//   // Number of robots to create each step
//   numberOfRobots = 0

//   constructor (graph: Graph) {
//     super(graph)

//     // Represent the graph as a tree
//     this.treeify()
//   }

//   createRobots (numberOfRobots: number, startingNode: number): void {
//     super.createRobots(numberOfRobots, startingNode)

//     // numberOfRobots is updated here to maintain consistent function calls with other robot coordinators
//     this.numberOfRobots = numberOfRobots
//   }

//   configureEachRobot () {
//     this.robotState.push('exploring')

//     // Robots initially know only their starting node
//     this.nodesKnownByRobots.push([this.robots[this.robots.length - 1].currentNode])
//   }

//   step () {
//     // Indicies of plannedPorts correspond with robotIds in the robots array -- represents where the robot will move after all robots have finished planning
//     const plannedPorts: number[] = []

//     // For each visited node, find children and add them to the tree
//     let visitedNode = 0
//     // Indicies of visitedNodes correspond with nodeIds in the graph
//     while (visitedNode !== -1) {

//     }

//     // while (visitedNode !== -1) {
//     //   // Get number of boundary nodes along each child port of this node
//     //   const boundaryCount = this.childPorts[visitedNode].map((childPort) => this.computeBoundaryNodesOnPort(visitedNode, childPort))
//     //   const boundaryCountSum = boundaryCount.reduce((a, b) => a + b, 0)

//     //   // Determine number of robots to move to each child port
//     //   const robotsOnNode = this.robots.filter((robot) => robot.currentNode === visitedNode)
//     //   const robotsToEachChildPort = boundaryCount.map((count) => Math.floor(count / boundaryCountSum * robotsOnNode.length))

//     //   // For leaf nodes and nodes on completely explored branches, set plannedPort to -1
//     //   if (boundaryCountSum === 0) {
//     //     robotsOnNode.forEach((robot) => {
//     //       plannedPorts[robot.id] = -1
//     //     })
//     //     visitedNode = this.visitedNodes.indexOf(true, visitedNode + 1) // -1 if no more visited nodes exist
//     //     continue // Continue while loop
//     //   }

//     //   // Add remaining robots to port with highest boundary number -- ties go to lowest index port
//     //   if (robotsToEachChildPort.reduce((a, b) => a + b, 0) !== robotsOnNode.length) {
//     //     const maxBoundaryNumber = boundaryCount.reduce((a, b) => Math.max(a, b), 0)
//     //     const maxBoundaryNumberIndex = boundaryCount.indexOf(maxBoundaryNumber)
//     //     robotsToEachChildPort[maxBoundaryNumberIndex] += robotsOnNode.length - robotsToEachChildPort.reduce((a, b) => a + b, 0)
//     //   }

//     //   // Robots on this node are distributed to child ports proportionally to the boundary numbers
//     //   let robotIndex = 0
//     //   robotsToEachChildPort.forEach((count, childPortIndex) => {
//     //     // Slice robotsOnNode to get robots for this child port
//     //     const robotsForChildPort = robotsOnNode.slice(robotIndex, count + robotIndex)
//     //     robotsForChildPort.forEach((robot) => {
//     //       // Store planned robot move
//     //       plannedPorts[robot.id] = this.childPorts[visitedNode][childPortIndex]
//     //     })
//     //     robotIndex += count
//     //   })

//     //   visitedNode = this.visitedNodes.indexOf(true, visitedNode + 1) // -1 if no more visited nodes exist
//     // }

//     // Move all robots
//     this.robots.forEach((robot) => {
//       if (plannedPorts[robot.id] === -1) {
//         return // Continue forEach loop -- skip robots that are not moving
//       }
//       robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, plannedPorts[robot.id])
//       robot.portsTraversed.push(plannedPorts[robot.id])

//       // Update robot memory with the new node
//       if (!this.nodesKnownByRobots[robot.id].includes(robot.currentNode)) {
//         this.nodesKnownByRobots[robot.id].push(robot.currentNode)
//       }

//       // Mark visited nodes
//       if (!this.visitedNodes[robot.currentNode]) {
//         this.visitedNodes[robot.currentNode] = true
//       }
//     })

//     // Generate new robots
//     this.createRobots(this.numberOfRobots, 0)

//     ++this.stepNumber
//   }

//   run () {
//     // Run until all nodes have been visited
//     while (this.visitedNodes.includes(false)) {
//       this.step()
//     }
//   }

//   // Represent the already tree-structured graph as a tree
//   treeify () {
//     // Assumes node index 0 is root
//     this.visitedNodes[0] = true

//     // Initialize parent nodes to -1
//     this.parentPorts = new Array(this.graph.getNodeCount()).fill(-1)

//     this.graph.getNodeIds().forEach((nodeId) => {
//       // Get children of nodeId
//       this.childPorts[nodeId] = this.graph.getChildPorts(nodeId, this.parentPorts[nodeId])

//       // Set parent of children to current node
//       this.childPorts[nodeId].forEach((childPort) => {
//         const childNode = this.graph.getAdjacentNodeFromPort(nodeId, childPort)
//         this.parentPorts[childNode] = this.graph.getPortFromAdjacentNode(childNode, nodeId)
//       })
//     })
//   }

//   // Compute the number of boundary nodes on a port
//   computeBoundaryNodesOnPort (nodeId: number, port: number): number {
//     const subtreeRoot = this.graph.getAdjacentNodeFromPort(nodeId, port)

//     if (!this.visitedNodes[nodeId] || !this.visitedNodes[subtreeRoot]) {
//       return 1
//     }

//     // Add up boundary nodes in the subtree
//     let sum = 0
//     this.childPorts[subtreeRoot].forEach((childPort) => {
//       sum += this.computeBoundaryNodesOnPort(subtreeRoot, childPort)
//     })

//     return sum
//   }
// }
