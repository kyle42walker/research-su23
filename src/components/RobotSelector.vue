<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import Listbox from 'primevue/listbox'
import { Robot } from '../robot'

defineEmits<{(e: 'robotSelected', robot: Robot): void}>()
defineProps<{
  robots: Robot[]
}>()
</script>

<template>
  <div class="card flex justify-content-center">
    <!-- <Listbox @change="$emit('robotSelected', $event.value)" :options="robots" optionLabel="id" class="w-full md:w-14rem" /> -->
    <Listbox @change="$emit('robotSelected', $event.value)" :options="robots" />
  </div>
</template>
