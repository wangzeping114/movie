<template>
  <div class="gift-animation-container" :class="{ 'chat-mode-container': props.chatMode }">
    <div 
      v-for="(gift, index) in visibleGifts" 
      :key="gift.id"
      class="gift-animation"
      :class="[
        `animation-type-${gift.animation}`,
        gift.leaveAnimation ? 'leave' : '',
        isPremiumGift(gift) ? 'premium-gift' : '',
        props.chatMode ? 'chat-mode-gift' : ''
      ]"
      @animationend="onAnimationEnd(gift.id)"
    >
      <div class="gift-sender">
        <img :src="gift.senderAvatar" :alt="gift.senderName" class="sender-avatar">
        <span class="sender-name">{{ gift.senderName }}</span>
        <span class="gift-action">送出</span>
      </div>
      
      <div class="gift-info-box">
        <div class="gift-image">
          <img :src="gift.icon" :alt="gift.name">
          
          <div class="gift-count" :class="{ 'big-count': gift.count >= 10 }">
            <span>x{{ gift.count }}</span>
          </div>
        </div>
        
        <div class="gift-details">
          <div class="gift-name">{{ gift.name }}</div>
          <div class="gift-value">价值 {{ gift.price * gift.count }} 金币</div>
        </div>
      </div>
      
      <div class="gift-special-effect" v-if="gift.animation === 'advanced'">
        <template v-if="gift.name === '跑车'">
          <div class="car-animation"></div>
        </template>
        <template v-else-if="gift.name === '火箭'">
          <div class="rocket-animation"></div>
        </template>
        <template v-else-if="gift.name === '酒吧套餐'">
          <div class="bar-animation"></div>
        </template>
      </div>
    </div>
    
    <!-- 高价值礼物特写效果 -->
    <div 
      v-for="gift in premiumGifts" 
      :key="gift.premiumId"
      class="premium-gift-spotlight"
      :class="{ 
        'leave': gift.leaving,
        'chat-mode-spotlight': props.chatMode 
      }"
      @animationend="onPremiumAnimationEnd(gift.premiumId)"
      @click="dismissPremiumGift(gift.premiumId)"
    >
      <div class="premium-gift-container" @click.stop>
        <div class="premium-gift-sparkles"></div>
        <div class="close-premium-btn" @click="dismissPremiumGift(gift.premiumId)">
          <i class="material-icons">close</i>
        </div>
        
        <div class="premium-gift-header">
          <span class="premium-gift-title">豪华礼物</span>
        </div>
        
        <div class="premium-gift-content">
          <div class="premium-gift-sender">
            <img :src="gift.senderAvatar" :alt="gift.senderName" class="premium-sender-avatar">
            <div class="premium-sender-info">
              <div class="premium-sender-name">{{ gift.senderName }}</div>
              <div class="premium-sender-action">赠送</div>
            </div>
          </div>
          
          <div class="premium-gift-showcase">
            <img :src="gift.icon" :alt="gift.name" class="premium-gift-icon">
            <div class="premium-gift-name-container">
              <div class="premium-gift-name">{{ gift.name }}</div>
              <div class="premium-gift-count" v-if="gift.count > 1">x{{ gift.count }}</div>
            </div>
          </div>
          
          <div class="premium-gift-value">
            <span>价值 {{ gift.price * gift.count }} 金币</span>
          </div>
        </div>
        
        <div class="premium-gift-effect" :class="'effect-' + gift.name.replace(/\s+/g, '-')"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps({
  // 礼物队列
  gifts: {
    type: Array,
    default: () => []
  },
  // 最大同时显示数量
  maxVisible: {
    type: Number,
    default: 3
  },
  // 是否显示高价值礼物特写效果
  showPremiumEffects: {
    type: Boolean,
    default: true
  },
  // 是否在聊天区域显示（聊天模式）
  chatMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['gift-animation-end'])

// 可见礼物列表
const visibleGifts = ref([])
// 等待显示的礼物队列
const giftQueue = ref([])
// 高价值礼物特写列表
const premiumGifts = ref([])
// 动画时长（毫秒）
const animationDuration = 5000
// 高价值礼物动画时长（毫秒）
const premiumAnimationDuration = 5000

// 检查礼物是否为高价值礼物（价格*数量 >= 100金币）
const isPremiumGift = (gift) => {
  return (gift.price * gift.count) >= 100
}

// 显示礼物动画
const showGiftAnimation = (gift) => {
  // 对于高价值礼物，只有在启用特效时才添加到特写动画队列
  if (isPremiumGift(gift) && props.showPremiumEffects) {
    const premiumGift = {
      ...gift,
      premiumId: 'premium-' + Date.now() + Math.random().toString(36).substring(2, 9),
      leaving: false
    }
    premiumGifts.value.push(premiumGift)
    
    // 设置特写动画结束后自动移除
    setTimeout(() => {
      const index = premiumGifts.value.findIndex(g => g.premiumId === premiumGift.premiumId)
      if (index !== -1) {
        premiumGifts.value[index].leaving = true
      }
    }, premiumAnimationDuration)
  }
  
  // 添加到普通礼物动画队列
  const animationGift = {
    ...gift,
    id: Date.now() + Math.random().toString(36).substring(2, 9),
    leaveAnimation: false
  }
  giftQueue.value.push(animationGift)
  
  // 更新可见礼物列表
  updateVisibleGifts()
}

// 更新可见礼物列表
const updateVisibleGifts = () => {
  // 如果显示中的礼物少于最大限制，从队列中取出礼物显示
  while (visibleGifts.value.length < props.maxVisible && giftQueue.value.length > 0) {
    const gift = giftQueue.value.shift()
    const giftWithId = {
      ...gift,
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      leaveAnimation: false
    }
    visibleGifts.value.push(giftWithId)
    
    // 设置动画结束后自动移除
    setTimeout(() => {
      const index = visibleGifts.value.findIndex(g => g.id === giftWithId.id)
      if (index !== -1) {
        visibleGifts.value[index].leaveAnimation = true
      }
    }, animationDuration)
  }
}

// 动画结束事件处理
const onAnimationEnd = (id) => {
  // 只处理离开动画结束
  const index = visibleGifts.value.findIndex(gift => gift.id === id && gift.leaveAnimation)
  if (index !== -1) {
    visibleGifts.value.splice(index, 1)
    // 检查队列中是否有等待的礼物
    updateVisibleGifts()
    
    // 发出礼物动画结束事件
    emit('gift-animation-end', id)
  }
}

// 高价值礼物特写动画结束处理
const onPremiumAnimationEnd = (premiumId) => {
  const index = premiumGifts.value.findIndex(gift => gift.premiumId === premiumId)
  
  if (index !== -1 && premiumGifts.value[index].leaving) {
    // 特写动画结束，移除该礼物
    premiumGifts.value.splice(index, 1)
  }
}

// 关闭高价值礼物特写
const dismissPremiumGift = (premiumId) => {
  const index = premiumGifts.value.findIndex(gift => gift.premiumId === premiumId)
  
  if (index !== -1) {
    premiumGifts.value[index].leaving = true
  }
}

// 监听props变化，更新礼物队列
const giftObserver = () => {
  if (props.gifts && props.gifts.length > 0) {
    const latestGift = props.gifts[props.gifts.length - 1]
    
    if (visibleGifts.value.length < props.maxVisible) {
      showGiftAnimation(latestGift)
    } else {
      giftQueue.value.push(latestGift)
    }
  }
}

// 计时器ID
let observerInterval = null

onMounted(() => {
  // 启动观察器，每100ms检查一次礼物队列变化
  observerInterval = setInterval(giftObserver, 100)
})

onUnmounted(() => {
  // 清除计时器
  if (observerInterval) {
    clearInterval(observerInterval)
  }
})

// 添加对showPremiumEffects属性的监听
watch(() => props.showPremiumEffects, (newValue) => {
  // 当切换为false时，清除所有正在显示的高价值礼物特效
  if (!newValue && premiumGifts.value.length > 0) {
    // 标记所有礼物为离开状态
    premiumGifts.value.forEach(gift => {
      gift.leaving = true
    })
  }
}, { immediate: true })
</script>

<style scoped>
.gift-animation-container {
  position: absolute;
  left: 16px;
  bottom: 120px;
  width: 320px;
  z-index: 2000;
  pointer-events: none;
}

.gift-animation {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 50px;
  padding: 8px 12px;
  margin-bottom: 12px;
  transform-origin: left center;
  animation: slideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: all 0.3s ease;
}

.gift-animation.leave {
  animation: slideOut 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
}

.gift-animation.animation-type-simple {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gift-animation.animation-type-medium {
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.2);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(35, 35, 35, 0.75));
}

