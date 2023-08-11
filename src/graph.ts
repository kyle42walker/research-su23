type Edge = {weight: number, targetNode: number}
type Vertex = {weight: number, edges: Edge[]}

export class Graph {
    nodes: Vertex[] = []
    isDirected: boolean

    constructor (isDirected = false) {
      this.isDirected = isDirected
    }

    // Time complexity: O(1) amortized
    addNode (nodeWeight = 1) {
      this.nodes.push({ weight: nodeWeight, edges: [] })
    }

    // Time complexity: O(1) amortized
    // Assumes sourceId and targetId are valid and an edge is not already present
    addEdge (sourceId: number, targetId: number, edgeWeight = 1) {
      this.nodes[sourceId].edges.push({ weight: edgeWeight, targetNode: targetId })

      if (this.isDirected) { return }

      this.nodes[targetId].edges.push({ weight: edgeWeight, targetNode: sourceId })
    }

    // Time complexity: O(|V| * |E|)
    // Assumes nodeId is valid
    removeNode (nodeId: number) {
      // Remove the node
      this.nodes.splice(nodeId, 1)

      this.nodes.forEach((node) => {
        node.edges.forEach((edge, i) => {
          // Remove all edges that point to the removed node
          if (edge.targetNode === nodeId) {
            node.edges.splice(i, 1)
          }

          // Update all edges that point to nodes after the removed node
          if (edge.targetNode > nodeId) {
            edge.targetNode--
          }
        })
      })
    }

    // Time complexity: O(|D|)
    // Assumes sourceId and targetId are valid
    removeEdge (sourceId: number, targetId: number) {
      // Remove the edge using splice to avoid creating a new array
      const edgeIndex = this.nodes[sourceId].edges.findIndex(edge => edge.targetNode === targetId)
      this.nodes[sourceId].edges.splice(edgeIndex, 1)

      if (this.isDirected) { return }

      const reverseIndex = this.nodes[targetId].edges.findIndex(edge => edge.targetNode === sourceId)
      this.nodes[targetId].edges.splice(reverseIndex, 1)
    }

    // Time complexity: O(1)
    // Assumes nodeId is valid
    setNodeWeight (nodeId: number, weight: number) {
      this.nodes[nodeId].weight = weight
    }

    // Time complexity: O(|D|)
    // Assumes sourceId and targetId are valid
    setEdgeWeight (sourceId: number, targetId: number, weight: number) {
      const edge = this.nodes[sourceId].edges.find(edge => edge.targetNode === targetId)
      if (edge) { edge.weight = weight }

      if (this.isDirected) { return }

      const reverseEdge = this.nodes[targetId].edges.find(edge => edge.targetNode === sourceId)
      if (reverseEdge) { reverseEdge.weight = weight }
    }

    getNodeIds (): number[] {
      return this.nodes.map((_, i) => i)
    }

    // Time complexity: O(|1|)
    getNodeWeight (nodeId: number): number {
      return this.nodes[nodeId].weight
    }

    // Time complexity: O(|D|)
    getEdgeWeight (sourceId: number, targetId: number): number {
      const edge = this.nodes[sourceId].edges.find(edge => edge.targetNode === targetId)
      if (edge) { return edge.weight }

      return 0
    }

    // Time complexity: O(1)
    getNodeCount (): number {
      return this.nodes.length
    }

    // Time complexity: O(1)
    getEdgeCount (): number {
      const count = this.nodes.reduce((acc, node) => acc + node.edges.length, 0)
      return this.isDirected ? count : count / 2
    }

    // Time complexity: O(|D|)
    getAdjacentNodes (nodeId: number): number[] {
      return this.nodes[nodeId].edges.map(edge => edge.targetNode)
    }

    // Time complexity: O(|D|)
    getChildNodes (nodeId: number, parentId: number): number[] {
      return this.getAdjacentNodes(nodeId).filter(node => node !== parentId)
    }

    // Time complexity: O(1)
    // Ports are the indices of the edges in the node's edge array
    getNumberOfPorts (nodeId: number): number {
      return this.nodes[nodeId].edges.length
    }

    // Time complexity: O(1)
    getAdjacentNodeFromPort (nodeId: number, port: number): number {
      return this.nodes[nodeId].edges[port].targetNode
    }

    // Time complexity: O(|D|)
    // Returns -1 if not found
    getPortFromAdjacentNode (nodeId: number, adjacentNodeId: number): number {
      return this.nodes[nodeId].edges.findIndex(edge => edge.targetNode === adjacentNodeId)
    }

    // Time complexity: O(|V| + |E|)
    // Returns the shortest path from sourceId to targetId in nodes traversed
    // Returns null if no path exists
    // Uses BFS
    getShortestPath (sourceId: number, targetId: number): number[] | null {
      const visited: boolean[] = new Array(this.getNodeCount()).fill(false)
      const queue: number[] = []
      const path: number[] = []

      queue.push(sourceId)

      while (queue.length > 0) {
        const currentNode = queue.shift() as number
        visited[currentNode] = true

        if (currentNode === targetId) {
          path.push(currentNode)
          break
        }

        path.push(currentNode)

        this.getAdjacentNodes(currentNode).forEach((adjacentNode) => {
          if (!visited[adjacentNode]) {
            queue.push(adjacentNode)
          }
        })
      }

      if (path[path.length - 1] !== targetId) {
        return null
      }

      return path
    }

