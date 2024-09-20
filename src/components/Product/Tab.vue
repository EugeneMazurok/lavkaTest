<script setup>
const emit = defineEmits(['change'])

defineProps({
  title: String,
  tab: Object,
  active: Boolean,
  platform: String
})
</script>

<template>
  <button @click="() => emit('change', tab)"
          :class="['carousel-item rounded-xl p-[1.5px] w-32',
                    active ? (platform === 'Xbox' ? 'from-[#6EFB95] to-[#35A153] bg-gradient-to-b' : 'from-[#4F7DF9] to-[#2E60E7] bg-gradient-to-b') : 'bg-hint_color']">
    <div class="flex w-full bg-bg_color h-[68px] p-2 rounded-[10px] flex-col justify-center items-center">

      <!-- Динамический класс для заголовка -->
      <span v-if="title"
            :class="[active ? (platform === 'Xbox' ? 'text-[#6EFB95]' : 'text-[#4F7DF9]') : 'text-hint_color']"
            class="text-xs">{{ title }}</span>

      <span class="flex gap-x-1 items-end">
                <span class="text-2xl font-semibold">{{ tab.price.toLocaleString('ru-RU') }}</span>
                <span>₽</span>
            </span>

    </div>
  </button>
</template>