import { Graph } from './graph'
import { Robot } from './robot'
import { Nodes, Edges, Layouts, Paths } from 'v-network-graph'

export enum LayoutType { Random, Circular, LinearHorizontal, LinearVertical, TreeVerticalLeft, TreeVerticalCenter, ForceDirected }

export class VisualGraph {
    nodes: Nodes
    edges: Edges
    layouts: Layouts

    constructor (graph: Graph, width: number, height: number, layoutType: LayoutType) {
      this.nodes = VisualGraph.extractNodes(graph)
      this.edges = VisualGraph.extractEdges(graph)
      this.layouts = VisualGraph.generateLayouts(graph, width, height, layoutType)
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

    static generateLayouts (graph: Graph, width: number, height: number, layoutType: LayoutType): Layouts {
      switch (layoutType) {
        case LayoutType.Random:
          return LayoutGenerator.GenerateRandomLayout(graph, width, height)
        case LayoutType.Circular:
          return LayoutGenerator.GenerateCircularLayout(graph, width, height)
        case LayoutType.LinearHorizontal:
          return LayoutGenerator.GenerateLinearHorizontalLayout(graph, width)
        case LayoutType.LinearVertical:
          return LayoutGenerator.GenerateLinearVerticalLayout(graph, height)
        case LayoutType.TreeVerticalLeft:
          return LayoutGenerator.GenerateTreeVerticalLayout(graph, width, height, false)
        case LayoutType.TreeVerticalCenter:
          return LayoutGenerator.GenerateTreeVerticalLayout(graph, width, height, true)
        default:
          throw new Error(`Invalid layout type: ${layoutType}`)
      }
    }
}

class LayoutGenerator {
  static GenerateRandomLayout (graph: Graph, width: number, height: number): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    graph.getNodeIds().forEach((nodeId) => {
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

    const angleStep = 2 * Math.PI / graph.getNodeCount()

    let angle = 0
    graph.getNodeIds().forEach((nodeId) => {
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

    const xStep = width / graph.getNodeCount()

    let x = 0
    graph.getNodeIds().forEach((nodeId) => {
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

    const yStep = height / graph.getNodeCount()

    let y = 0
    graph.getNodeIds().forEach((nodeId) => {
      layouts.nodes[nodeId] = {
        x: 0,
        y: y
      }
      y += yStep
    })

    return layouts
  }

  static GenerateTreeVerticalLayout (graph: Graph, width: number, height: number, isCentered = false): Layouts {
    const layouts: Layouts = {
      nodes: {}
    }

    const nodeIdsByLevel: number[][] = []
    const rootId = 0
    nodeIdsByLevel[0] = [rootId]

    const graphDepth = graph.getDepth(rootId)

    const yStep = (height - 100) / graphDepth
    let y = 0

    // Get the node ids for each level of the tree
    let level = 0
    while (level <= graphDepth) {
      const xStep = width / nodeIdsByLevel[level].length
      let x = isCentered ? xStep / 2 : 0

      nodeIdsByLevel[level + 1] = []

      // Get the children of each node in the current level
      nodeIdsByLevel[level].forEach((nodeId) => {
        // Find all child nodes
        const childNodes = graph.getAdjacentNodes(nodeId).filter((childNodeId) => {
          // Filter out nodes that have already been added to a level
          return !nodeIdsByLevel.some((nodeIds) => nodeIds.includes(childNodeId))
        })

        // Add child node ids to the next level
        childNodes.forEach((childNodeId) => {
          nodeIdsByLevel[level + 1].push(childNodeId)
        })

        // Calculate the x and y coordinates for each node
        layouts.nodes[nodeId] = {
          x: x,
          y: y
        }
        x += xStep
      })
      y += yStep

      ++level
    }

    return layouts
  }

  // static GenerateForceDirectedLayout (nodes: Nodes, edges: Edges, width: number, height: number): Layouts {
  //   console.log(nodes, edges, width, height)
  //   throw new Error('Force directed layout not implemented')
  // }
}
