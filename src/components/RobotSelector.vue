<script setup lang="ts">
import { defineEmits, ref, inject, watch } from 'vue'
import Listbox from 'primevue/listbox'
import { Robot } from '@/robot'

const emit = defineEmits<{(e: 'robotSelected', robot: Robot | null): void}>()
const selectedRobot = ref<Robot | null>(null)
const robots = inject<Robot[]>('robots')

// Emit robotSelected event when selectedRobot is updated
watch(selectedRobot, () => {
  emit('robotSelected', selectedRobot.value)
})
</script>

<template>
  <div class="card flex justify-content-center">
    <!-- Need to slice the robots array to force the list to update reactively -->
    <Listbox v-model="selectedRobot" :options="robots?.slice(0)" />
    <!-- <Listbox @change="$emit('robotSelected', $event.value)" :options="robots?.slice(0)" optionLabel="id" /> -->
  </div>
</template>