    // Time complexity: O(|V| + |E|)
    getDistanceBetweenNodes (sourceId: number, targetId: number): number {
      const shortestPath = this.getShortestPath(sourceId, targetId)
      if (shortestPath === null) {
        return Infinity
      }

      return shortestPath.length - 1
    }

    getDepth (rootId: number): number {
      const visited: boolean[] = new Array(this.getNodeCount()).fill(false)
      const queue: number[] = []
      const depth: number[] = []

      queue.push(rootId)
      depth[rootId] = 0

      while (queue.length > 0) {
        const currentNode = queue.shift() as number
        visited[currentNode] = true

        this.getAdjacentNodes(currentNode).forEach((adjacentNode) => {
          if (!visited[adjacentNode]) {
            queue.push(adjacentNode)
            depth[adjacentNode] = depth[currentNode] + 1
          }
        })
      }

      return Math.max(...depth)
    }

    // Time complexity: O(|V| + |E|)
    isConnected (): boolean {
      const visited: boolean[] = new Array(this.getNodeCount()).fill(false)
      const queue: number[] = []

      queue.push(0)

      while (queue.length > 0) {
        const currentNode = queue.shift() as number
        visited[currentNode] = true

        this.getAdjacentNodes(currentNode).forEach((adjacentNode) => {
          if (!visited[adjacentNode]) {
            queue.push(adjacentNode)
          }
        })
      }

      return visited.every(node => node)
    }

    // Time complexity: O(|D|)
    areAdjacent (sourceId: number, targetId: number): boolean {
      return this.nodes[sourceId].edges.some(edge => edge.targetNode === targetId)
    }
}

export class GraphGenerator {
  static generateErdosRenyiRandomGraph (nodeCount: number, edgeProbability: number, isDirected = false, allowSelfLoops = false, requireConnected = false, maxAttempts = 10): Graph {
    let graph: Graph

    do {
      graph = new Graph(isDirected)

      // Add nodes
      for (let i = 0; i < nodeCount; ++i) {
        graph.addNode()
      }

      // Add edges
      for (let i = 0; i < nodeCount; ++i) {
        for (let j = isDirected ? 0 : i; j < nodeCount; ++j) {
          if ((i !== j || allowSelfLoops) && Math.random() < edgeProbability) {
            graph.addEdge(i, j)
          }
        }
      }

      requireConnected &&= !graph.isConnected() && --maxAttempts > 0
    } while (requireConnected)
    if (maxAttempts === 0) { throw new Error('Could not generate a connected graph') }

    return graph
  }

  static generatePath (nodeCount: number, isDirected = false): Graph {
    const graph = new Graph(isDirected)

    graph.addNode()

    // Create nodes and connect each new node to the previous one
    for (let i = 1; i < nodeCount; ++i) {
      graph.addNode()
      graph.addEdge(i - 1, i)
    }

    return graph
  }

  static generateCycle (nodeCount: number, isDirected = false): Graph {
    // Generate a path
    const graph = GraphGenerator.generatePath(nodeCount, isDirected)

    // Connect the last node to the first one
    graph.addEdge(nodeCount - 1, 0)

    return graph
  }

  static generateCompleteGraph (nodeCount: number, isDirected = false, allowSelfLoops = false): Graph {
    const graph = new Graph(isDirected)

    // Add nodes
    for (let i = 0; i < nodeCount; ++i) {
      graph.addNode()
    }

    // Add edges
    for (let i = 0; i < nodeCount; ++i) {
      for (let j = isDirected ? 0 : i; j < nodeCount; ++j) {
        if (i !== j || allowSelfLoops) {
          graph.addEdge(i, j)
        }
      }
    }

    return graph
  }

  static generateArbitraryTree (nodeCount: number, isDirected = false): Graph {
    const graph = new Graph(isDirected)

    // Add nodes
    for (let i = 0; i < nodeCount; ++i) {
      graph.addNode()
    }

    // Add edges
    for (let i = 1; i < nodeCount; ++i) {
      const randomNode = Math.floor(Math.random() * i)
      graph.addEdge(randomNode, i)
    }

    return graph
  }

  static generateBinaryTree (nodeCount: number, isDirected = false): Graph {
    const graph = new Graph(isDirected)

    // Add nodes
    for (let i = 0; i < nodeCount; ++i) {
      graph.addNode()
    }

    // Add edges
    for (let i = 1; i < nodeCount; ++i) {
      const parentNode = Math.floor((i - 1) / 2)
      graph.addEdge(parentNode, i)
    }

    return graph
  }
}
