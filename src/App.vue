<script setup lang="ts">
import * as vNG from 'v-network-graph'
import {
  ForceLayout,
  ForceNodeDatum,
  ForceEdgeDatum
} from 'v-network-graph/lib/force-layout'
import { Model, GraphType, RobotType } from './model'
import { VisualGraph, LayoutType } from './visual_graph'
import { Robot } from './robot'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import RobotSelector from './components/RobotSelector.vue'
import { provide, ref, shallowRef, triggerRef } from 'vue'

const model = new Model()

// Will get model properties from GUI

// Graph
model.graphType = GraphType.ArbitraryTree
model.nodeCount = 31
model.edgeProbability = 0.1
model.isDirected = false
model.allowSelfLoops = false
model.requireConnected = true
model.maxNumberOfGraphGenerationAttempts = 10
model.generateGraph()

// Visual graph
const layoutType = LayoutType.ForceDirected
const showGraph = true
const nodeLabelsAreVisible = true
const portLabelsAreVisible = true
const graphWidth = 1000
const graphHeight = 700
const vng = new VisualGraph(model.graph, graphWidth, graphHeight, layoutType)
const nodes = ref(vng.nodes)
const edges = ref(vng.edges)
const layouts = ref(vng.layouts)

// Force directed layout
const fdEdgeDistance = 40
const fdEdgeStrength = 0.6
const fdChargeStrength = -800
const fdCenterStrength = 0.99
const fdAlphaMin = 0.001

// Robots
model.robotType = RobotType.TreeExplorationGlobal
model.robotCount = 10
model.robotStartingNode = 0
model.lambda = 5
model.edgeSurvivalProbability = 0.5
model.generateRobots()

// model.runRobots()
// vng.updateEdgeWeights(model.graph.nodes)
// console.log('step count = ' + model.stepCount)

// Config

// Iterate through all nodes and set color
Object.keys(nodes.value).forEach(key => {
  nodes.value[key].color = '#99ccff'
})

// Iterate through all edges and set color
Object.keys(edges.value).forEach(key => {
  edges.value[key].color = '#000000'
})

const configs = vNG.defineConfigs({
  node: {
    normal: { type: 'circle', radius: 20, color: node => node.color },
    hover: { color: '#88bbff' },
    label: { visible: nodeLabelsAreVisible, fontSize: 8, text: node => node.name as string }
  },
  edge: {
    gap: 12,
    normal: { color: edge => edge.color },
    marker: { target: { type: 'none' } }
  },
  path: {
    visible: true,
    normal: {
      color: path => path.test ? '#6699cc' : '#000000',
      width: 10,
      dasharray: '10 16',
      animate: true,
      animationSpeed: path => path.test ? -40 : 40
    }
  }
})
if (layoutType.valueOf() === LayoutType.ForceDirected) {
  configs.view = {
    layoutHandler: new ForceLayout({
      positionFixedByDrag: false,
      positionFixedByClickWithAltKey: true,
      createSimulation: (d3, nodes, edges) => {
        // d3-force parameters
        const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d: { id: string }) => d.id)
        return d3
          .forceSimulation(nodes)
          .force('edge', forceLink.distance(fdEdgeDistance).strength(fdEdgeStrength))
          .force('charge', d3.forceManyBody().strength(fdChargeStrength))
          .force('center', d3.forceCenter(graphWidth / 2, graphHeight / 2).strength(fdCenterStrength))
          .alphaMin(fdAlphaMin)
      }
    })
  }
}
if (model.isDirected) { configs.edge.marker.target.type = 'arrow' }

// Initialize selected robot
const paths = ref({})

// Handle new robot selection
function onRobotSelected (robot: Robot) {
  // Remove path if no robot is selected
  if (robot === null) {
    paths.value = {}
    return
  }

  // Reset node colors
  Object.keys(nodes.value).forEach(key => {
    nodes.value[key].color = '#99ccff'
  })

  // Update path for new robot position
  paths.value = VisualGraph.getPath(robot, model.graph)

  // Mark current node
  nodes.value[robot.currentNode.toString()].color = '#ff0000'
}

const robots = shallowRef<Robot[]>(model.robots)
provide('robots', robots)

function stepRobots () {
  model.stepRobots()

  // Update edges and robots
  vng.updateEdgeWeights(model.graph.nodes)
  triggerRef(robots)

  Object.keys(edges.value).forEach(key => {
    edges.value[key].color = edges.value[key].weight > 0 ? '#000000' : '#FF0000'
  })
}
</script>

<template>
  <v-network-graph v-if="showGraph" class=graph :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs"
    :paths="paths" :style="{ width: graphWidth + 'px', height: graphHeight + 'px' }">
    <template #edge-label="{ edge, ...slotProps}">
      <v-edge-label v-if="portLabelsAreVisible" :text="`${edge.sourcePort}`" align="source" vertical-align="above"
        v-bind="slotProps" />
      <v-edge-label v-if="portLabelsAreVisible" :text="`${edge.targetPort}`" align="target" vertical-align="above"
        v-bind="slotProps" />
    </template>
  </v-network-graph>
  <Slider v-model="model.currentStep" :min="0" :max="model.stepCount" />
  <Button label="Step" @click="stepRobots()" />
  <RobotSelector @robot-selected="onRobotSelected" />
</template>

<style>
.blue {
  color: #88bbff;
}

.red {
  color: #ff0000;
}

.graph {
  border: 1px solid #000;
}
</style>
