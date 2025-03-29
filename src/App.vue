<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RouterView } from 'vue-router'

const router = useRouter()

onMounted(() => {
  console.log('App mounted')
  console.log('Current route:', router.currentRoute.value)
})
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style>
.app-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

/* 暗色主题 */
body {
  background-color: #1a1a1a;
  color: #ffffff;
  margin: 0;
  padding: 0;
}

/* 隐藏视频控制条 */
video::-webkit-media-controls {
  display: none !important;
}
</style>
