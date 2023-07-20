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

export enum GraphType { ErdosRenyiRandomGraph, Path, Cycle, Tree, CompleteGraph }
export enum LayoutType { Random, Circular, Linear, Tree, ForceDirected }

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

    // if (this.isDirected || sourceId === targetId) { return }

    // this.edges[`edge-${targetId}-${sourceId}`] = {
    //   source: targetId.toString(),
    //   target: sourceId.toString(),
    //   weight: weight
    // }
  }

  // Time complexity: O(1)
  RemoveNode (nodeId: string) {
    delete this.nodes[nodeId]
  }

  // Time complexity: O(1)
  RemoveEdge (edgeId: string) {
    delete this.edges[edgeId]

    // if (this.isDirected) { return }

    // const [sourceId, targetId] = edgeId.split('-').slice(1)
    // delete this.edges[`edge-${targetId}-${sourceId}`]
  }

  // Time complexity: O(1)
  RemoveEdgeBetweenNodes (sourceId: string, targetId: string) {
    this.RemoveEdge(`edge-${sourceId}-${targetId}`)

    // if (this.isDirected || sourceId === targetId) { return }

    // this.RemoveEdge(`edge-${targetId}-${sourceId}`)
  }

  // Time complexity: O(1)
  SetNodeWeight (nodeId: string, weight: number) {
    this.nodes[nodeId].weight = weight
  }

  // Time complexity: O(1)
  SetEdgeWeight (edgeId: string, weight: number) {
    this.edges[edgeId].weight = weight

    // if (this.isDirected) { return }

    // const [sourceId, targetId] = edgeId.split('-').slice(1)
    // this.edges[`edge-${targetId}-${sourceId}`].weight = weight
  }

  // Time complexity: O(|E|)
  GetAdjacentNodes (nodeId: string): string[] {
    const adjacentNodes: string[] = []

    Object.values(this.edges).forEach((edge) => {
      if (edge.source === nodeId) { adjacentNodes.push(edge.target) }
      if (!this.isDirected && edge.target === nodeId) { adjacentNodes.push(edge.source) }
    })

    return adjacentNodes
  }

  // Time complexity: O(1)
  EdgeExists (sourceId: string, targetId: string): boolean {
    // return Object.hasOwnProperty.call(this.edges, `edge-${nodeId1}-${nodeId2}`)
    return (this.edges[`edge-${sourceId}-${targetId}`] !== undefined) || (!this.isDirected && (this.edges[`edge-${targetId}-${sourceId}`] !== undefined))
  }

  // Time complexity: O(|V| + |E|)
  IsConnected (): boolean {
    const visited: boolean[] = new Array(Object.keys(this.nodes).length).fill(false)
    const queue: string[] = []

    // Pick a random node
    const startNode = Object.keys(this.nodes)[0]
    queue.push(startNode)

    while (queue.length > 0) {
      const currentNode = queue.shift() as string
      visited[parseInt(currentNode)] = true

      // Add all adjacent nodes to the queue
      this.GetAdjacentNodes(currentNode).forEach((adjacentNode) => {
        if (!visited[parseInt(adjacentNode)]) {
          queue.push(adjacentNode)
        }
      })
    }

    // If any node was not visited, the graph is not connected
    return !visited.includes(false)
  }
}

class Robot {
  // TODO: this should have a queue
  BreadthFirstSearch (graph: Graph, startNode: string, endNode: string): string[] {
    const numberOfNodes = Object.keys(graph.nodes).length
    const visited: boolean[] = new Array(numberOfNodes).fill(false)
    const path: string[] = []

    path.push(startNode)

    for (let i = 0; i < numberOfNodes; i++) {
      const currentNode = path[i]
      visited[parseInt(currentNode)] = true

      if (currentNode === endNode) { break }

      // Add all adjacent nodes to the path
      graph.GetAdjacentNodes(currentNode).forEach((adjacentNode) => {
        if (!visited[parseInt(adjacentNode)]) {
          path.push(adjacentNode)
        }
      })
    }

    return path
  }

  // TODO: finish this
  RandomWander (graph: Graph, startNode: string, numberOfSteps: number): string[] {
    const path: string[] = []

    path.push(startNode)

    for (let i = 0; i < numberOfSteps; i++) {
      const currentNode = path[i]

      // Add a random adjacent node to the path
      const adjacentNodes = graph.GetAdjacentNodes(currentNode)
      const randomAdjacentNode = adjacentNodes[Math.floor(Math.random() * adjacentNodes.length)]
      path.push(randomAdjacentNode)
    }

    return path
  }
}

