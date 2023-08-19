import { Graph } from './graph'

// Information required to track a robot in the graph
export type Robot = {
  id: number
  startNode: number
  currentNode: number
  portsTraversed: number[]
}

// Manages the robots and their movement
export abstract class RobotCoordinator {
  graph: Graph
  visitedNodes: boolean[]
  robots: Robot[] = []
  robotIdCount = 0
  stepNumber = 0

  constructor (graph: Graph) {
    this.graph = graph
    this.visitedNodes = new Array(graph.getNodeCount()).fill(false)
  }

  // Create robots and place them at the starting node
  createRobots (numberOfRobots: number, startingNode: number) {
    for (let i = 0; i < numberOfRobots; ++i) {
      this.robots.push({
        id: this.robotIdCount++,
        startNode: startingNode,
        currentNode: startingNode,
        portsTraversed: []
      })
      this.configureEachRobot()
    }
  }

  // Configure each robot's starting state
  abstract configureEachRobot (): void

  // Step the simulation forward one time unit
  abstract step (): void

  // Run the simulation until a termination condition is met
  abstract run (): void
}

// A robot coordinator that implements a random walk dispersion algorithm
export class RandomWalkDispersionRobotCoordinator extends RobotCoordinator {
  // Indicies of robotState correspond with robotIds in the robots array
  robotState: ('active' | 'inactive')[] = []

  configureEachRobot () {
    this.robotState.push('active')
  }

  step () {
    // Move all active robots
    const activeRobots = this.robots.filter(robot => this.robotState[robot.id] === 'active')
    activeRobots.forEach((robot) => {
      // Stop any robots that have reached a new node
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
        this.robotState[robot.id] = 'inactive'
        return // Continue forEach loop
      }

      // In directed graphs, the robot may get stuck at a leaf node
      const numberOfPorts = this.graph.getNumberOfPorts(robot.currentNode)
      if (numberOfPorts === 0) {
        this.robotState[robot.id] = 'inactive'
        return // Continue forEach loop
      }

      // Move the robot to a random adjacent node
      const port = Math.floor(Math.random() * numberOfPorts)
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, port)
      robot.portsTraversed.push(port)
    })

    ++this.stepNumber
  }

  run () {
    // Run until all robots are inactive
    while (this.robots.some(robot => this.robotState[robot.id] === 'active')) {
      this.step()
    }
  }
}

// A robot coordinator that implements a random walk exploration algorithm
export class RandomWalkExplorationRobotCoordinator extends RobotCoordinator {
  robotState: ('active' | 'inactive')[] = []

  configureEachRobot () {
    this.robotState.push('active')
  }

  step () {
    // Move all robots
    this.robots.forEach((robot) => {
      // Mark visited nodes
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }

      // In directed graphs, the robot may get stuck in a leaf node
      const numberOfPorts = this.graph.getNumberOfPorts(robot.currentNode)
      if (numberOfPorts === 0) {
        this.robotState[robot.id] = 'inactive'
        return // Continue forEach loop
      }

      // Move the robot to a random adjacent node
      const port = Math.floor(Math.random() * numberOfPorts)
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, port)
      robot.portsTraversed.push(port)
    })

    ++this.stepNumber
  }

  run () {
    // Run until all nodes have been visited (or all are inactive in case of directed graphs with leaf nodes)
    while (this.visitedNodes.includes(false) && this.robots.some((robot) => this.robotState[robot.id] === 'active')) {
      this.step()
    }
  }
}

// A robot coordinator that implements fast collaborative exploration with global communication
export class TreeExplorationWithGlobalCommunicationRobotCoordinator extends RobotCoordinator {
  // Indicies of parentPorts and childPorts correspond with nodeIds in the graph
  parentPorts: number[] = []
  childPorts: number[][] = []

  // Number of robots to create each step
  numberOfRobots = 0

  constructor (graph: Graph) {
    super(graph)
    // Represent the graph as a tree
    this.treeify()
  }

  createRobots (numberOfRobots: number, startingNode: number): void {
    super.createRobots(numberOfRobots, startingNode)
    // numberOfRobots is updated here to maintain consistent function calls with other robot coordinators
    this.numberOfRobots = numberOfRobots
  }

  configureEachRobot () {
    // Do nothing -- no special configuration required
  }

  step () {
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

      // For leaf nodes and nodes on completely explored branches, set plannedPort to -1
      if (boundaryCountSum === 0) {
        robotsOnNode.forEach((robot) => {
          plannedPorts[robot.id] = -1
        })
        visitedNode = this.visitedNodes.indexOf(true, visitedNode + 1) // -1 if no more visited nodes exist
        continue // Continue while loop
      }

      // Add remaining robots to port with highest boundary number -- ties go to lowest index port
      if (robotsToEachChildPort.reduce((a, b) => a + b, 0) !== robotsOnNode.length) {
        const maxBoundaryNumber = boundaryCount.reduce((a, b) => Math.max(a, b), 0)
        const maxBoundaryNumberIndex = boundaryCount.indexOf(maxBoundaryNumber)
        robotsToEachChildPort[maxBoundaryNumberIndex] += robotsOnNode.length - robotsToEachChildPort.reduce((a, b) => a + b, 0)
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
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, plannedPorts[robot.id])
      robot.portsTraversed.push(plannedPorts[robot.id])

      // Mark visited nodes
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }
    })

    // Generate new robots
    this.createRobots(this.numberOfRobots, 0)

    ++this.stepNumber
  }

  run () {
    // Run until all nodes have been visited
    while (this.visitedNodes.includes(false)) {
      this.step()
    }
  }

  // Represent the graph as a tree
  treeify () {
    // Assumes node index 0 is root
    this.visitedNodes[0] = true

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
