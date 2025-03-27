<template>
  <span class="icon" :class="name">{{ text }}</span>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.icon {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'liga' 1;
}
</style> 