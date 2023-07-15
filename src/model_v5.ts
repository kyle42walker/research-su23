import { Nodes, Edges, Layouts } from 'v-network-graph'

// interface _Node {
//     name?: string;
//     [x: string]: any;
// }
// type Nodes = Record<string, _Node>;

// interface Edge {
//     source: string;
//     target: string;
//     [x: string]: any;
// }
// type Edges = Record<string, Edge>;

// interface Position {
//     x: number;
//     y: number;
// }
// interface FixablePosition extends Position {
//     fixed?: boolean;
// }
// type NodePositions = Record<string, FixablePosition>;
// interface Layouts {
//     nodes: NodePositions;
// }

export enum GraphType { ErdosRenyiRandomGraph, Path, Cycle, CompleteGraph }
export enum LayoutType { Random, Circular, ForceDirected }

class Graph {
  nodes: Nodes = {}
  edges: Edges = {}
  isDirected: boolean

  private nodeCount = 0

  constructor (isDirected = false) {
    this.isDirected = isDirected
  }

  // Time complexity: O(1)
  AddNode (weight = 1) {
    const id = (this.nodeCount++).toString()
    this.nodes[id] = { name: id, weight: weight }
  }

  // Time complexity: O(1)
  AddEdge (sourceId: string, targetId: string, weight = 1) {
    this.edges[`edge-${sourceId}-${targetId}`] = {
      source: sourceId.toString(),
      target: targetId.toString(),
      weight: weight
    }

    if (this.isDirected || sourceId === targetId) { return }

    this.edges[`edge-${targetId}-${sourceId}`] = {
      source: targetId.toString(),
      target: sourceId.toString(),
      weight: weight
    }
  }

  // Time complexity: O(1)
  RemoveNode (nodeId: string) {
    delete this.nodes[nodeId]
  }

  // Time complexity: O(1)
  RemoveEdge (edgeId: string) {
    delete this.edges[edgeId]

    if (this.isDirected) { return }

    const [sourceId, targetId] = edgeId.split('-').slice(1)
    delete this.edges[`edge-${targetId}-${sourceId}`]
  }

  // Time complexity: O(1)
  RemoveEdgeBetweenNodes (sourceId: string, targetId: string) {
    this.RemoveEdge(`edge-${sourceId}-${targetId}`)

    if (this.isDirected || sourceId === targetId) { return }

    this.RemoveEdge(`edge-${targetId}-${sourceId}`)
  }

  // Time complexity: O(1)
  SetNodeWeight (nodeId: string, weight: number) {
    this.nodes[nodeId].weight = weight
  }

  // Time complexity: O(1)
  SetEdgeWeight (edgeId: string, weight: number) {
    this.edges[edgeId].weight = weight

    if (this.isDirected) { return }

    const [sourceId, targetId] = edgeId.split('-').slice(1)
    this.edges[`edge-${targetId}-${sourceId}`].weight = weight
  }

  // Time complexity: O(|E|)
  GetAdjacentNodes (nodeId: string): string[] {
    const adjacentNodes: string[] = []

    Object.values(this.edges).forEach((edge) => {
      if (edge.source === nodeId) { adjacentNodes.push(edge.target) }
    })

    return adjacentNodes
  }

  // Time complexity: O(1)
  EdgeExists (sourceId: string, targetId: string): boolean {
    // return Object.hasOwnProperty.call(this.edges, `edge-${nodeId1}-${nodeId2}`)
    return this.edges[`edge-${sourceId}-${targetId}`] !== undefined
  }
}

class GraphGenerator {
  static GenerateErdosRenyiRandomGraph (n: number, p: number, isDirected = false, allowSelfLoops = false): Graph {
    const graph = new Graph(isDirected)

    // Create n nodes
    for (let i = 0; i < n; i++) {
      graph.AddNode()
    }

    // Loop over all pairs of nodes
    // If the random number is less than p, add an edge between them
    for (let i = 0; i < n; i++) {
      for (let j = isDirected ? 0 : i; j < n; j++) { // If undirected, only loop over half the pairs
        if ((i !== j || allowSelfLoops) && Math.random() < p) { // Don't add self-loops unless allowed
          graph.AddEdge(i.toString(), j.toString())
        }
      }
    }

    return graph
  }

