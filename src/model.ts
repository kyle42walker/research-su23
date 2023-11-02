import { Graph, GraphGenerator } from './graph'
import * as robot from './robot'

export enum GraphType { Path, Cycle, Complete, ErdosRenyiRandom, ArbitraryTree, BinaryTree }
export enum RobotType { RandomWalkDispersion, RandomWalkExploration, TreeExplorationGlobal }

export class Model {
  private _graph: Graph = {} as Graph
  public graphType: GraphType = GraphType.Path
  private _nodeCount = 0
  private _edgeProbability = 0.5
  public isDirected = false
  public allowSelfLoops = false
  public requireConnected = false
  private _maxNumberOfGraphGenerationAttempts = 10

  public robotCoordinator: robot.RobotCoordinator = {} as robot.RobotCoordinator
  public robotType: RobotType = RobotType.RandomWalkDispersion
  private _robotCount = 0
  private _robotStartingNode = 0
  private _currentStep = 0
  private _lambda = Infinity // Number of steps between edge shuffling
  private _edgeSurvivalProbability = 1 // Probability that an edge survives shuffling

  constructor () {
    this.generateGraph()
    this.generateRobots()
  }

  generateGraph () {
    switch (this.graphType) {
      case GraphType.ErdosRenyiRandom:
        this._graph = GraphGenerator.generateErdosRenyiRandomGraph(
          this.nodeCount,
          this.edgeProbability,
          this.isDirected,
          this.allowSelfLoops,
          this.requireConnected,
          this.maxNumberOfGraphGenerationAttempts
        )
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
      case GraphType.ArbitraryTree:
        this._graph = GraphGenerator.generateArbitraryTree(this.nodeCount, this.isDirected)
        break
      case GraphType.BinaryTree:
        this._graph = GraphGenerator.generateBinaryTree(this.nodeCount, this.isDirected)
        break
      default:
        throw new Error(`Invalid graph type: ${this.graphType}`)
    }
  }

  generateRobots () {
    switch (this.robotType) {
      case RobotType.RandomWalkDispersion:
        this.robotCoordinator = new robot.RandomWalkDispersionRobotCoordinator(this.graph, this.lambda, this.edgeSurvivalProbability, this.robotCount, this.robotStartingNode)
        break
      case RobotType.RandomWalkExploration:
        this.robotCoordinator = new robot.RandomWalkExplorationRobotCoordinator(this.graph, this.lambda, this.edgeSurvivalProbability, this.robotCount, this.robotStartingNode)
        break
      case RobotType.TreeExplorationGlobal:
        this.robotCoordinator = new robot.TreeExplorationWithGlobalCommunicationRobotCoordinator(this.graph, this.lambda, this.edgeSurvivalProbability, this.robotCount, this.robotStartingNode)
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
      throw new Error('Max number of graph generation attempts must be positive')
    }
    this._maxNumberOfGraphGenerationAttempts = value
  }

  get robots (): robot.Robot[] { return this.robotCoordinator.robots }

  get visitedNodes (): boolean[] { return this.robotCoordinator.visitedNodes }

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

  get stepCount (): number { return this.robotCoordinator.stepNumber }

  get currentStep (): number { return this._currentStep }
  set currentStep (value: number) {
    if (value < 0 || value >= this.stepCount) { throw new Error('Current step must be in [0, stepCount)') }
    this._currentStep = value
  }

  get lambda (): number { return this._lambda }
  set lambda (value: number) {
    if (!((value > 0 && Number.isInteger(value)) || value === Infinity)) { throw new Error('Lambda must be a positive integer or Infinity') }
    this._lambda = value
  }

  get edgeSurvivalProbability (): number { return this._edgeSurvivalProbability }
  set edgeSurvivalProbability (value: number) {
    if (value < 0 || value > 1) { throw new Error('Edge survival probability must be in [0, 1]') }
    this._edgeSurvivalProbability = value
  }

  get numberOfRobotsOnEachNode (): number[] {
    const numberOfRobotsOnEachNode = new Array(this.nodeCount).fill(0)
    this.robots.forEach((robot) => {
      numberOfRobotsOnEachNode[robot.currentNode]++
    })
    return numberOfRobotsOnEachNode
  }
}
