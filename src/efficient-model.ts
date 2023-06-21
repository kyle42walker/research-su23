
export class EfficientGraph {
    nodes: number[] = [] // [weight]
    edges: [number, number, boolean][] = [] // [sourceId, targetId, isActive]

    constructor(public readonly isDirected: boolean = false) { }

    // Runtime: O(1)
    AddNode(weight = 1) {
        this.nodes.push(weight)
    }

    // Runtime: O(1)
    AddEdge(sourceId: number, targetId: number) {
        this.edges.push([sourceId, targetId, true])

        if (!this.isDirected) { this.edges.push([targetId, sourceId, true]) }
    }

    // Runtime: O(|E|)
    RemoveNode(nodeId: number) {
        this.nodes[nodeId] = -1
        this.edges = this.edges.filter(e => e[0] !== nodeId && e[1] !== nodeId)
    }

    // Runtime: O(|E|)
    RemoveEdge(edgeId: number) {
        this.edges.splice(edgeId, 1)

        // test this TODO
        if (!this.isDirected) {
            if (edgeId % 2 === 0) { this.edges.splice(edgeId, 1) } else { this.edges.splice(edgeId - 1, 1) }
        }
    }

    // Runtime: O(1)
    // Must be called with lower edgeId index
    SetEdgeState(edgeId: number, state: boolean) {
        this.edges[edgeId][2] = state

        // TODO: check parity
        if (!this.isDirected) { this.edges[edgeId + 1][2] = state }
        // {
        // if (this.edges[edgeId + 1][0] === this.edges[edgeId][1] && this.edges[edgeId + 1][1] === this.edges[edgeId][0])
        //     this.edges[edgeId + 1][2] = state
        // else if (this.edges[edgeId - 1][0] === this.edges[edgeId][1] && this.edges[edgeId - 1][1] === this.edges[edgeId][0])
        //     this.edges[edgeId - 1][2] = state
        // else
        //     throw new Error('Edge is not bidirectional')
        // }
    }

    // Runtime: O(|E|)
    GetAdjacentNodes(nodeId: number): number[] {
        return this.edges.filter(e => e[0] === nodeId).map(e => e[1])
    }

    // Runtime: O(|E|)
    AreAdjacent(sourceId: number, targetId: number): boolean {
        return this.edges.some(e => e[0] === sourceId && e[1] === targetId)
    }
}

const gg = new EfficientGraph()
gg.AddNode()
gg.AddNode()
gg.AddNode()
gg.AddEdge(1, 0)
gg.AddEdge(1, 2)
console.log(gg)
