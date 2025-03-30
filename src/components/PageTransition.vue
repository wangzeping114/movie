<template>
  <div 
    class="page-transition-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd">
    <!-- 左滑动箭头（右方向箭头，表示向左滑动） -->
    <div class="swipe-arrow right-arrow" :style="{ opacity: rightArrowOpacity }">
      <i class="material-icons">arrow_forward</i>
    </div>
    
    <!-- 右滑动箭头（左方向箭头，表示向右滑动） -->
    <div class="swipe-arrow left-arrow" :style="{ opacity: leftArrowOpacity }">
      <i class="material-icons">arrow_back</i>
    </div>
    
    <div 
      class="page-transition-inner"
      :style="{ transform: `translateX(${translateX}px)` }"
      :class="{ 'transitioning': isTransitioning }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  // 是否允许右滑返回上一页
  enableSwipeBack: {
    type: Boolean,
    default: true
  },
  // 禁用左右滑动的路径列表
  disableSwipeRoutes: {
    type: Array,
    default: () => [
      '/profile', 
      '/settings', 
      '/publish',
      '/user'
    ]
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
const currentRoute = router.currentRoute

// 计算箭头的透明度
const leftArrowOpacity = computed(() => {
  if (translateX.value <= 0) return 0
  return Math.min(translateX.value / 100, 0.7)
})

const rightArrowOpacity = computed(() => {
  if (translateX.value >= 0) return 0
  return Math.min(Math.abs(translateX.value) / 100, 0.7)
})

// 检查当前路由是否需要禁用滑动
const isSwipeDisabled = computed(() => {
  return props.disableSwipeRoutes.some(route => 
    currentRoute.value.path.startsWith(route)
  )
})

const handleTouchStart = (e) => {
  // 如果当前路由禁用滑动，则不处理
  if (isSwipeDisabled.value) return
  
  // 如果点击的是控制层或进度条，不处理触摸事件
  if (
    e.target.closest('.no-swipe') || 
    e.target.closest('.video-controls') || 
    e.target.closest('.progress-bar') ||
    e.target.closest('input') ||
    e.target.closest('textarea') ||
    e.target.closest('select') ||
    e.target.closest('.slider') ||
    e.target.closest('.swiper')
  ) {
    return
  }
  
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e) => {
  if (isLocked.value || isSwipeDisabled.value) return
  
  touchEndX.value = e.touches[0].clientX
  touchEndY.value = e.touches[0].clientY
  
  const xDiff = touchEndX.value - touchStartX.value
  const yDiff = touchEndY.value - touchStartY.value
  
  // 确保是水平滑动
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    e.preventDefault()
    
    // 如果是右滑且不允许返回，则不显示滑动效果
    if (xDiff > 0 && !props.enableSwipeBack) {
      translateX.value = 0
      return
    }
    
    // 如果是左滑且没有下一页，则不显示滑动效果
    if (xDiff < 0) {
      const currentRoute = router.currentRoute.value
      const routes = router.getRoutes()
      const currentIndex = routes.findIndex(route => route.path === currentRoute.path)
      if (currentIndex >= routes.length - 1) {
        translateX.value = 0
        return
      }
    }
    
    translateX.value = xDiff
  }
}

const handleTouchEnd = (e) => {
  if (isLocked.value || isSwipeDisabled.value) return
  
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
  min-height: 100vh;
}

.page-transition-inner {
  width: 100%;
  height: 100%;
  min-height: 100vh;
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

/* 滑动箭头样式 */
.swipe-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.swipe-arrow i {
  color: #d4af37;
  font-size: 28px;
}

.left-arrow {
  left: 16px;
}

.right-arrow {
  right: 16px;
}
</style> 