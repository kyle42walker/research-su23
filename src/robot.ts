import { Graph } from './graph'

class RandomWalkRobot {
    graph: Graph
    startingNode: number
    currentNode: number
    portsTraversed: number[] = []
    state: 'walking' | 'stopped' = 'walking'

    constructor (graph: Graph, startingNode: number) {
      this.graph = graph
      this.currentNode = this.startingNode = startingNode
    }

    reset () {
      this.currentNode = this.startingNode
      this.portsTraversed = []
      this.state = 'walking'
    }

    // Time complexity: O(1)
    step () {
      const port = Math.floor(Math.random() * this.graph.getNumberOfPorts(this.currentNode))
      this.currentNode = this.graph.getAdjacentNodeFromPort(this.currentNode, port)
      this.portsTraversed.push(port)
    }

    walkNumberOfSteps (steps: number) {
      for (let i = 0; i < steps; ++i) {
        this.step()
      }
    }

    walkUntilNodeIsReached (targetNode: number) {
      while (this.currentNode !== targetNode) {
        this.step()
      }
    }
}

export class RandomWalkRobotCoordinator {
    graph: Graph
    robots: RandomWalkRobot[] = []
    visitedNodes: boolean[] = []
    stepsTaken = 0

    constructor (graph: Graph) {
      this.graph = graph
      this.visitedNodes = new Array(graph.getNodeCount()).fill(false)
    }

    createRobots (robotCount: number, startingNode: number) {
      for (let i = 0; i < robotCount; ++i) {
        this.robots.push(new RandomWalkRobot(this.graph, startingNode))
      }
    }

    reset () {
      this.robots.forEach(robot => robot.reset())
      this.visitedNodes = new Array(this.graph.getNodeCount()).fill(false)
      this.stepsTaken = 0
    }

    stepDispersionAlgorithm () {
      const activeRobots = this.robots.filter(robot => robot.state === 'walking')

      // Stop robots that have reached a new node
      activeRobots.forEach((robot) => {
        if (!this.visitedNodes[robot.currentNode]) {
          robot.state = 'stopped'
          this.visitedNodes[robot.currentNode] = true
        }
        robot.step()
      })
    }
}