.gift-animation.animation-type-advanced {
  border: 2px solid rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 24px rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(50, 40, 10, 0.8));
}

@keyframes slideIn {
  0% {
    transform: translateX(-100%) scale(0.9);
    opacity: 0;
  }
  60% {
    transform: translateX(5px) scale(1.02);
    opacity: 1;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideOut {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%) scale(0.9);
    opacity: 0;
  }
}

.gift-sender {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.sender-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d4af37;
  margin-right: 8px;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  animation: avatarPulse 3s infinite ease-in-out;
}

@keyframes avatarPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
  }
}

.sender-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gift-action {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
}

.gift-info-box {
  display: flex;
  align-items: center;
}

.gift-image {
  position: relative;
  margin-right: 10px;
}

.gift-image img {
  width: 42px;
  height: 42px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
  animation: giftBounce 1s ease infinite alternate;
}

@keyframes giftBounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-3px);
  }
}

.gift-count {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  color: #000;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.gift-count.big-count {
  background: linear-gradient(135deg, #ff4d4d, #ff9966);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  animation: countScale 1s infinite alternate;
}

@keyframes countScale {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.15);
  }
}

.gift-details {
  display: flex;
  flex-direction: column;
}

.gift-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.gift-value {
  font-size: 12px;
  color: #d4af37;
}

