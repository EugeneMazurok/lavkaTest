<script setup>
import { ref, onMounted, computed, onActivated, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useBasketStore } from '../store/basket';
import { useRouter } from 'vue-router';

const emit = defineEmits('activeSearch');
const basketStore = useBasketStore();
const router = useRouter();

const platform = ref('Xbox');
const theme = ref('Xbox');

// Вычисляемое свойство для orders
const orders = computed(() => {
  return basketStore.orders.filter(order => order.product.platform === platform.value);
});

// Слушаем изменения в localStorage для activeTab
watch(
    () => localStorage.getItem('activeTab'),
    (newActiveTab) => {
        const parsedActiveTab = JSON.parse(newActiveTab);
        platform.value = parsedActiveTab.platform;
        // Здесь мы можем вызвать computed свойство orders, чтобы оно обновилось
    },
    { immediate: true } // Сразу вызываем при монтировании
);

// Функция для инициализации платформы из localStorage
const initializePlatform = () => {
  const activeTab = window.localStorage.getItem('activeTab');
  if (activeTab) {
    platform.value = JSON.parse(activeTab).platform;
    theme.value = platform.value; // Обновляем тему
  }
};

let lastActiveTab = localStorage.getItem('activeTab');

setInterval(() => {
  const currentActiveTab = localStorage.getItem('activeTab');
  if (currentActiveTab !== lastActiveTab) {
    lastActiveTab = currentActiveTab;
    const parsedActiveTab = currentActiveTab ? JSON.parse(currentActiveTab) : null;
    if (parsedActiveTab) {
      platform.value = parsedActiveTab.platform;
    }
  }
}, 100); // Проверка каждую секунду


const handleStorageChange = (event) => {
  if (event.key === 'activeTab') {
    console.log(event.key)
    const newActiveTab = event.newValue;
    if (newActiveTab) {
      platform.value = JSON.parse(newActiveTab).platform;
      console.log("поменялась activeTab")    }
  }
};

onMounted(() => {
  initializePlatform();
  window.addEventListener('storage', handleStorageChange);
});

onActivated(()=> {
  initializePlatform();
  window.addEventListener('storage', handleStorageChange);
})

defineProps({
  page: String,
});
</script>

<template>
  <div class="fixed top-0 left-0 right-0 z-20 bg-bg_color justify-center flex">
    <header class="flex p-4 gap-x-2 min-512:w-[512px] w-full">
      <router-link :to="{ name: 'SEARCH' }" class="flex active:opacity-75 transition-all items-center gap-x-2.5 text-left bg-hint_bg_color rounded-xl h-12 px-4 w-full">
        <Icon icon="ion:search" class="text-xl shrink-0" />
        <span class="text-hint_color line-clamp-1 text-sm">Найти игру</span>
      </router-link>

      <router-link :to="{ name: 'BASKET' }" class="flex active:opacity-75 transition-all justify-center items-center h-12 w-12 shrink-0 bg-hint_bg_color rounded-xl relative">
        <Icon icon="ion:cart-outline" class="text-xl" />
        <transition name="bounce" appear>
          <span v-if="orders && orders.length > 0" class="absolute flex justify-center items-center -top-2 -right-2 w-6 h-6 bg-red rounded-full text-xs font-semibold shadow-sm">{{ orders.length }}</span>
        </transition>
      </router-link>

      <router-link :to="{ name: 'INFO'}" :class="['flex active:opacity-75 transition-all justify-center items-center h-12 w-12 shrink-0 rounded-xl', page === 'INFO' ? (theme === 'Xbox' ? 'bg-green' : 'bg-blue') : 'bg-hint_bg_color']">
        <img src="../assets/icons/logo.svg" class="w-3.5 h-3.5" />
      </router-link>
    </header>
  </div>
</template>
