<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  title: String,
  buttonLoader: Boolean,
  color: {
    type: String,
    default: '#5AAD5D'
  },
  isFixed: Boolean,
})

const emit = defineEmits(['submit'])
</script>

<template>
  <span :class="isFixed ? ['flex h-20'] : ''" />
  <div :class="['justify-center flex', isFixed ? 'fixed bottom-0 left-0 right-0 bg-secondary_bg_color' : 'static']">
    <div class="min-512:w-[512px] w-full min-512:rounded-t-xl flex justify-center items-center">
      <button
          :disable="buttonLoader"
          :style="{ backgroundColor: color }"
          class="w-full px-2 h-12 flex justify-center items-center rounded-xl shadow-sm font-medium active:opacity-75"
          @click="emit('submit')"
      >
        <Icon v-if="buttonLoader" icon="line-md:loading-loop" class="text-lg" />
        <span v-else>{{ title }}</span>
      </button>
    </div>
  </div>
</template>