<script setup lang="ts">
import * as vNG from 'v-network-graph'
// import {
//   ForceLayout,
//   ForceNodeDatum,
//   ForceEdgeDatum
// } from 'v-network-graph/lib/force-layout'
import { Model, GraphType, RobotType } from './model'
import { VisualGraph, LayoutType } from './visual_graph'
import { Robot } from './robot'
import Listbox from 'primevue/listbox'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
// import robotSelector from './RobotSelector.vue'
import { ref } from 'vue'

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
const layoutType = LayoutType.TreeVerticalCenter
const showGraph = true
const nodeLabelsAreVisible = true
const portLabelsAreVisible = true
const graphWidth = 1000
const graphHeight = 700
const vng = new VisualGraph(model.graph, graphWidth, graphHeight, layoutType)
const data = ref(vng.getData())

// Robots
model.robotType = RobotType.TreeExplorationGlobal
model.robotCount = 5
model.robotStartingNode = 0
model.generateRobots()
model.runRobots()
console.log(model.stepCount)

// Config

// // PATH ERROR TEST -- IGNORE
// const data = {
//   nodes: {
//     node1: { name: 'Node 1' },
//     node2: { name: 'Node 2' },
//     node3: { name: 'Node 3' }
//   },
//   layouts: {
//     nodes: {
//       node1: { x: 100, y: 100 },
//       node2: { x: 300, y: -300 },
//       node3: { x: 500, y: 100 }
//     }
//   },
//   edges: {
//     edge1: { source: 'node1', target: 'node2' },
//     edge2: { source: 'node2', target: 'node3' }
//   }
// }
// const paths: vNG.Paths = { p: { edges: ['edge1', 'edge1', 'edge1', 'edge2'] } }
// // END PATH ERROR TEST -- IGNORE

// Iterate through all nodes and set color
Object.keys(data.value.nodes).forEach(key => {
  data.value.nodes[key].color = '#99ccff'
})

// const paths: vNG.Paths = { p: { edges: ['0-1', '0-1', '0-1', '1-4'] } }
// const paths: vNG.Paths = { p: { edges: ['0-1', '0-1', '0-1', '1-4'] } }

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
  // view: {
  //   layoutHandler: new ForceLayout({
  //     positionFixedByDrag: true,
  //     positionFixedByClickWithAltKey: true,
  //     createSimulation: (d3, nodes, edges) => {
  //       // d3-force parameters
  //       const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
  //       return d3
  //         .forceSimulation(nodes)
  //         .force('edge', forceLink.distance(40).strength(0.5))
  //         .force('charge', d3.forceManyBody().strength(-800))
  //         .force('center', d3.forceCenter().strength(0.05))
  //         .alphaMin(0.001)
  //     }
  //   })
  // }
})
if (model.isDirected) { configs.edge.marker.target.type = 'arrow' }

// Initialize selected robot
const selectedRobot = ref(null)
const paths: vNG.Paths = {}

// Handle new robot selection
function onRobotSelected (event) {
  const robot = event.value as Robot

  // Reset node colors
  Object.keys(data.value.nodes).forEach(key => {
    data.value.nodes[key].color = '#99ccff'
  })

  // Remove path if no robot is selected
  if (robot === null) {
    this.paths = {}
    return
  }

  // Update path for new robot position
  this.paths = VisualGraph.getPath(robot.id, robot.startNode, robot.portsTraversed, this.model.graph)

  // Mark current node
  data.value.nodes[robot.currentNode.toString()].color = '#ff0000'

  // Print robot info
  // console.log(robot)
  // console.log(this.paths[robot.id.toString()])
  // console.log(data.value)
}
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
  <Slider v-model="model.currentStep" :min="0" :max="model.stepCount" />
  <Button label="Step" @click="model.stepRobots()"/>
  <!-- <Listbox v-model="selectedRobot" @change="onChange($event)" :options="model.robotCoordinator.robots" optionLabel="id"/> -->
  <Listbox v-model="selectedRobot" @change="onRobotSelected($event)" :options="model.robotCoordinator.robots" optionLabel="" />
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
