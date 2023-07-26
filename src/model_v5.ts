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
export enum LayoutType { Random, Circular, LinearHorizontal, LinearVertical, TreeHorizontal, ForceDirected }

class Graph {
  nodes: Nodes = {}
  edges: Edges = {}
  isDirected: boolean

  private nodeIdCount = 0
  private edgeIdCount = 0

  constructor (isDirected = false) {
    this.isDirected = isDirected
  }

  GetNodeIds (): string[] {
    return Object.keys(this.nodes)
  }

  // Time complexity: O(1)
  AddNode (weight = 1) {
    const id = (this.nodeIdCount++).toString()
    this.nodes[id] = { name: id, weight: weight, ports: new Array<string>() }
  }

  // Time complexity: O(1)
  AddEdge (sourceId: string, targetId: string, weight = 1) {
    const edgeId = (this.edgeIdCount++).toString()
    this.edges[edgeId] = {
      source: sourceId.toString(),
      target: targetId.toString(),
      weight: weight
    }

    this.nodes[sourceId].ports.push(edgeId)
    this.nodes[targetId].ports.push(edgeId)
  }

  // Time complexity: O(1)
  RemoveNode (nodeId: string) {
    delete this.nodes[nodeId]
  }

  // Time complexity: O(|D|)
  RemoveEdge (edgeId: string) {
    delete this.edges[edgeId]

    // Remove the edge from the port lists of the source and target nodes
    const sourceId = this.edges[edgeId].source
    const targetId = this.edges[edgeId].target
    this.nodes[sourceId].ports = this.nodes[sourceId].ports.filter(
      (portEdgeId: string) => portEdgeId !== edgeId)
    this.nodes[targetId].ports = this.nodes[targetId].ports.filter(
      (portEdgeId: string) => portEdgeId !== edgeId)
  }

  // Time complexity: O(1)
  SetNodeWeight (nodeId: string, weight: number) {
    this.nodes[nodeId].weight = weight
  }

  // Time complexity: O(1)
  SetEdgeWeight (edgeId: string, weight: number) {
    this.edges[edgeId].weight = weight
  }

  // Time complexity: O(|D|)
  GetAdjacentNodes (nodeId: string): string[] {
    const adjacentNodes: string[] = []

    this.GetPorts(nodeId).forEach((portEdgeId: string) => {
      const sourceId = this.edges[portEdgeId].source
      const targetId = this.edges[portEdgeId].target
      if (sourceId === nodeId) { adjacentNodes.push(targetId) }
      if (!this.isDirected && targetId === nodeId) { adjacentNodes.push(sourceId) }
    })

    return adjacentNodes
  }

  // Time complexity: O(1)
  // Ports are the edge ids of incident edges
  GetPorts (nodeId: string): string[] {
    return this.nodes[nodeId].ports
  }

  // Time complexity: O(|E|)
  // sourceId and targetId are node ids
  EdgeExists (sourceId: string, targetId: string): boolean {
    return this.nodes[sourceId].ports.some((portEdgeId: string) => {
      const edge = this.edges[portEdgeId]
      return edge.source === sourceId && edge.target === targetId
    })
  }

  // Time complexity: O(1)
  GetNodeCount (): number {
    return Object.keys(this.nodes).length
  }

  GetNodeDepth (nodeId: string): number {
    const visited: boolean[] = new Array(this.GetNodeCount()).fill(false)
    const queue: string[] = []

    // Assume first node is root
    const startNode = Object.keys(this.nodes)[0]
    queue.push(startNode)

    // BFS
    let depth = 0
    while (queue.length > 0) {
      const currentNode = queue.shift() as string
      visited[parseInt(currentNode)] = true
      
      // Add all adjacent nodes to the queue
      this.GetAdjacentNodes(currentNode).forEach((adjacentNode) => {
        if (!visited[parseInt(adjacentNode)]) {
          queue.push(adjacentNode)
        }
      })

      if (currentNode === nodeId) {
        return depth
      }
      depth++
    }

    return -1
  }


