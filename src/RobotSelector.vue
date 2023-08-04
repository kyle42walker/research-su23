<script>
import { ref } from 'vue'
import { VisualGraph } from './visual_graph'
import Listbox from 'primevue/listbox'

const selectedRobot = ref()
let path = ref()

export default {
  name: 'RobotSelector',
  components: {
    Listbox
  },
  setup () {
    return {
      selectedRobot,
      path
    }
  },
  props: {
    model: Object
  },
  methods: {
    onChange (event) {
      console.log(event.value)
      path = VisualGraph.getPath(event.value, this.model.graph)
    }
  }
}
</script>

<template>
    <div class="card flex justify-content-center">
        <Listbox v-model="selectedRobot" @change="onChange($event)" :options="model.robotCoordinator.robots" optionLabel="id" class="w-full md:w-14rem" />
    </div>
</template>
