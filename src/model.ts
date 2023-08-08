import { Graph, GraphGenerator } from './graph'
import * as robot from './robot'

export enum GraphType { Path, Cycle, Complete, ErdosRenyiRandom }
export enum RobotType { RandomWalkDispersion, RandomWalkExploration }

export class Model {
    private _graph: Graph = {} as Graph
    public graphType: GraphType = GraphType.Path
    private _nodeCount = 0
    private _edgeProbability = 0.5
    public isDirected = false
    public allowSelfLoops = false
    public requireConnected = false
    private _maxNumberOfGraphGenerationAttempts = 100

    public robotCoordinator: robot.RobotCoordinator = {} as robot.RobotCoordinator
    public robotType: RobotType = RobotType.RandomWalkDispersion
    private _robotCount = 0
    private _robotStartingNode = 0

    constructor () {
      this.generateGraph()
      this.generateRobots()
    }

    generateGraph () {
      let attempts = this.maxNumberOfGraphGenerationAttempts
      switch (this.graphType) {
        case GraphType.ErdosRenyiRandom:
          do {
            this._graph = GraphGenerator.generateErdosRenyiRandomGraph(
              this.nodeCount,
              this.edgeProbability,
              this.isDirected,
              this.allowSelfLoops
            )
          } while (this.requireConnected && !this.graph.isConnected() && --attempts > 0)
          if (attempts === 0) { throw new Error('Could not generate a connected graph') }
          break
        case GraphType.Path:
          this._graph = GraphGenerator.generatePath(this.nodeCount, this.isDirected)
          break
        case GraphType.Cycle:
          this._graph = GraphGenerator.generateCycle(this.nodeCount, this.isDirected)
          break
        case GraphType.Complete:
          this._graph = GraphGenerator.generateCompleteGraph(this.nodeCount, this.isDirected, this.allowSelfLoops)
          break
        default:
          throw new Error(`Invalid graph type: ${this.graphType}`)
      }
    }

    generateRobots () {
      switch (this.robotType) {
        case RobotType.RandomWalkDispersion:
          this.robotCoordinator = new robot.RandomWalkDispersionRobotCoordinator(this.graph)
          this.robotCoordinator.createRobots(this.robotCount, this.robotStartingNode)
          break
        case RobotType.RandomWalkExploration:
          this.robotCoordinator = new robot.RandomWalkExplorationRobotCoordinator(this.graph)
          this.robotCoordinator.createRobots(this.robotCount, this.robotStartingNode)
          break
        default:
          throw new Error(`Invalid robot type: ${this.robotType}`)
      }
    }

    stepRobots () {
      this.robotCoordinator.step()
    }

    runRobots () {
      this.robotCoordinator.run()
    }

    // Getters and setters
    get graph (): Graph { return this._graph }

    get nodeCount (): number { return this._nodeCount }
    set nodeCount (value: number) {
      if (value < 0) { throw new Error('Node count must be non-negative') }
      this._nodeCount = value
    }

    get edgeProbability (): number { return this._edgeProbability }
    set edgeProbability (value: number) {
      if (value < 0 || value > 1) { throw new Error('Edge probability must be in [0, 1]') }
      this._edgeProbability = value
    }

    get maxNumberOfGraphGenerationAttempts (): number { return this._maxNumberOfGraphGenerationAttempts }
    set maxNumberOfGraphGenerationAttempts (value: number) {
      if (value < 1) {
        console.log(value)
        console.log(value < 1)
        console.log(this._maxNumberOfGraphGenerationAttempts)
        throw new Error('Max number of graph generation attempts must be positive')
      }
      this._maxNumberOfGraphGenerationAttempts = value
    }

    get robotCount (): number { return this._robotCount }
    set robotCount (value: number) {
      if (value < 0) { throw new Error('Robot count must be non-negative') }
      this._robotCount = value
    }

    get robotStartingNode (): number { return this._robotStartingNode }
    set robotStartingNode (value: number) {
      if (value < 0 || value >= this.nodeCount) { throw new Error('Starting node must be in [0, nodeCount)') }
      this._robotStartingNode = value
    }
}
