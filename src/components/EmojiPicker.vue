<template>
  <div class="emoji-picker" v-if="show">
    <div class="emoji-header">
      <div class="emoji-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          class="emoji-tab"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          <i class="material-icons">{{ tab.icon }}</i>
        </div>
      </div>
      <i class="material-icons close-btn" @click="$emit('close')">close</i>
    </div>
    <div class="emoji-content">
      <div class="emoji-grid" v-if="currentTab === 'recent'">
        <div 
          v-for="emoji in recentEmojis" 
          :key="emoji"
          class="emoji-item"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
      <div class="emoji-grid" v-else>
        <div 
          v-for="emoji in emojiList" 
          :key="emoji"
          class="emoji-item"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select'])

const currentTab = ref('recent')
const recentEmojis = ref(['😊', '😂', '❤️', '👍', '🎉', '🌟', '💕', '😍', '😘', '🤔', '😅', '😆'])
const emojiList = ref([
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉',
  '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
  '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
  '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
  '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
  '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️',
  '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛩', '🕋', '💠', '🔮', '🕯', '💈',
  '⚖️', '🦯', '🦠', '🦷', '🦴', '🦵', '🦶', '🦾', '🦿', '🦻', '🦺', '🦸',
  '🦹', '🧑‍🦯', '🧑‍🦼', '🧑‍🦽', '🧑‍🦾', '🧑‍🦿', '🧑‍⚕️', '🧑‍🌾', '🧑‍🍳', '🧑‍🍼', '🧑‍🎓', '🧑‍🎤',
  '🧑‍🎨', '🧑‍🏫', '🧑‍🏭', '🧑‍💻', '🧑‍💼', '🧑‍🔧', '🧑‍🔬', '🧑‍🚀', '🧑‍🚒', '🧑‍⛑️', '🧑‍⚖️', '🧑‍✈️'
])

const selectEmoji = (emoji) => {
  emit('select', emoji)
  emit('close')
}
</script>

<style scoped>
.emoji-picker {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}

.emoji-tabs {
  display: flex;
  gap: 16px;
}

.emoji-tab {
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 4px;
}

.emoji-tab:hover {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.emoji-tab.active {
  color: #d4af37;
}

.close-btn {
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #d4af37;
}

.emoji-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.emoji-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}
</style> 