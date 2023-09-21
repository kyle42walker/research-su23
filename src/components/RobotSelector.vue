<script setup lang="ts">
import { defineEmits, inject } from 'vue'
import Listbox from 'primevue/listbox'
import { Robot } from '../robot'

defineEmits<{(e: 'robotSelected', robot: Robot): void}>()
const robots = inject<Robot[]>('robots')
</script>

<template>
  <div class="card flex justify-content-center">
    <!-- Need to slice the robots array to update the list. Might be a bug in the listbox implementation -->
    <Listbox @change="$emit('robotSelected', $event.value)" :options="robots?.slice(0)" />
    <!-- <Listbox @change="$emit('robotSelected', $event.value)" :options="robots?.slice(0)" optionLabel="id" /> -->
  </div>
</template>
