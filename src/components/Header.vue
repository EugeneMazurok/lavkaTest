<script setup>

import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useBasketStore } from '../store/basket'
import { useRouter } from 'vue-router'

const emit = defineEmits('activeSearch')

const router = useRouter()

const basketStore = useBasketStore()
const theme = ref('Xbox')

onMounted(() => {
    const activeTab = window.localStorage.getItem('activeTab')
    if (activeTab) {
        theme.value = JSON.parse(activeTab).platform
    }
})

defineProps({
    page: String
})

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
                    <span v-if="basketStore.orders && basketStore.orders.length > 0" class="absolute flex justify-center items-center -top-2 -right-2 w-6 h-6 bg-red rounded-full text-xs font-semibold shadow-sm">{{ basketStore.orders.length }}</span>
                </transition>
            </router-link>

            <router-link :to="{ name: 'INFO'}" :class="['flex active:opacity-75 transition-all justify-center items-center h-12 w-12 shrink-0 rounded-xl', page === 'INFO' ? (theme === 'Xbox' ? 'bg-green' : 'bg-blue') : 'bg-hint_bg_color']">
                <img src="../assets/icons/logo.svg" class="w-3.5 h-3.5" />
            </router-link>
        </header>
    </div>
</template>