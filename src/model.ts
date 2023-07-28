import { Graph, GraphGenerator } from './graph'
import { RandomWalkRobotCoordinator } from './robot'

export enum GraphType { ErdosRenyiRandom, Path, Cycle, Complete }

export class Model {
    // graph: Graph
    // robotCoordinator: RandomWalkRobotCoordinator

    graphType: GraphType
    nodeCount: number
    edgeProbability: number
    isDirected: boolean
    allowSelfLoops: boolean
    requireConnected: boolean
    maxNumberOfGraphGenerationAttempts: number

    constructor () {
        this.graphType = GraphType.ErdosRenyiRandom
        this.nodeCount = 0
        this.edgeProbability = 0
        this.isDirected = false
        this.allowSelfLoops = false
        this.requireConnected = false
        this.maxNumberOfGraphGenerationAttempts = 10

    }

    generateGraph (): Graph {
        let graph: Graph
        switch (this.graphType) {
            case GraphType.ErdosRenyiRandom:
                do {
                graph = GraphGenerator.generateErdosRenyiRandomGraph(
                    this.nodeCount, 
                    this.edgeProbability, 
                    this.isDirected, 
                    this.allowSelfLoops
                )
                } while (this.requireConnected && !graph.isConnected() && --this.maxNumberOfGraphGenerationAttempts > 0)
                if (this.maxNumberOfGraphGenerationAttempts === 0) { throw new Error('Could not generate a connected graph') }
                break
            case GraphType.Path:
                graph = GraphGenerator.generatePath(this.nodeCount, this.isDirected)
                break
            case GraphType.Cycle:
                graph = GraphGenerator.generateCycle(this.nodeCount, this.isDirected)
                break
            case GraphType.Complete:
                graph = GraphGenerator.generateCompleteGraph(this.nodeCount, this.isDirected, this.allowSelfLoops)
                break
            default:
                throw new Error(`Invalid graph type: ${this.graphType}`)
        }
        return graph
    }
}