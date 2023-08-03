import { Graph } from './graph'
import { Robot } from './robot'
import { Nodes, Edges, Layouts, Paths } from 'v-network-graph'

export enum LayoutType { Random, Circular, LinearHorizontal, LinearVertical, ForceDirected }

export class VisualGraph {
    nodes: Nodes
    edges: Edges
    layouts: Layouts

    constructor (graph: Graph, width: number, height: number, layoutType: LayoutType) {
      this.nodes = VisualGraph.extractNodes(graph)
      this.edges = VisualGraph.extractEdges(graph)
      this.layouts = VisualGraph.generateLayouts(this.nodes, this.edges, width, height, layoutType)
    }

    getData () {
      return {
        nodes: this.nodes,
        edges: this.edges,
        layouts: this.layouts
      }
    }

    static getPath (robot: Robot, graph: Graph): Paths {
      const id = robot.id.toString()
      let sourceNode = robot.startNode
      let targetNode
      let edgeId
      const edges = robot.portsTraversed.map((port) => {
        targetNode = graph.getAdjacentNodeFromPort(sourceNode, port)
        // Undirected graph edges are stored in the format "{smallerNodeId}-{largerNodeId}"
        if (targetNode < sourceNode && !graph.isDirected) {
          edgeId = `${targetNode}-${sourceNode}`
        } else {
          edgeId = `${sourceNode}-${targetNode}`
        }
        sourceNode = targetNode
        return edgeId
      })
      return { [id]: { edges } }
    }

    static extractNodes (graph: Graph): Nodes {
      const nodes: Nodes = {}

      graph.nodes.forEach((node, id) => {
        nodes[id.toString()] = {
          name: id.toString(),
          weight: node.weight
        }
      })

      return nodes
    }

    static getNodeIds (nodes: Nodes): string[] {
      return Object.keys(nodes)
    }

    static getNodeCount (nodes: Nodes): number {
      return VisualGraph.getNodeIds(nodes).length
    }

    static extractEdges (graph: Graph): Edges {
      const edges: Edges = {}

      graph.nodes.forEach((node, sourceId) => {
        node.edges.forEach((edge, port) => {
          // Skip redundant edges if the graph is undirected
          if (edge.targetNode < sourceId && !graph.isDirected) { return }

          const targetId = edge.targetNode
          const edgeId = `${sourceId}-${targetId}`
          edges[edgeId] = {
            weight: edge.weight,
            source: sourceId.toString(),
            target: targetId.toString(),
            sourcePort: port,
            targetPort: graph.getPortFromAdjacentNode(targetId, sourceId) // -1 if not found
          }
        })
      })

      return edges
    }

    static generateLayouts (nodes: Nodes, edges: Edges, width: number, height: number, layoutType: LayoutType): Layouts {
      switch (layoutType) {
        case LayoutType.Random:
          return LayoutGenerator.GenerateRandomLayout(nodes, width, height)
        case LayoutType.Circular:
          return LayoutGenerator.GenerateCircularLayout(nodes, width, height)
        case LayoutType.LinearHorizontal:
          return LayoutGenerator.GenerateLinearHorizontalLayout(nodes, width)
        case LayoutType.LinearVertical:
          return LayoutGenerator.GenerateLinearVerticalLayout(nodes, height)
        case LayoutType.ForceDirected:
          return LayoutGenerator.GenerateForceDirectedLayout(nodes, edges, width, height)
        default:
          throw new Error(`Invalid layout type: ${layoutType}`)
      }
    }
}

class LayoutGenerator {
  static GenerateRandomLayout (nodes: Nodes, width: number, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    VisualGraph.getNodeIds(nodes).forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: Math.random() * width,
        y: Math.random() * height
      }
    })

    return layouts
  }

  static GenerateCircularLayout (nodes: Nodes, width: number, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const radius = Math.min(width, height) / 2 * 0.9

    const angleStep = 2 * Math.PI / VisualGraph.getNodeCount(nodes)

    let angle = 0
    VisualGraph.getNodeIds(nodes).forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      }
      angle += angleStep
    })

    return layouts
  }

  static GenerateLinearHorizontalLayout (nodes: Nodes, width: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const xStep = width / VisualGraph.getNodeCount(nodes)

    let x = 0
    VisualGraph.getNodeIds(nodes).forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: x,
        y: 0
      }
      x += xStep
    })

    return layouts
  }

  static GenerateLinearVerticalLayout (nodes: Nodes, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const yStep = height / VisualGraph.getNodeCount(nodes)

    let y = 0
    VisualGraph.getNodeIds(nodes).forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: 0,
        y: y
      }
      y += yStep
    })

    return layouts
  }

  static GenerateForceDirectedLayout (nodes: Nodes, edges: Edges, width: number, height: number): Layouts {
    console.log(nodes, edges, width, height)
    throw new Error('Force directed layout not implemented')
  }
}
