<template>
  <div class="picker">
    <div v-for="(item, index) in props.items" :key="index">
      <component :is="item.image" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Component } from 'vue';

const model = defineModel()

interface Item {
  value: string,
  image: Component
}

const props = defineProps<{
  items: Item[]
}>()

</script>

<style lang="scss" scoped>

</style>