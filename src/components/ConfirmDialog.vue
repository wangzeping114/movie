<template>
  <Transition name="dialog">
    <div v-if="modelValue" class="dialog-overlay" @click="handleOverlayClick">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="dialog-body">
          <p>{{ message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn cancel" @click="handleCancel">取消</button>
          <button class="btn confirm" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    required: true
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    emit('cancel')
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: #2a2a2a;
  border-radius: 12px;
  width: 80%;
  max-width: 320px;
  overflow: hidden;
  animation: dialog-in 0.3s ease;
}

.dialog-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
}

.dialog-body {
  padding: 20px 16px;
  text-align: center;
}

.dialog-body p {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.dialog-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.btn.confirm {
  background: #d4af37;
  color: #000;
}

.btn:active {
  transform: scale(0.98);
}

/* 动画效果 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog-content {
  animation: dialog-in 0.3s ease;
}

.dialog-leave-active .dialog-content {
  animation: dialog-out 0.3s ease;
}

@keyframes dialog-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes dialog-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style> 