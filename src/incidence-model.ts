export class IncidenceGraph {
  nodes: Vertex[] = []

  constructor(public readonly isDirected: boolean = false) { }

  // Runtime: O(1)
  AddNode(weight = 1) {
    this.nodes.push(new Vertex(weight))
  }

  // Runtime: O(1)
  // Assumes sourceId and targetId are valid and an edge is not already present
  AddEdge(sourceId: number, targetId: number, weight: number = 1) {
    this.nodes[sourceId].edges.push(new IncidentEdge(targetId, weight))

    if (!this.isDirected) { this.nodes[targetId].edges.push(new IncidentEdge(sourceId, weight)) }
  }

  // Runtime: O(|E|^2)
  RemoveNode(nodeId: number) {
    this.nodes[nodeId].weight = -1

    this.nodes.forEach((n) => {
      n.edges = n.edges.filter(e => e.targetId !== nodeId)
    })

    this.nodes[nodeId].edges = []
  }

  // Runtime: O(|E|)
  RemoveEdge(sourceId: number, targetId: number) {
    this.nodes[sourceId].edges = this.nodes[sourceId].edges.filter(e => e.targetId !== targetId)

    if (!this.isDirected) { this.nodes[targetId].edges = this.nodes[targetId].edges.filter(e => e.targetId !== sourceId) }
  }

  // Runtime: O(|E|)
  SetEdgeWeight(sourceId: number, targetId: number, weight: number) {
    const edge = this.nodes[sourceId].edges.find(e => e.targetId === targetId)
    if (edge) { edge.weight = weight }

    if (!this.isDirected) {
      const edge = this.nodes[targetId].edges.find(e => e.targetId === sourceId)
      if (edge) { edge.weight = weight }
    }
  }

  // Runtime: O(|E|)
  GetAdjacentNodes(nodeId: number): number[] {
    return this.nodes[nodeId].edges.map(e => e.targetId)
  }

  // Runtime: O(|E|)
  AreAdjacent(sourceId: number, targetId: number): boolean {
    return this.nodes[sourceId].edges.some(e => e.targetId === targetId)
  }
}

class Vertex {
  edges: IncidentEdge[] = []

  constructor(public weight: number) { }
}

class IncidentEdge {
  constructor(public targetId: number, public weight: number) { }
}

const gg = new IncidenceGraph()
gg.AddNode()
gg.AddNode()
gg.AddNode()
gg.AddEdge(1, 0)
gg.AddEdge(1, 2)
console.log(gg)