/* 特殊动画效果 */
.gift-special-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.car-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
  animation: carDriveBy 1.5s ease-in-out infinite;
}

@keyframes carDriveBy {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.rocket-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 100, 100, 0.2), transparent);
  animation: rocketFly 1s ease-in-out infinite;
}

@keyframes rocketFly {
  0% {
    transform: translateY(0) translateX(-100%);
  }
  50% {
    transform: translateY(-10px) translateX(0);
  }
  100% {
    transform: translateY(0) translateX(100%);
  }
}

.bar-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
  animation: barPulse 1.5s ease-in-out infinite;
}

@keyframes barPulse {
  0% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
}

/* 高价值礼物特效 */
.premium-gift {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(212, 175, 55, 0.2));
  border: 2px solid #d4af37;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
  animation: premiumPulse 2s infinite alternate, slideIn 0.5s ease-out forwards;
}

@keyframes premiumPulse {
  0% {
    box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
  }
  100% {
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.8);
  }
}

/* 高价值礼物特写效果 */
.premium-gift-spotlight {
  position: absolute;
  bottom: 80px;
  right: 20px;
  width: 50%;
  height: auto;
  max-width: 280px;
  min-width: 240px;
  transform: none;
  z-index: 2001;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spotlightSlideIn 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
  background: transparent;
  backdrop-filter: none;
  opacity: 0.85;
}

.premium-gift-spotlight.leave {
  animation: spotlightSlideOut 0.5s cubic-bezier(0.6, -0.28, 0.74, 0.05) forwards;
}

/* 移除全屏遮罩 */
.premium-gift-overlay {
  display: none;
}

