import { Graph } from './graph'

// Information required to track a robot in the graph
export type Robot = {
  id: number
  startNode: number
  currentNode: number
  portsTraversed: number[]
}

type RobotWithState = Robot & { state: 'active' | 'inactive' }

// Manages the robots and their movement
export abstract class RobotCoordinator {
  graph: Graph
  visitedNodes: boolean[]
  robots: Robot[] = []
  robotCount = 0
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
  robots: RobotWithState[] = []

  createRobots (numberOfRobots: number, startingNode: number) {
    for (let i = 0; i < numberOfRobots; ++i) {
      this.robots.push({
        id: this.robotCount++,
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

      // Move the robot to a random adjacent node
      const port = Math.floor(Math.random() * this.graph.getNumberOfPorts(robot.currentNode))
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
  createRobots (numberOfRobots: number, startingNode: number) {
    for (let i = 0; i < numberOfRobots; ++i) {
      this.robots.push({
        id: this.robotCount++,
        startNode: startingNode,
        currentNode: startingNode,
        portsTraversed: []
      })
    }
  }

  step () {
    this.robots.forEach((robot) => {
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
      }

      // Move the robot to a random adjacent node
      const port = Math.floor(Math.random() * this.graph.getNumberOfPorts(robot.currentNode))
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, port)
      robot.portsTraversed.push(port)
    })

    ++this.stepNumber
  }

  run () {
    while (this.visitedNodes.includes(false)) {
      this.step()
    }
  }
}
