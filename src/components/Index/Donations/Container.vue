<script setup>

import { ref, onMounted, watch } from 'vue'
import Item from './Item.vue'
import { createDirectus, rest, readItems } from '@directus/sdk'
import config from '../../../config/config.json'

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'

const client = createDirectus(config.DIRECTUS.API).with(rest())

const emit = defineEmits(['child-mounted'])

const loading = ref(false)
const cache = ref({})

const donation_categories = ref(null)

const props = defineProps({
    activeTab: Object
})

const getCategories = async () => {

    const cacheKey = props.activeTab.platform

    if (cache.value[cacheKey]) {
        donation_categories.value = cache.value[cacheKey]
        return
    }

    loading.value = true

    let response = await client.request(readItems('Subcategories', {
        fields: ['*.*.*'],
        filter: {
            status: {
                "_eq": "published"
            },
            platform: {
                "_eq": props.activeTab.platform
            }
        },
        limit: 6
    }))

    cache.value[cacheKey] = response

    donation_categories.value = response

    loading.value = false

    emit('child-mounted')

}

onMounted(() => {
    getCategories()
})

watch(() => props.activeTab, (newValue) => {
    getCategories()
})

</script>

<template>
    <transition name="fade" appear>
        <div v-if="donation_categories && donation_categories.length > 0 " :class="['even:bg-black min-512:rounded-xl py-6 flex flex-col gap-y-2']">
            <h3 class="px-4 font-medium text-lg">
                Товары для игр
            </h3>

            <div>
                <swiper
                    :slides-per-view="'auto'"
                    space-between="12px"
                >
                <swiper-slide
                    v-for="(category, index) in donation_categories"
                    :key="index"
                    class="swiper-slide"
                    style="width: 208px;"
                >
                    <Item :product="category" />
                </swiper-slide>
                </swiper>
            </div>

            <div class="flex justify-center">
                <router-link :to="{ name: 'CATEGORIES' }" :class="[activeTab.platform === 'Xbox' ? 'bg-green' : 'bg-blue', 'px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all active:opacity-75']">Смотреть все</router-link>
            </div>

        </div>
    </transition>
</template>

<style scoped>
.swiper {
  padding: 16px;
}
</style>