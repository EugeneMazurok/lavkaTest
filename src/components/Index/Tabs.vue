<script setup>
  import { ref, computed, watch } from 'vue';
  import { Icon } from '@iconify/vue';
  
  const emit = defineEmits(['changeTab']);
  const props = defineProps({
    activeTab: Object,
    tabs: Array,
  });
  
  const isDragging = ref(false);
  const startX = ref(0);
  const currentTranslate = ref(props.activeTab.id === props.tabs[0].id ? 0 : 100);
  
  const colorInterpolate = (start, end, factor) => {
    const result = start.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (end[i] - start[i]));
    }
    return `rgb(${result.join(',')})`;
  };
  
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  };
  
  const startColor = hexToRgb('#5AAD5D');
  const endColor = hexToRgb('#4556E7');
  
  const sliderColor = computed(() => {
    const factor = currentTranslate.value / 100;
    return colorInterpolate(startColor, endColor, factor);
  });
  
  const sliderStyle = computed(() => ({
    transform: `translateX(${currentTranslate.value}%)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
    backgroundColor: sliderColor.value,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    borderRadius: '8px',
    zIndex: 0,
  }));
  
  const setActiveTab = (tabId) => {
    currentTranslate.value = tabId === props.tabs[0].id ? 0 : 100;
  };
  
  const startDrag = (event) => {
    isDragging.value = true;
    startX.value = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopDrag);
  };
  
  const onDrag = (event) => {
    if (!isDragging.value) return;
    const currentX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const deltaX = currentX - startX.value;
    const movePercent = (deltaX / document.querySelector('.flex.w-full').clientWidth) * 100;
    currentTranslate.value = props.activeTab.id === props.tabs[0].id ? movePercent : 100 + movePercent;
    if (currentTranslate.value < 0) currentTranslate.value = 0;
    if (currentTranslate.value > 100) currentTranslate.value = 100;
  };
  
  const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
  
    const newTab = currentTranslate.value > 50 ? props.tabs[1] : props.tabs[0];
    emit('changeTab', newTab);
    setActiveTab(newTab.id);
  };
  
  watch(() => props.activeTab, (newVal) => {
    setActiveTab(newVal.id);
  });
</script>

<template>
    <div class="flex px-4 pb-4">
      <div class="w-full border-[1.5px] border-hint_color p-0.5 rounded-xl overflow-clip">
          <div
            class="flex w-full overflow-clip relative"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <button
              v-for="tab, index in tabs"
              :key="index"
              :style="{ backgroundColor: activeTab.id === tab.id ? sliderColor.value : 'transparent white' }"
              :class="['w-1/2 outline-none z-10 flex gap-x-2 items-center justify-center rounded-[8px] p-2.5', activeTab.id !== tab.id && '!bg-transparent opacity-60']"
              @click="() => emit('changeTab', tab)"
            >
              <Icon :icon="tab.icon" class="text-xl shrink-0" />
              <span class="uppercase font-medium line-clamp-1">{{ tab.title }}</span>
            </button>
            <div class="slider" :style="sliderStyle"></div>
          </div>
        </div>
      </div>
  </template>