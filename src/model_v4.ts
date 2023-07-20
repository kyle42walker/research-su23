// import { Nodes, Edges, Layouts } from 'v-network-graph'

// class Graph {
//     nodes: [weight: number, edges: [weight: number, targetNode: number][]][] = []
//     //TODO: Consider hashmap for edges
//     // or maybe sort edges by target node id and use binary search

//     constructor(public readonly isDirected: boolean = false) { }

//     // Runtime: O(1) amortized
//     AddNode(weight = 1) {
//         this.nodes.push([weight, []])
//     }

//     // Runtime: O(1) amortized
//     // Assumes sourceId and targetId are valid and an edge is not already present
//     AddEdge(sourceId: number, targetId: number, weight: number = 1) {
//         this.nodes[sourceId][1].push([weight, targetId])

//         if (!this.isDirected) {
//             this.nodes[targetId][1].push([weight, sourceId])
//         }
//     }

//     // Runtime: O(|V| * |E|)
//     // Assumes nodeId is valid
//     // This is not efficient, but this method should be called infrequently
//     RemoveNode(nodeId: number) {
//         // Remove the node
//         this.nodes.splice(nodeId, 1)

//         this.nodes.forEach((n) => {
//             // Remove all edges that point to the removed node
//             n[1] = n[1].filter(e => e[1] !== nodeId)

//             // Update all edges that point to nodes after the removed node
//             n[1].forEach(e => {
//                 if (e[1] > nodeId) { e[1]-- }
//             })
//         })
//     }

//     // Runtime: O(|D|)
//     // Assumes sourceId and targetId are valid
//     RemoveEdge(sourceId: number, targetId: number) {
//         this.nodes[sourceId][1] = this.nodes[sourceId][1].filter(e => e[1] !== targetId)

//         if (!this.isDirected) {
//             this.nodes[targetId][1] = this.nodes[targetId][1].filter(e => e[1] !== sourceId)
//         }
//     }

//     // Runtime: O(1)
//     // Assumes nodeId is valid
//     SetNodeWeight(nodeId: number, weight: number) {
//         this.nodes[nodeId][0] = weight
//     }

//     // Runtime: O(|D|)
//     // Assumes sourceId and targetId are valid
//     SetEdgeWeight(sourceId: number, targetId: number, weight: number) {
//         const edge = this.nodes[sourceId][1].find(e => e[1] === targetId)
//         if (edge) { edge[0] = weight }

//         if (!this.isDirected) {
//             const edge = this.nodes[targetId][1].find(e => e[1] === sourceId)
//             if (edge) { edge[0] = weight }
//         }
//     }

//     // Runtime: O(|D|)
//     GetAdjacentNodes(nodeId: number): number[] {
//         return this.nodes[nodeId][1].map(e => e[1])
//     }

//     // Runtime: O(|D|)
//     AreAdjacent(sourceId: number, targetId: number): boolean {
//         return this.nodes[sourceId][1].some(e => e[1] === targetId)
//     }

//     // Runtime: O(|V| * |E|)
//     GetEdges(): [sourceId: number, targetId: number, weight: number][] {
//         const edges: [sourceId: number, targetId: number, weight: number][] = []

//         this.nodes.forEach((n, sourceId) => {
//             n[1].forEach(e => {
//                 edges.push([sourceId, e[1], e[0]])
//             })
//         })

//         return edges
//     }

//     // Runtime: O(1)
//     GetNodeCount(): number {
//         return this.nodes.length
//     }

//     // Runtime: O(|V| * |E|)
//     GetEdgeCount(): number {
//         return this.GetEdges().length
//     }
// }

// class Model {
//     graph: Graph

//     // TODO: Ensure the graph is connected
//     GenerateRandomGraph(nodeCount: number, edgeCount: number) {
//         this.graph = new Graph()

//         // Add nodes
//         for (let i = 0; i < nodeCount; i++) {
//             this.graph.AddNode()
//         }

//         // Add edges
//         for (let i = 0; i < edgeCount; i++) {
//             let sourceId = Math.floor(Math.random() * this.graph.GetNodeCount())
//             let targetId = Math.floor(Math.random() * this.graph.GetNodeCount())

//             // Ensure the edge is not already present
//             while (this.graph.AreAdjacent(sourceId, targetId)) {
//                 sourceId = Math.floor(Math.random() * this.graph.GetNodeCount())
//                 targetId = Math.floor(Math.random() * this.graph.GetNodeCount())
//             }

//             this.graph.AddEdge(sourceId, targetId)
//         }
//     }

//     GetNodes(): Nodes {
//         const nodes: Nodes = {}

//         this.graph.nodes.forEach((n, id) => {
//             nodes[id] = {
//                 name: id.toString(),
//                 weight: n[0],
//             }
//         })

//         return nodes
//     }

//     GetEdges(): Edges {
//         const edges: Edges = {}

//         this.graph.GetEdges().forEach((e) => {
//             edges[`${e[0]}-${e[1]}`] = {
//                 source: e[0].toString(),
//                 target: e[1].toString(),
//                 weight: e[2],
//             }
//         })

//         return edges
//     }

//     GetLayouts(): Layouts {
//         const layouts: Layouts = { nodes: {} }

//         this.graph.nodes.forEach((n, id) => {
//             layouts.nodes[id] = {
//                 x: Math.random(),
//                 y: Math.random(),
//             }
//         })

//         return layouts
//     }
// }
