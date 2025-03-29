<template>
  <div class="gift-panel-container" v-if="show">
    <div class="gift-panel-backdrop" @click="close"></div>
    <div class="gift-panel">
      <div class="gift-panel-header">
        <span>选择礼物</span>
        <button class="close-btn" @click="close">
          <i class="material-icons">close</i>
        </button>
      </div>
      
      <div class="gift-panel-tabs">
        <div 
          v-for="(tab, index) in tabs" 
          :key="index"
          class="gift-tab" 
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          {{ tab }}
        </div>
      </div>
      
      <div class="gift-grid">
        <div 
          v-for="gift in filteredGifts" 
          :key="gift.id"
          class="gift-item"
          :class="{ selected: selectedGift?.id === gift.id }"
          @click="selectGift(gift)"
        >
          <img :src="gift.icon" :alt="gift.name" class="gift-icon">
          <span class="gift-name">{{ gift.name }}</span>
          <span class="gift-price">{{ gift.price }} 金币</span>
        </div>
      </div>
      
      <div class="gift-count-selector">
        <div class="count-btn" @click="decreaseCount">-</div>
        <div class="count-display">{{ giftCount }}个</div>
        <div class="count-btn" @click="increaseCount">+</div>
      </div>
      
      <div class="my-balance">
        <span>我的金币: {{ userBalance }}</span>
        <button class="recharge-btn">充值</button>
      </div>
      
      <button 
        class="send-gift-btn" 
        :disabled="!selectedGift || selectedGift.price * giftCount > userBalance"
        @click="sendGift"
      >
        <span v-if="selectedGift">送出 {{ selectedGift.price * giftCount }} 金币</span>
        <span v-else>请选择礼物</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  userBalance: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['close', 'send-gift'])

// 礼物数据
const gifts = [
  // 鲜花类
  { id: 1, name: '玫瑰花', price: 5, icon: 'https://cdn-icons-png.flaticon.com/128/3082/3082059.png', type: 'flower', animation: 'simple' },
  { id: 2, name: '郁金香', price: 10, icon: 'https://cdn-icons-png.flaticon.com/128/2208/2208101.png', type: 'flower', animation: 'simple' },
  { id: 3, name: '向日葵', price: 15, icon: 'https://cdn-icons-png.flaticon.com/128/5584/5584453.png', type: 'flower', animation: 'simple' },
  { id: 4, name: '花束', price: 50, icon: 'https://cdn-icons-png.flaticon.com/128/1132/1132776.png', type: 'flower', animation: 'medium' },
  
  // 生活类
  { id: 5, name: '棒棒糖', price: 5, icon: 'https://cdn-icons-png.flaticon.com/128/3460/3460911.png', type: 'life', animation: 'simple' },
  { id: 6, name: '蛋糕', price: 20, icon: 'https://cdn-icons-png.flaticon.com/128/4479/4479781.png', type: 'life', animation: 'simple' },
  { id: 7, name: '冰淇淋', price: 15, icon: 'https://cdn-icons-png.flaticon.com/128/5637/5637229.png', type: 'life', animation: 'simple' },
  { id: 8, name: '啤酒', price: 10, icon: 'https://cdn-icons-png.flaticon.com/128/2738/2738730.png', type: 'life', animation: 'simple' },
  
  // 高级礼物
  { id: 9, name: '爱心', price: 99, icon: 'https://cdn-icons-png.flaticon.com/128/4381/4381470.png', type: 'premium', animation: 'medium' },
  { id: 10, name: '皇冠', price: 199, icon: 'https://cdn-icons-png.flaticon.com/128/5814/5814665.png', type: 'premium', animation: 'medium' },
  { id: 11, name: '跑车', price: 520, icon: 'https://cdn-icons-png.flaticon.com/128/185/185277.png', type: 'premium', animation: 'advanced' },
  { id: 12, name: '火箭', price: 1314, icon: 'https://cdn-icons-png.flaticon.com/128/5264/5264258.png', type: 'premium', animation: 'advanced' },
  
  // 饮酒类
  { id: 13, name: '啤酒干杯', price: 66, icon: 'https://cdn-icons-png.flaticon.com/128/4686/4686.png', type: 'drink', animation: 'medium' },
  { id: 14, name: '红酒', price: 88, icon: 'https://cdn-icons-png.flaticon.com/128/7039/7039999.png', type: 'drink', animation: 'medium' },
  { id: 15, name: '洋酒', price: 128, icon: 'https://cdn-icons-png.flaticon.com/128/4156/4156346.png', type: 'drink', animation: 'medium' },
  { id: 16, name: '酒吧套餐', price: 666, icon: 'https://cdn-icons-png.flaticon.com/128/2934/2934362.png', type: 'drink', animation: 'advanced' },
]

// 标签页
const tabs = ['全部', '鲜花', '生活', '高级', '饮酒']
const tabTypes = ['all', 'flower', 'life', 'premium', 'drink']

// 状态
const activeTab = ref(0)
const selectedGift = ref(null)
const giftCount = ref(1)

// 根据当前标签筛选礼物
const filteredGifts = computed(() => {
  if (activeTab.value === 0) {
    return gifts
  } else {
    const type = tabTypes[activeTab.value]
    return gifts.filter(gift => gift.type === type)
  }
})

// 选择礼物
const selectGift = (gift) => {
  selectedGift.value = gift
}

// 增加礼物数量
const increaseCount = () => {
  if (giftCount.value < 99) {
    giftCount.value++
  }
}

// 减少礼物数量
const decreaseCount = () => {
  if (giftCount.value > 1) {
    giftCount.value--
  }
}

// 发送礼物
const sendGift = () => {
  if (selectedGift.value) {
    const totalPrice = selectedGift.value.price * giftCount.value
    if (totalPrice <= props.userBalance) {
      emit('send-gift', {
        gift: selectedGift.value,
        count: giftCount.value,
        totalPrice
      })
      // 重置选择
      selectedGift.value = null
      giftCount.value = 1
      close()
    }
  }
}

// 关闭面板
const close = () => {
  emit('close')
}
</script>

<style scoped>
.gift-panel-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.gift-panel-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1001;
}

.gift-panel {
  position: relative;
  z-index: 1002;
  background: linear-gradient(145deg, #1a1f2a, #0a0f1a);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(255, 215, 0, 0.1);
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.gift-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #d4af37;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.gift-panel-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 6px;
}

.gift-panel-tabs::-webkit-scrollbar {
  display: none;
}

.gift-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-size: 14px;
}

.gift-tab.active {
  background: linear-gradient(135deg, #d4af37, #e5c158);
  color: #000;
  font-weight: 600;
}

.gift-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
}

.gift-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.gift-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.gift-item.selected {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37;
}

.gift-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 8px;
  object-fit: contain;
}

.gift-name {
  font-size: 12px;
  color: #fff;
  margin-bottom: 4px;
  text-align: center;
}

.gift-price {
  font-size: 11px;
  color: #d4af37;
  font-weight: 500;
}

.gift-count-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #fff;
}

.count-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.count-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
}

.count-display {
  min-width: 60px;
  text-align: center;
  font-size: 16px;
}

.my-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.recharge-btn {
  background: none;
  border: 1px solid #d4af37;
  color: #d4af37;
  padding: 4px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.recharge-btn:hover {
  background: rgba(212, 175, 55, 0.1);
}

.send-gift-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #d4af37, #e5c158);
  border: none;
  border-radius: 24px;
  color: #000;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-gift-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.send-gift-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 480px) {
  .gift-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .gift-panel {
    padding: 16px 12px;
  }
}
</style> 