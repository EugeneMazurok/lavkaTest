<script setup>
import { computed } from 'vue'
import { defineProps } from 'vue'

const props = defineProps({
  platform: {
    type: String,
    default: 'Xbox'
  },
  scrollableElement: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const buttonColor = computed(() => {
  if (props.platform === 'PS') {
    return 'bg-blue'
  } else if (props.platform === 'Xbox') {
    return 'bg-green'
  } else {
    return 'bg-gray'
  }
})

const handleButtonClick = () => {
  const element = props.scrollableElement
  if (element && element.scrollTo) {
    element.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <transition name="fade">
    <button
        v-if="visible"
        @click="handleButtonClick"
        :class="[
        'fixed bottom-6 left-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50',
        buttonColor
      ]"
    >
      <img src='../assets/icons/arrowUp.png' alt="Icon" class="icon"/>
    </button>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.icon {
  width: 15px;
  height: auto;
}
</style>