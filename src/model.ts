namespace Model {
    export class Graph {
        nodes: number[] = []
        edges: Edge[] = []
        nodeIdCounter = 0

        constructor (public readonly isDirected: boolean = false) { }

        // Runtime: O(1)
        AddNode () {
          this.nodes.push(this.nodeIdCounter++)
        }

        // Runtime: O(1) without verification, O(|E|+|V|) with verification
        AddEdge (sourceId: number, targetId: number) {
          if (!this.NodeExists(sourceId) || !this.NodeExists(targetId)) { throw new Error('Source or target node does not exist') }

          if (this.EdgeExists(sourceId, targetId)) { throw new Error('Edge already exists') }

          this.edges.push(new Edge(sourceId, targetId))

          if (!this.isDirected) { this.edges.push(new Edge(targetId, sourceId)) }
        }

        // Runtime: O(|E|+|V|)
        RemoveNode (nodeId: number) {
          if (!this.NodeExists(nodeId)) { throw new Error('Node does not exist') }

          // Remove the node and all edges connected to it
          this.nodes = this.nodes.filter(n => n !== nodeId)
          this.edges = this.edges.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId)
        }

        // Runtime: O(|E|)
        RemoveEdge (sourceId: number, targetId: number) {
          if (!this.EdgeExists(sourceId, targetId)) { throw new Error('Edge does not exist') }

          // Remove the edge
          this.edges = this.edges.filter(e => e.sourceId !== sourceId || e.targetId !== targetId)

          if (!this.isDirected) { this.edges = this.edges.filter(e => e.sourceId !== targetId || e.targetId !== sourceId) }
        }

        // Runtime: O(|E|)
        SetEdgeState (sourceId: number, targetId: number, state: boolean) {
          if (!this.EdgeExists(sourceId, targetId)) { throw new Error('Edge does not exist') }

            this.edges.find(e => e.sourceId === sourceId && e.targetId === targetId)!.isActive = state

            if (!this.isDirected) { this.edges.find(e => e.sourceId === targetId && e.targetId === sourceId)!.isActive = state }
        }

        // Runtime: O(|E|) without verification, O(|E|+|V|) with verification
        GetAdjacentNodes (nodeId: number): number[] {
          if (!this.NodeExists(nodeId)) { throw new Error('Node does not exist') }

          return this.edges.filter(e => e.sourceId === nodeId).map(e => e.targetId)
        }

        // Runtime: O(|E|) without verification, O(|E|+|V|) with verification
        AreAdjacent (sourceId: number, targetId: number): boolean {
          if (!this.NodeExists(sourceId) || !this.NodeExists(targetId)) { throw new Error('Source or target node does not exist') }

          return this.edges.some(e => e.sourceId === sourceId && e.targetId === targetId)
        }

        // Runtime: O(|V|)
        NodeExists (nodeId: number): boolean {
          return this.nodes.indexOf(nodeId) !== -1
        }

        // Runtime: O(|E|)
        EdgeExists (sourceId: number, targetId: number): boolean {
          return this.edges.some(e => e.sourceId === sourceId && e.targetId === targetId)
        }
    }

    class Edge {
        isActive = true
        constructor (public readonly sourceId: number, public readonly targetId: number) { }
    }
}

const g = new Model.Graph()
g.AddNode()
g.AddNode()
g.AddNode()
g.AddEdge(1, 0)
g.AddEdge(1, 2)
console.log(g)
