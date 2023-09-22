<!-- <script setup lang="ts">
import { defineEmits, inject } from 'vue'
import { Model, GraphType } from '@/model';
import {  VisualGraph, LayoutType } from '@/visual_graph';

import Dropdown from 'primevue/dropdown';

const model = new Model()

//

//

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

//

//

//

defineEmits<{(e: 'robotSelected', robot: Robot): void}>()
const robots = inject<Robot[]>('robots')
</script>

<template>
    <div class="card flex justify-content-center">
        <Dropdown v-model="selectedCity" editable :options="cities" optionLabel="name" placeholder="Select a Layout Type" class="w-full md:w-14rem" />
    </div>
</template> -->
