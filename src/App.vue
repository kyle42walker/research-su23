<!-- <template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import HelloWorld from './components/HelloWorld.vue'

@Options({
  components: {
    HelloWorld
  }
})
export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style> -->

<!-- <script setup lang="ts">
const nodes = {
  node1: { name: 'Node 1' },
  node2: { name: 'Node 2' },
  node3: { name: 'Node 3' },
  node4: { name: 'Node 4' }
}

const edges = {
  edge1: { source: 'node1', target: 'node2' },
  edge2: { source: 'node2', target: 'node3' },
  edge3: { source: 'node3', target: 'node4' }
}
</script>

<template>
  <v-network-graph class="graph" :nodes="nodes" :edges="edges" />
</template>

<style>
.graph {
  width: 800px;
  height: 600px;
  border: 1px solid #000;
}
</style> -->

<!-- <script setup lang="ts">
import { reactive, ref } from 'vue'
import * as vNG from 'v-network-graph'
import data from './data'

const configs = reactive(
  vNG.defineConfigs({
    view: {
      scalingObjects: true,
      minZoomLevel: 0.1,
      maxZoomLevel: 100
    }
  })
)

const zoomLevel = ref(1.5)
</script>

<template>
  <div class="demo-control-panel">
    <PrimeCheckbox v-model="configs.view.scalingObjects" :binary="true" />
    <label for="Scaling objects">{{ configs.view.scalingObjects }}</label>
    <PrimeSlider v-model="zoomLevel" class="w-1000rem" />
  </div>

  <v-network-graph v-model:zoom-level="zoomLevel" :nodes="data.nodes" :edges="data.edges" :layouts="data.layouts"
    :configs="configs" />
</template> -->

<script setup lang="ts">
import * as vNG from 'v-network-graph'
import { Model, GraphType } from './model'
import { VisualGraph, LayoutType } from './visual_graph'

const model = new Model()
model.graphType = GraphType.ErdosRenyiRandom
model.nodeCount = 10
model.edgeProbability = 0.3
model.isDirected = false
model.allowSelfLoops = false
model.requireConnected = true
model.maxNumberOfGraphGenerationAttempts = 1

model.generateGraph()
const graph = model.graph

const graphWidth = 1000
const graphHeight = 700

const vng = new VisualGraph(graph, graphWidth, graphHeight, LayoutType.Circular)
const data = vng.getData()

const configs = vNG.defineConfigs({
  node: {
    normal: { type: 'circle', radius: 20, color: '#99ccff' },
    hover: { color: '#88bbff' },
    label: { visible: false, fontSize: 8 }
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
    :style="{width: graphWidth + 'px', height: graphHeight + 'px'}" />
</template>
<style>
.graph {
  border: 1px solid #000;
}
</style>
