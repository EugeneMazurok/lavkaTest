<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

// Определение пропсов
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

// Определение цвета кнопки на основе пропса platform
const buttonColor = computed(() => {
  if (props.platform === 'PS') {
    return 'bg-blue'
  } else if (props.platform === 'Xbox') {
    return 'bg-green'
  } else {
    return 'bg-gray' // Цвет по умолчанию
  }
})

// Обработчик клика по кнопке
const handleButtonClick = () => {
  console.log("ABOBA")
  const element = props.scrollableElement
  if (element && element.scrollTo) {
    element.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } else {
    console.warn('Scrollable element не задан или не поддерживает scrollTo')
  }
}
</script>

<template>
  <button
      v-if="visible"
      @click="handleButtonClick"
      :class="[
      'fixed bottom-4 left-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50',
      buttonColor
    ]"
  >
    <Icon class="text-white text-2xl" icon="mdi:arrow-up"/>
  </button>
</template>

<style scoped>
/* Дополнительные стили при необходимости */
</style>