/* 新的动画效果 */
@keyframes spotlightSlideIn {
  0% {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
  70% {
    opacity: 1;
    transform: translateX(-10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes spotlightSlideOut {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
}

.premium-gift-container {
  position: relative;
  width: 100%;
  max-width: 320px;
  background: linear-gradient(135deg, rgba(26, 31, 42, 0.75), rgba(10, 15, 26, 0.8));
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.1);
  overflow: hidden;
  border: 2px solid rgba(212, 175, 55, 0.7);
  animation: containerGlow 3s ease-in-out infinite;
}

@keyframes containerGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.6), 0 0 40px rgba(212, 175, 55, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(212, 175, 55, 0.8), 0 0 50px rgba(212, 175, 55, 0.3);
  }
}

.premium-gift-header {
  background: linear-gradient(135deg, #d4af37 20%, #f8e796 50%, #d4af37 80%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
  padding: 10px;
  text-align: center;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.premium-gift-title {
  color: #000;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  padding: 0 16px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.premium-gift-title::before,
.premium-gift-title::after {
  content: '✦';
  position: absolute;
  top: 0;
  animation: starTwinkle 1.5s infinite alternate;
}

@keyframes starTwinkle {
  0% {
    opacity: 0.7;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.premium-gift-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.premium-gift-sender {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 8px;
}

.premium-sender-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid #d4af37;
  object-fit: cover;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
}

.premium-sender-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.premium-sender-name {
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.premium-sender-action {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.premium-gift-showcase {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px;
  position: relative;
}

.premium-gift-name-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.premium-gift-name {
  font-size: 18px;
  color: #d4af37;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
}

.premium-gift-count {
  font-size: 14px;
  color: #fff;
  background: linear-gradient(135deg, #ff4d4d, #ff9966);
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.premium-gift-value {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(212, 175, 55, 0.2);
  display: inline-block;
  margin: 0 auto;
  border: 1px solid rgba(212, 175, 55, 0.3);
  animation: valueGlow 2s infinite alternate;
}

@keyframes valueGlow {
  0% {
    box-shadow: 0 0 5px rgba(212, 175, 55, 0.3);
  }
  100% {
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
  }
}

.premium-gift-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.2;
}

/* 火箭特效 */
.effect-火箭 {
  background: radial-gradient(circle at 50% 120%, #ff4d4d, transparent 60%);
  animation: rocketEffect 3s ease-in-out infinite;
}

@keyframes rocketEffect {
  0%, 100% {
    opacity: 0.2;
    background-position: center 120%;
  }
  50% {
    opacity: 0.4;
    background-position: center 110%;
  }
}

/* 跑车特效 */
.effect-跑车 {
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
  background-size: 200% 100%;
  animation: carEffect 3s ease-in-out infinite;
}

@keyframes carEffect {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* 爱心特效 */
.effect-爱心 {
  background: radial-gradient(circle at center, rgba(255, 105, 180, 0.3), transparent 70%);
  animation: heartBeat 1.5s ease-in-out infinite;
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.4;
  }
}

/* 皇冠特效 */
.effect-皇冠 {
  background: radial-gradient(circle at top center, rgba(212, 175, 55, 0.5), transparent 70%);
  animation: crownEffect 4s ease-in-out infinite;
}

@keyframes crownEffect {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

/* 酒吧套餐特效 */
.effect-酒吧套餐 {
  background: linear-gradient(135deg, 
    rgba(128, 0, 128, 0.2) 0%, 
    rgba(0, 0, 255, 0.2) 25%,
    rgba(0, 255, 255, 0.2) 50%,
    rgba(0, 128, 0, 0.2) 75%,
    rgba(255, 0, 0, 0.2) 100%
  );
  background-size: 400% 400%;
  animation: barEffect 10s ease infinite;
}

@keyframes barEffect {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .gift-animation-container {
    width: 260px;
    bottom: 100px;
    left: 10px;
  }
  
  .chat-mode-container {
    width: 100%;
    left: 0;
    bottom: 0;
  }
  
  .sender-avatar {
    width: 32px;
    height: 32px;
  }
  
  .gift-image img {
    width: 36px;
    height: 36px;
  }
  
  .premium-gift-spotlight {
    bottom: 70px;
    right: 10px;
    max-width: 280px;
    min-width: 220px;
  }
  
  .premium-gift-container {
    width: 90%;
  }
  
  .premium-gift-icon {
    width: 80px;
    height: 80px;
  }
  
  .premium-gift-name {
    font-size: 20px;
  }
  
  .premium-sender-avatar {
    width: 50px;
    height: 50px;
  }
}

/* 添加关闭按钮样式 */
.close-premium-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: all 0.2s ease;
}

.close-premium-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.close-premium-btn i {
  color: #fff;
  font-size: 18px;
}

.premium-gift-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 8px),
    radial-gradient(circle at 75% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 10px),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 6px),
    radial-gradient(circle at 80% 60%, rgba(255, 255, 255, 0.3) 0%, transparent 12px);
  opacity: 0;
  animation: sparklesFade 4s ease-in-out infinite alternate;
}

@keyframes sparklesFade {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.premium-gift-icon {
  width: 70px;
  height: 70px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.7));
  animation: iconFloat 3s ease-in-out infinite, iconGlow 2s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes iconGlow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.9));
  }
}

/* 聊天模式容器 */
.chat-mode-container {
  position: relative;
  left: 0;
  bottom: 0;
  width: 100%;
  margin-bottom: 10px;
}

/* 聊天模式下的礼物动画 */
.chat-mode-gift {
  width: calc(100% - 20px);
  margin-left: auto;
  margin-right: auto;
}

/* 聊天模式下的高价值礼物特写 */
.chat-mode-spotlight {
  position: fixed;
  top: 50%;
  left: 50%;
  bottom: auto;
  right: auto;
  transform: translate(-50%, -50%) !important;
  width: 90%;
  max-width: 300px;
  z-index: 2500;
}
</style> 