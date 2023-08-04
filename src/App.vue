<script setup lang="ts">
import * as vNG from 'v-network-graph'
import { Model, GraphType, RobotType } from './model'
import { VisualGraph, LayoutType } from './visual_graph'
import Listbox from 'primevue/listbox'
// import robotSelector from './RobotSelector.vue'
import { ref } from 'vue'

const model = new Model()

// Will get model properties from GUI

// Graph
model.graphType = GraphType.ErdosRenyiRandom
model.nodeCount = 20
model.edgeProbability = 0.1
model.isDirected = false
model.allowSelfLoops = false
model.requireConnected = true
model.maxNumberOfGraphGenerationAttempts = 100
model.generateGraph()

// Visual graph
const showGraph = true
const nodeLabelsAreVisible = false
const portLabelsAreVisible = true
const graphWidth = 1000
const graphHeight = 700
const vng = new VisualGraph(model.graph, graphWidth, graphHeight, LayoutType.Circular)
const data = vng.getData()

// Robots
model.robotType = RobotType.RandomWalkExploration
model.robotCount = 20
model.robotStartingNode = 0
model.generateRobots()
model.runRobotExploration()

// Config

// Iterate through all nodes and set color
Object.keys(data.nodes).forEach(key => {
  data.nodes[key].color = '#99ccff'
})

// const paths = VisualGraph.getPath(model.robotCoordinator.robots[19], model.graph)
// data.nodes[model.robotCoordinator.robots[19].currentNode.toString()].color = '#ff0000'

// Initialize selected robot
// const selectedRobot = ref(model.robotCoordinator.robots[0])
// const paths: vNG.Paths = VisualGraph.getPath(selectedRobot.value, model.graph)
const selectedRobot = ref(null)
const paths: vNG.Paths = {}

function onChange (event) {
  // console.log(event.value)
  if (event.value === null) {
    return
  }
  this.paths = VisualGraph.getPath(event.value, model.graph)
  Object.keys(data.nodes).forEach(key => {
    data.nodes[key].color = '#99ccff'
  })
  data.nodes[event.value.currentNode.toString()].color = '#ff0000'
  console.log(event.value)
  console.log(paths[event.value.id.toString()])
  console.log(data)
}

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

<!-- <script methods lang="ts">
function onChange (event) {
  console.log(event.value)
}
</script> -->

<template>
  <v-network-graph v-if="showGraph" class=graph :nodes="data.nodes" :edges="data.edges" :layouts="data.layouts"
    :configs="configs" :paths="paths" :style="{ width: graphWidth + 'px', height: graphHeight + 'px' }">
    <template #edge-label="{ edge, ...slotProps}">
      <!-- <v-edge-label :text="edgeId" align="center" v-bind="slotProps" /> -->
      <v-edge-label v-if="portLabelsAreVisible" :text="`${edge.sourcePort}`" align="source" vertical-align="above"
        v-bind="slotProps" />
      <v-edge-label v-if="portLabelsAreVisible" :text="`${edge.targetPort}`" align="target" vertical-align="above"
        v-bind="slotProps" />
    </template>
  </v-network-graph>
  <!-- <Listbox v-model="selectedRobot" @change="onChange($event)" :options="model.robotCoordinator.robots" optionLabel="id"/> -->
  <Listbox v-model="selectedRobot" @change="onChange($event)" :options="model.robotCoordinator.robots" optionLabel=""/>
  <!-- <robotSelector :model="model"/> -->
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