  static GeneratePath (n: number, isDirected = false): Graph {
    const graph = new Graph(isDirected)

    graph.AddNode() // Root node

    // Create n nodes and connect each new node to the previous one
    for (let i = 1; i < n; i++) {
      graph.AddNode()
      graph.AddEdge((i - 1).toString(), i.toString())
    }

    return graph
  }

  static GenerateCycle (n: number, isDirected = false): Graph {
    // Geneate a path with n nodes
    const graph = GraphGenerator.GeneratePath(n, isDirected)

    // Connect the last node to the first one
    graph.AddEdge((n - 1).toString(), '0')

    return graph
  }

  static GenerateCompleteGraph (n: number, isDirected = false, allowSelfLoops = false): Graph {
    const graph = new Graph(isDirected)

    // Create n nodes
    for (let i = 0; i < n; i++) {
      graph.AddNode()
    }

    // Loop over all pairs of nodes
    for (let i = 0; i < n; i++) {
      for (let j = isDirected ? 0 : i; j < n; j++) { // If undirected, only loop over half the pairs
        if ((i !== j || allowSelfLoops)) { // Don't add self-loops unless allowed
          graph.AddEdge(i.toString(), j.toString())
        }
      }
    }

    return graph
  }

  // GenerateBarabasiAlbertScaleFreeGraph(n: number, m: number, isDirected = false, allowSelfLoops = false): Graph {
  //     const graph = new Graph(isDirected)

  //     // Create n nodes
  //     for (let i = 0; i < n; i++) {
  //         graph.AddNode()
  //     }

  // }

  // GenerateWattsStrogatzSmallWorldGraph(n: number, k: number, p: number, isDirected = false, allowSelfLoops = false): Graph {
  //     const graph = new Graph(isDirected)

  //     // Create n nodes
  //     for (let i = 0; i < n; i++) {
  //         graph.AddNode()
  //     }

  // }
}

class LayoutGenerator {
  static PositionNodesRandomly (graph: Graph, width: number, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    Object.keys(graph.nodes).forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: Math.random() * width,
        y: Math.random() * height
      }
    })

    return layouts
  }
}

class VisualGraph {
  nodes: Nodes = {}
  edges: Edges = {}
  layouts: Layouts = {
    nodes: {}
  }
}

export class Model {
  visualGraph: VisualGraph = {
    nodes: {},
    edges: {},
    layouts: {
      nodes: {}
    }
  }

  CreateNewGraph (graphType: GraphType, layoutType: LayoutType, numberOfNodes: number, isDirected: boolean, allowSelfLoops: boolean) {
    let graph: Graph, layouts: Layouts

    switch (graphType) {
      case GraphType.ErdosRenyiRandomGraph:
        graph = GraphGenerator.GenerateErdosRenyiRandomGraph(numberOfNodes, 0.3, isDirected, allowSelfLoops)
        break
      case GraphType.Path:
        graph = GraphGenerator.GeneratePath(numberOfNodes, isDirected)
        break
      case GraphType.Cycle:
        graph = GraphGenerator.GenerateCycle(numberOfNodes, isDirected)
        break
      case GraphType.CompleteGraph:
        graph = GraphGenerator.GenerateCompleteGraph(numberOfNodes, isDirected, allowSelfLoops)
        break
      default:
        throw new Error('Invalid graph type')
    }

    switch (layoutType) {
      case LayoutType.Random:
        layouts = LayoutGenerator.PositionNodesRandomly(graph, 1000, 1000)
        break
      default:
        throw new Error('Invalid layout type')
    }

    this.visualGraph.nodes = graph.nodes
    this.visualGraph.edges = graph.edges
    this.visualGraph.layouts = layouts
  }

  GetData () {
    return this.visualGraph
  }
}

// const g = new Graph(true)
// g.AddNode()
// g.AddNode()
// g.AddNode()
// g.AddNode()
// g.AddNode()
// g.AddNode() // 5
// g.AddEdge('1', '0')
// g.AddEdge('1', '2')
// g.AddEdge('5', '1')
// g.AddEdge('4', '5')

// console.log(g)
// console.log(g.EdgeExists('5', '4'))
// console.log(g.EdgeExists('4', '4'))
// console.log(g.EdgeExists('5', '1'))

// const rg = GraphGenerator.GenerateErdosRenyiRandomGraph(10, 1, true, true)
// console.log(rg)

// const m = new Model()
// m.createNewGraph(GraphType.ErdosRenyiRandomGraph, LayoutType.Random, 10, true, true)
