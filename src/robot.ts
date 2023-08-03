import { Graph } from './graph'

// Information required to track a robot in the graph
type Robot = {
  startNode: number
  currentNode: number
  portsTraversed: number[]
}

// Robot memory -- extends Robot type
type RandomWalkRobot = Robot & {
  state: 'walking' | 'stopped'
}

// Manages the robots and their movement
export type RobotCoordinator = {
  graph: Graph
  robots: Robot[]
  stepNumber: number
  createRobots: (robotCount: number, startingNode: number) => void
  step: () => void
}

// A robot coordinator that implements the random walk dispersion algorithm
export class RandomWalkDispersionRobotCoordinator implements RobotCoordinator {
    graph: Graph
    robots: RandomWalkRobot[] = []
    visitedNodes: boolean[] = []
    stepNumber = 0

    constructor (graph: Graph) {
      this.graph = graph
      this.visitedNodes = new Array(graph.getNodeCount()).fill(false)
    }

    createRobots (robotCount: number, startingNode: number) {
      for (let i = 0; i < robotCount; ++i) {
        const robot: RandomWalkRobot = {
          startNode: startingNode,
          currentNode: startingNode,
          portsTraversed: [],
          state: 'walking'
        }
        this.robots.push(robot)
      }
    }

    step () {
      // Move all active robots
      const activeRobots = this.robots.filter(robot => robot.state === 'walking')
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
