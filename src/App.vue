<script setup lang="ts">
import * as vNG from 'v-network-graph'
import { Model, GraphType, RobotType } from './model'
import { VisualGraph, LayoutType } from './visual_graph'

const model = new Model()

// Will get model properties from GUI
const nodeLabelsAreVisible = false

model.graphType = GraphType.ErdosRenyiRandom
model.nodeCount = 20
model.edgeProbability = 0.1
model.isDirected = false
model.allowSelfLoops = false
model.requireConnected = true
model.maxNumberOfGraphGenerationAttempts = 100

model.generateGraph()
const graphWidth = 1000
const graphHeight = 700
const vng = new VisualGraph(model.graph, graphWidth, graphHeight, LayoutType.Circular)
const data = vng.getData()

model.robotType = RobotType.RandomWalkDispersion
model.robotCount = 20
model.robotStartingNode = 0
model.generateRobots()
model.runRobotDispersion()

const paths = VisualGraph.getPath(model.robotCoordinator.robots[19], model.graph)
console.log(model.robotCoordinator.robots[19])
console.log(paths[model.robotCoordinator.robots[19].id.toString()])
// console.log(paths)
data.nodes[model.robotCoordinator.robots[19].currentNode.toString()].color = '#ff0000'
console.log(data)

// const paths: vNG.Paths = {
//   path1: { edges: ['1-2', '2-3', '3-13'] }
// }

// TODO: debug path being messed up

const configs = vNG.defineConfigs({
  node: {
    // normal: { type: 'circle', radius: 20, color: '#99ccff' },
    normal: { type: 'circle', radius: 20, color: node => node.color },
    hover: { color: '#88bbff' },
    // label: { visible: false, fontSize: 8 }
    label: { visible: nodeLabelsAreVisible, fontSize: 8, text: node => node.name }
  },
  edge: {
    gap: 12,
    normal: { color: '#6699cc' },
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
if (model.isDirected) { configs.edge.marker.target.type = 'arrow' }
</script>

<template>
  <v-network-graph class=graph :nodes="data.nodes" :edges="data.edges" :layouts="data.layouts" :configs="configs"
    :paths="paths" :style="{ width: graphWidth + 'px', height: graphHeight + 'px' }">
    <template #edge-label="{ edge, ...slotProps}">
      <!-- <v-edge-label :text="edgeId" align="center" v-bind="slotProps" /> -->
      <v-edge-label :text="`${edge.sourcePort}`" align="source" vertical-align="above" v-bind="slotProps" />
      <v-edge-label :text="`${edge.targetPort}`" align="target" vertical-align="above" v-bind="slotProps" />
    </template>
  </v-network-graph>
</template>
<style>
.graph {
  border: 1px solid #000;
}
</style>