class GraphGenerator {
  static GenerateErdosRenyiRandomGraph (n: number, p: number, isDirected = false, allowSelfLoops = false, requireConnected = false, maxNumberOfAttempts = 5): Graph {
    let continueUnitlConnected = requireConnected
    let graph: Graph

    do {
      graph = new Graph(isDirected)

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

      continueUnitlConnected = requireConnected && !graph.IsConnected() && maxNumberOfAttempts-- > 0
    } while (continueUnitlConnected)
    if (maxNumberOfAttempts <= 0) { throw new Error('Could not generate a connected graph') }
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

  static GenerateTree (n: number, isDirected = false): Graph {
    const graph = new Graph(isDirected)

    graph.AddNode() // Root node

    // Create n nodes and connect each new node to a random existing node
    for (let i = 1; i < n; i++) {
      graph.AddNode()
      const randomExistingNode = Math.floor(Math.random() * i)
      graph.AddEdge(randomExistingNode.toString(), i.toString())
    }

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
  static GenerateRandomLayout (graph: Graph, width: number, height: number): Layouts {
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

  static GenerateCircularLayout (graph: Graph, width: number, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const radius = Math.min(width, height) / 2 * 0.9

    const nodeCount = Object.keys(graph.nodes).length
    const angleStep = 2 * Math.PI / nodeCount

    let angle = 0
    Object.keys(graph.nodes).forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      }
      angle += angleStep
    })

    return layouts
  }

  static GenerateLinearLayout (graph: Graph, width: number, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const nodeCount = Object.keys(graph.nodes).length
    const xStep = width / nodeCount

    let x = 0
    Object.keys(graph.nodes).forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: x,
        y: 0
      }
      x += xStep
    })

    return layouts
  }

  // static GenerateTreeLayout (graph: Graph, width: number, height: number): Layouts {
  //   const layouts: Layouts = {
  //     nodes: {}
  //   }

  //   const layer1 = graph.GetAdjacentNodes('0').length

  //   return layouts
  // }

  // static GenerateForceDirectedLayout(graph: Graph, width: number, height: number): Layouts {
  //   // Set initial positions randomly
  //   const layouts: Layouts = this.GenerateRandomLayout(graph, width, height)

  //   // Compute the force on each node

  // }
}

export class Model {
  visualGraph = {
    nodes: {},
    edges: {},
    layouts: {
      nodes: {}
    }
  }

  windowWidth: number
  windowHeight: number

  constructor (width: number, height: number) {
    this.windowWidth = width
    this.windowHeight = height
  }

  CreateNewGraph (graphType: GraphType, layoutType: LayoutType, numberOfNodes: number, isDirected: boolean, allowSelfLoops: boolean) {
    let graph: Graph, layouts: Layouts

    switch (graphType) {
      case GraphType.ErdosRenyiRandomGraph:
        graph = GraphGenerator.GenerateErdosRenyiRandomGraph(numberOfNodes, 0.3, isDirected, allowSelfLoops, true, 50)
        break
      case GraphType.Path:
        graph = GraphGenerator.GeneratePath(numberOfNodes, isDirected)
        break
      case GraphType.Cycle:
        graph = GraphGenerator.GenerateCycle(numberOfNodes, isDirected)
        break
      case GraphType.Tree:
        graph = GraphGenerator.GenerateTree(numberOfNodes, isDirected)
        break
      case GraphType.CompleteGraph:
        graph = GraphGenerator.GenerateCompleteGraph(numberOfNodes, isDirected, allowSelfLoops)
        break
      default:
        throw new Error('Invalid graph type')
    }
    console.log(graph.IsConnected())

    switch (layoutType) {
      case LayoutType.Random:
        layouts = LayoutGenerator.GenerateRandomLayout(graph, this.windowWidth, this.windowHeight)
        break
      case LayoutType.Circular:
        layouts = LayoutGenerator.GenerateCircularLayout(graph, this.windowWidth, this.windowHeight)
        break
      case LayoutType.Linear:
        layouts = LayoutGenerator.GenerateLinearLayout(graph, this.windowWidth, this.windowHeight)
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
