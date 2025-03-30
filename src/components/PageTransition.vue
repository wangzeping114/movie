<template>
  <div 
    class="page-transition-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd">
    <div 
      class="page-transition-inner"
      :style="{ transform: `translateX(${translateX}px)` }"
      :class="{ 'transitioning': isTransitioning }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  // 是否允许右滑返回上一页
  enableSwipeBack: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const translateX = ref(0)
const isTransitioning = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const minDistance = 50 // 最小滑动距离
const isLocked = ref(false)

const handleTouchStart = (e) => {
  // 如果点击的是控制层或进度条，不处理触摸事件
  if (
    e.target.closest('.no-swipe') || 
    e.target.closest('.video-controls') || 
    e.target.closest('.progress-bar')
  ) {
    return
  }
  
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e) => {
  if (isLocked.value) return
  
  touchEndX.value = e.touches[0].clientX
  touchEndY.value = e.touches[0].clientY
  
  const xDiff = touchEndX.value - touchStartX.value
  const yDiff = touchEndY.value - touchStartY.value
  
  // 确保是水平滑动
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    e.preventDefault()
    translateX.value = xDiff
  }
}

const handleTouchEnd = (e) => {
  if (isLocked.value) return
  
  const xDiff = touchEndX.value - touchStartX.value
  const yDiff = touchEndY.value - touchStartY.value
  
  // 确保是水平滑动
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (Math.abs(xDiff) >= minDistance) {
      isTransitioning.value = true
      isLocked.value = true
      
      // 根据滑动方向决定是否触发路由切换
      if (xDiff > 0) {
        // 向右滑动，返回上一页
        if (props.enableSwipeBack && router.options.history.state.back) {
          router.back()
        }
      } else {
        // 向左滑动，前进到下一页
        const currentRoute = router.currentRoute.value
        const routes = router.getRoutes()
        const currentIndex = routes.findIndex(route => route.path === currentRoute.path)
        if (currentIndex < routes.length - 1) {
          router.push(routes[currentIndex + 1].path)
        }
      }
      
      // 添加过渡动画
      translateX.value = xDiff > 0 ? window.innerWidth : -window.innerWidth
      
      // 动画结束后重置状态
      setTimeout(() => {
        translateX.value = 0
        isTransitioning.value = false
        isLocked.value = false
      }, 300)
    } else {
      // 滑动距离不够，回弹
      translateX.value = 0
    }
  }
}

// 防止页面滚动穿透
const preventScroll = (e) => {
  if (isTransitioning.value) {
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('touchmove', preventScroll, { passive: false })
})

onBeforeUnmount(() => {
  document.removeEventListener('touchmove', preventScroll)
})
</script>

<style scoped>
.page-transition-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
  touch-action: pan-y;
  z-index: 1;
}

.page-transition-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-out;
  will-change: transform;
  overflow: visible;
  position: relative;
  z-index: 2;
}

.transitioning {
  transition: transform 0.3s ease-out;
}

/* 确保视频内容不受影响 */
:deep(video) {
  position: relative;
  z-index: 3;
}
</style> 