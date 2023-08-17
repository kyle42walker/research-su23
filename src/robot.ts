import { Graph } from './graph'

// Information required to track a robot in the graph
export type Robot = {
  id: number
  startNode: number
  currentNode: number
  portsTraversed: number[]
}

type TwoStateRobot = Robot & { state: 'active' | 'inactive' }
type PlanningRobot = Robot & { plannedNode: number }

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

  abstract createRobots (numberOfRobots: number, startingNode: number): void
  abstract step (): void
  abstract run (): void
}

// A robot coordinator that implements a random walk dispersion algorithm
export class RandomWalkDispersionRobotCoordinator extends RobotCoordinator {
  robots: TwoStateRobot[] = []

  createRobots (numberOfRobots: number, startingNode: number) {
    for (let i = 0; i < numberOfRobots; ++i) {
      this.robots.push({
        id: this.robotIdCount++,
        startNode: startingNode,
        currentNode: startingNode,
        portsTraversed: [],
        state: 'active'
      })
    }
  }

  step () {
    // Move all active robots
    const activeRobots = this.robots.filter(robot => robot.state === 'active')
    activeRobots.forEach((robot) => {
      // Stop any robots that have reached a new node
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
        robot.state = 'inactive'
        return // Continue forEach loop
      }

      // In directed graphs, the robot may get stuck in a leaf node
      const numberOfPorts = this.graph.getNumberOfPorts(robot.currentNode)
      if (numberOfPorts === 0) {
        robot.state = 'inactive'
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
    while (this.robots.some(robot => robot.state === 'active')) {
      this.step()
    }
  }
}

// A robot coordinator that implements a random walk exploration algorithm
export class RandomWalkExplorationRobotCoordinator extends RobotCoordinator {
  robots: TwoStateRobot[] = []
  createRobots (numberOfRobots: number, startingNode: number) {
    for (let i = 0; i < numberOfRobots; ++i) {
      this.robots.push({
        id: this.robotIdCount++,
        startNode: startingNode,
        currentNode: startingNode,
        portsTraversed: [],
        state: 'active'
      })
    }
  }

  step () {
    this.robots.forEach((robot) => {
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }

      // In directed graphs, the robot may get stuck in a leaf node
      const numberOfPorts = this.graph.getNumberOfPorts(robot.currentNode)
      if (numberOfPorts === 0) {
        robot.state = 'inactive'
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
    while (this.visitedNodes.includes(false) && this.robots.some((robot) => robot.state === 'active')) {
      this.step()
    }
  }
}

// type Tree = {
//   root: number
//   nodes: {
//     parent: number
//   }[]
// }

export class TreeExplorationWithGlobalCommunicationRobotCoordinator extends RobotCoordinator {
  robots: PlanningRobot[] = []
  parentPorts: number[] = []

  constructor (graph: Graph) {
    super(graph)
    this.computeParentPorts()
  }

  createRobots (numberOfRobots: number, startingNode: number) {
    for (let i = 0; i < numberOfRobots; ++i) {
      this.robots.push({
        id: this.robotIdCount++,
        startNode: startingNode,
        currentNode: startingNode,
        portsTraversed: [],
        plannedNode: -1
      })
    }
  }

  step () {
    // Get ports on root. Number of ports on each child node is boundary number for the port
    // Call recursively on children that have been visited. Mark parent node.

    // For each visited node, find children and add them to the tree
    let visitedNode = 0
    // Indicies of visitedNodes correspond with nodeIds in the graph
    while (visitedNode !== -1) {
      // Get children of visited node
      const childPorts = this.graph.getChildPorts(visitedNode, this.parentPorts[visitedNode])
      const boundaryCount = childPorts.map((childPort) => this.computeBoundaryNodesOnPort(visitedNode, childPort))
      const boundaryCountSum = boundaryCount.reduce((a, b) => a + b, 0)

      console.log(visitedNode)
      console.log(boundaryCount)
      console.log(boundaryCountSum)

      // Get robots on this node
      const robotsOnNode = this.robots.filter((robot) => robot.currentNode === visitedNode)

      // Robots on this node are distributed to children proportional to boundary number
      
      // robotsOnNode.forEach((robot) => {
      //   // Store planned robot move
      //   robot.plannedNode = 
      // })

      visitedNode = this.visitedNodes.indexOf(true, visitedNode + 1) // -1 if no more visited nodes exist
    }

    // Move all robots
    this.robots.forEach((robot) => {
      robot.currentNode = robot.plannedNode
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }
    })

    ++this.stepNumber
  }

  run () {
    // TODO: REMOVE count -- this is for testing without running into infinite loops
    console.log(this.graph)
    console.log(this.parentPorts)
    console.log(this.visitedNodes)
    let count = 0
    while (this.visitedNodes.includes(false) && count < 100) {
      this.step()
      ++count
    }
    console.log(this.graph)
    console.log(this.parentPorts)
    console.log(this.visitedNodes)
  }

  // Assumes node index 0 is root
  computeParentPorts () {
    // Initialize parent nodes
    this.parentPorts = new Array(this.graph.getNodeCount()).fill(-1)

    this.graph.getNodeIds().forEach((nodeId) => {
      // Get children of nodeId
      const children = this.graph.getChildPorts(nodeId, this.parentPorts[nodeId])

      // Set parent of children to current node
      children.forEach((child) => {
        this.parentPorts[child] = this.graph.getPortFromAdjacentNode(nodeId, this.parentPorts[nodeId])
      })
    })
  }

  computeBoundaryNodesOnPort (nodeId: number, port: number): number {
    if (!this.visitedNodes[nodeId]) {
      return 1
    }

    const subtreeRoot = this.graph.getAdjacentNodeFromPort(nodeId, port)
    const childPorts = this.graph.getChildPorts(subtreeRoot, this.parentPorts[subtreeRoot])

    let sum = 0

    childPorts.forEach((childPort) => {
      sum += this.computeBoundaryNodesOnPort(subtreeRoot, childPort)
    })

    return sum
  }
}
