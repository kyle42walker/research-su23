import { Graph } from './graph'

// Information required to track a robot in the graph
export type Robot = {
  id: number
  startNode: number
  currentNode: number
  portsTraversed: number[]
  state: 'active' | 'stopped'
}

// Manages the robots and their movement
export abstract class RobotCoordinator {
  graph: Graph
  visitedNodes: boolean[]
  robots: Robot[] = []
  stepNumber = 0

  constructor (graph: Graph) {
    this.graph = graph
    this.visitedNodes = new Array(graph.getNodeCount()).fill(false)
  }

  createRobots (robotCount: number, startingNode: number) {
    for (let i = 0; i < robotCount; ++i) {
      const robot: Robot = {
        id: i,
        startNode: startingNode,
        currentNode: startingNode,
        portsTraversed: [],
        state: 'active'
      }
      this.robots.push(robot)
    }
  }

  abstract step (): void
}

// A robot coordinator that implements a random walk dispersion algorithm
export class RandomWalkDispersionRobotCoordinator extends RobotCoordinator {
  step () {
    // Move all active robots
    const activeRobots = this.robots.filter(robot => robot.state === 'active')
    activeRobots.forEach((robot) => {
      // Stop any robots that have reached a new node
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
        robot.state = 'stopped'
        return // Continue forEach loop
      }

      // Move the robot to a random adjacent node
      const port = Math.floor(Math.random() * this.graph.getNumberOfPorts(robot.currentNode))
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, port)
      robot.portsTraversed.push(port)
    })

    ++this.stepNumber
  }
}

// A robot coordinator that implements a random walk exploration algorithm
export class RandomWalkExplorationRobotCoordinator extends RobotCoordinator {
  step () {
    this.robots.forEach((robot) => {
      if (!this.visitedNodes[robot.currentNode]) {
        this.visitedNodes[robot.currentNode] = true
        return // Continue forEach loop
      }

      // Move the robot to a random adjacent node
      const port = Math.floor(Math.random() * this.graph.getNumberOfPorts(robot.currentNode))
      robot.currentNode = this.graph.getAdjacentNodeFromPort(robot.currentNode, port)
      robot.portsTraversed.push(port)
    })

    ++this.stepNumber
  }
}