  // Time complexity: O(|V| + |E|)
  IsConnected (): boolean {
    const visited: boolean[] = new Array(this.GetNodeCount()).fill(false)
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

// class Robot {
//   // TODO: this should have a queue
//   BreadthFirstSearch (graph: Graph, startNode: string, endNode: string): string[] {
//     const numberOfNodes = Object.keys(graph.nodes).length
//     const visited: boolean[] = new Array(numberOfNodes).fill(false)
//     const path: string[] = []

//     path.push(startNode)

//     for (let i = 0; i < numberOfNodes; i++) {
//       const currentNode = path[i]
//       visited[parseInt(currentNode)] = true

//       if (currentNode === endNode) { break }

//       // Add all adjacent nodes to the path
//       graph.GetAdjacentNodes(currentNode).forEach((adjacentNode) => {
//         if (!visited[parseInt(adjacentNode)]) {
//           path.push(adjacentNode)
//         }
//       })
//     }

//     return path
//   }

//   // TODO: finish this
//   RandomWander (graph: Graph, startNode: string, numberOfSteps: number): string[] {
//     const path: string[] = []

//     path.push(startNode)

//     for (let i = 0; i < numberOfSteps; i++) {
//       const currentNode = path[i]

//       // Add a random adjacent node to the path
//       const adjacentNodes = graph.GetAdjacentNodes(currentNode)
//       const randomAdjacentNode = adjacentNodes[Math.floor(Math.random() * adjacentNodes.length)]
//       path.push(randomAdjacentNode)
//     }

//     return path
//   }
// }

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

    graph.GetNodeIds().forEach((nodeId) => {
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

    const angleStep = 2 * Math.PI / graph.GetNodeCount()

    let angle = 0
    graph.GetNodeIds().forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      }
      angle += angleStep
    })

    return layouts
  }

  static GenerateLinearHorizontalLayout (graph: Graph, width: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const xStep = width / graph.GetNodeCount()

    let x = 0
    graph.GetNodeIds().forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: x,
        y: 0
      }
      x += xStep
    })

    return layouts
  }

  static GenerateLinearVerticalLayout (graph: Graph, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const yStep = height / graph.GetNodeCount()

    let y = 0
    graph.GetNodeIds().forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: 0,
        y: y
      }
      y += yStep
    })

    return layouts
  }

  // Layout the graph in a tree-like structure
  // The root is placed on the top left
  // The deepest node is placed on the top right
  // The algorithm starts with the deepest node,
  // and moves up the tree
  static GenerateTreeHorizontalLayout (graph: Graph, width: number, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    // Find the deepest node and its depth
    let deepestNode: string, depth = 0
    graph.GetNodeIds().forEach((nodeId) => {
      const nodeDepth = graph.GetNodeDepth(nodeId)
      if (nodeDepth > depth) {
        deepestNode = nodeId
        depth = nodeDepth
      }
    })

    // Get the parent of the deepest node
    

    return layouts
  }

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
        graph = GraphGenerator.GenerateErdosRenyiRandomGraph(numberOfNodes, 0.1, isDirected, allowSelfLoops, true, 50)
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

    switch (layoutType) {
      case LayoutType.Random:
        layouts = LayoutGenerator.GenerateRandomLayout(graph, this.windowWidth, this.windowHeight)
        break
      case LayoutType.Circular:
        layouts = LayoutGenerator.GenerateCircularLayout(graph, this.windowWidth, this.windowHeight)
        break
      case LayoutType.LinearHorizontal:
        layouts = LayoutGenerator.GenerateLinearHorizontalLayout(graph, this.windowWidth)
        break
      case LayoutType.LinearVertical:
        layouts = LayoutGenerator.GenerateLinearVerticalLayout(graph, this.windowHeight)
        break
      case LayoutType.TreeHorizontal:
        layouts = LayoutGenerator.GenerateTreeHorizontalLayout(graph, this.windowWidth, this.windowHeight)
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
