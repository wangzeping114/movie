<template>
  <div class="share-wrapper" v-show="modelValue" @click.self="closePanel">
    <div class="share-panel" :class="{ 'panel-show': modelValue }">
      <!-- 头部 -->
      <div class="panel-header">
        <span class="title">分享视频</span>
        <span class="close-btn material-icons" @click="closePanel($event)">close</span>
      </div>

      <!-- 短链接部分 -->
      <div class="short-link-container">
        <div class="short-link-label">复制链接给好友</div>
        <div class="short-link-box">
          <input ref="linkInput" type="text" class="link-input" readonly :value="shortLink">
          <button class="copy-btn" @click="copyLink">
            <i class="material-icons" v-if="copied">check</i>
            <i class="material-icons" v-else>content_copy</i>
          </button>
        </div>
        <div class="link-info">通过短链接打开后，可直接在应用中观看该视频</div>
      </div>

      <!-- 二维码分享 -->
      <div class="qrcode-container" v-if="showQRCode">
        <div class="qrcode-title">扫描二维码</div>
        <div class="qrcode-box" ref="qrcodeBox"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import QRCode from 'qrcodejs2-fix'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  videoId: {
    type: String,
    required: true
  },
  baseUrl: {
    type: String,
    default: window.location.origin
  }
})

const emit = defineEmits(['update:modelValue', 'share'])

// 复制状态
const copied = ref(false)
const linkInput = ref(null)
const qrcodeBox = ref(null)
const showQRCode = ref(true)

// 短链接
const shortLink = computed(() => {
  return `${props.baseUrl}/s/${props.videoId}`;
})

// 关闭面板
const closePanel = (event) => {
  // 阻止事件冒泡，防止触发视频切换
  if (event) {
    event.stopPropagation()
  }
  
  emit('update:modelValue', false)
  copied.value = false
}

// 复制链接
const copyLink = () => {
  if (navigator.clipboard && linkInput.value) {
    navigator.clipboard.writeText(shortLink.value)
      .then(() => {
        copied.value = true
        emit('share', { type: 'copy', link: shortLink.value })
        setTimeout(() => {
          copied.value = false
        }, 2000)
      })
      .catch(err => {
        console.error('复制失败:', err)
        fallbackCopy()
      })
  } else {
    fallbackCopy()
  }
}

// 后备复制方法
const fallbackCopy = () => {
  if (linkInput.value) {
    linkInput.value.select()
    try {
      document.execCommand('copy')
      copied.value = true
      emit('share', { type: 'copy', link: shortLink.value })
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
}

// 生成二维码
const generateQRCode = () => {
  if (qrcodeBox.value && showQRCode.value) {
    // 确保只生成一次
    if (qrcodeBox.value.innerHTML === '') {
      new QRCode(qrcodeBox.value, {
        text: shortLink.value,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      })
    }
  }
}

// 监听面板打开状态，生成二维码
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      generateQRCode()
    }, 300)
  }
})

onMounted(() => {
  // 尝试检测是否有QRCode库
  try {
    if (typeof QRCode === 'undefined') {
      showQRCode.value = false
      console.warn('QRCode库未找到，禁用二维码分享功能')
    }
  } catch (e) {
    showQRCode.value = false
  }
})
</script>

<style scoped>
.share-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.share-panel {
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  max-height: 80vh;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.panel-show {
  transform: translateY(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f1f1;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  color: #999;
  cursor: pointer;
  font-size: 24px;
}

.short-link-container {
  padding: 20px;
}

.short-link-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: bold;
}

.short-link-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  height: 44px;
}

.link-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  padding: 0;
  outline: none;
}

.copy-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #FF0050;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:active {
  transform: scale(0.9);
}

.copy-btn i {
  font-size: 18px;
}

.link-info {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.qrcode-container {
  padding: 20px;
  border-top: 8px solid #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 16px;
  font-weight: bold;
}

.qrcode-box {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
}
</style> 