<script setup>
defineProps({
  platform: String,
  position: {
    type: String,
    default: 'fixed', // По умолчанию фиксированный
    validator: value => ['fixed', 'inline'].includes(value) // Возможные значения: 'fixed' и 'inline'
  }
})
</script>

<template>
  <div
      :class="[
            position === 'fixed' ? 'fixed top-0 left-0 right-0 bottom-0 h-dvh flex flex-col gap-y-2 justify-center items-center' : 'flex flex-col gap-y-2 justify-center items-center',
            platform === 'Xbox' && 'text-green',
            platform === 'PS' && 'text-blue'
        ]"
  >
    <span class="loading loading-spinner loading-md"></span>
    <span class="font-medium">Загружаем товар</span>
  </div>
</template>