<template>
  <Transition name="toast">
    <div v-if="show" class="toast" :class="type">
      <span class="material-icons icon">{{ icon }}</span>
      <span class="message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 2000
  }
})

const show = ref(true)
const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
})

let timer = null

watch(() => props.message, () => {
  show.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    show.value = false
  }, props.duration)
})

onMounted(() => {
  timer = setTimeout(() => {
    show.value = false
  }, props.duration)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(26, 31, 42, 0.95);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 12px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  justify-content: center;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.toast.success {
  background: rgba(26, 31, 42, 0.95);
  border-color: rgba(76, 175, 80, 0.3);
}

.toast.error {
  background: rgba(26, 31, 42, 0.95);
  border-color: rgba(244, 67, 54, 0.3);
}

.toast.warning {
  background: rgba(26, 31, 42, 0.95);
  border-color: rgba(255, 152, 0, 0.3);
}

.icon {
  font-size: 20px;
  color: #d4af37;
}

.message {
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(45deg, #d4af37, #e5c158);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}
</style> 