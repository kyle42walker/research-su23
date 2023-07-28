import { Graph, GraphGenerator } from './graph'
// import { RobotCoordinator } from './robot'

export enum GraphType { Path, Cycle, Complete, ErdosRenyiRandom }

export class Model {
    graph: Graph = {} as Graph
    private _graphType: GraphType = GraphType.Path
    private _nodeCount = 0
    private _edgeProbability = 0.5
    private _isDirected = false
    private _allowSelfLoops = false
    private _requireConnected = false
    private _maxNumberOfGraphGenerationAttempts = 10

    // robotCoordinator: RobotCoordinator = {} as RandomWalkRobotCoordinator

    constructor () {
      this.generateGraph()
    }

    generateGraph () {
      switch (this._graphType) {
        case GraphType.ErdosRenyiRandom:
          do {
            this.graph = GraphGenerator.generateErdosRenyiRandomGraph(
              this._nodeCount,
              this._edgeProbability,
              this._isDirected,
              this._allowSelfLoops
            )
          } while (this._requireConnected && !this.graph.isConnected() && --this._maxNumberOfGraphGenerationAttempts > 0)
          if (this._maxNumberOfGraphGenerationAttempts === 0) { throw new Error('Could not generate a connected graph') }
          break
        case GraphType.Path:
          this.graph = GraphGenerator.generatePath(this._nodeCount, this._isDirected)
          break
        case GraphType.Cycle:
          this.graph = GraphGenerator.generateCycle(this._nodeCount, this._isDirected)
          break
        case GraphType.Complete:
          this.graph = GraphGenerator.generateCompleteGraph(this._nodeCount, this._isDirected, this._allowSelfLoops)
          break
        default:
          throw new Error(`Invalid graph type: ${this._graphType}`)
      }
    }

    // Getters and setters

    get graphType (): GraphType { return this._graphType }
    set graphType (value: GraphType) { this._graphType = value }

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

    get isDirected (): boolean { return this._isDirected }
    set isDirected (value: boolean) { this._isDirected = value }

    get allowSelfLoops (): boolean { return this._allowSelfLoops }
    set allowSelfLoops (value: boolean) { this._allowSelfLoops = value }

    get requireConnected (): boolean { return this._requireConnected }
    set requireConnected (value: boolean) { this._requireConnected = value }

    get maxNumberOfGraphGenerationAttempts (): number { return this._maxNumberOfGraphGenerationAttempts }
    set maxNumberOfGraphGenerationAttempts (value: number) {
      if (value < 1) { throw new Error('Max number of graph generation attempts must be positive') }
      this._maxNumberOfGraphGenerationAttempts = value
    }
}
