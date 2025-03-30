<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RouterView } from 'vue-router'
import PageTransition from './components/PageTransition.vue'
import UploadIndicator from './components/UploadIndicator.vue'

const router = useRouter()

onMounted(() => {
  console.log('App mounted')
  console.log('Current route:', router.currentRoute.value)
})
</script>

<template>
  <div class="app-container">
    <template v-if="$route.path === '/short-video'">
      <RouterView />
    </template>
    <template v-else>
      <PageTransition 
        :enable-swipe-back="true"
        :disable-swipe-routes="['/profile', '/settings', '/publish', '/user', '/follow']">
        <RouterView />
      </PageTransition>
    </template>
    
    <!-- 全局上传指示器 -->
    <UploadIndicator />
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
