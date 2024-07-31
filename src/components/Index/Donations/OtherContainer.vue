<script setup>

import { ref, onMounted, watch } from 'vue'
import Item from './El.vue'
import { createDirectus, rest, readItems } from '@directus/sdk'
import config from '../../../config/config.json'

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'

const client = createDirectus(config.DIRECTUS.API).with(rest())

const emit = defineEmits(['child-mounted'])

const props = defineProps({
    activeTab: Object
})

const loading = ref(false)
const cache = ref({})

const others = ref(null)

const getOthers = async () => {

    const cacheKey = props.activeTab.platform

    if (cache.value[cacheKey]) {
        others.value = cache.value[cacheKey]
        return
    }

    loading.value = true

    let response = await client.request(readItems('Donations', {
        fields: ['*.*.*'],
        filter: {
            status: {
                "_eq": "published"
            },
            other: {
                "_eq": 'Yes'
            },
            _or: [
                {
                    platform: {
                        "_eq": props.activeTab.platform
                    }
                },
                {
                    platform: {
                        "_null": true
                    },
                }
            ]
        },
        limit: 6
    }))

    cache.value[cacheKey] = response

    others.value = response

    loading.value = false

    emit('child-mounted')

}

onMounted(() => {
    getOthers()
})

watch(() => props.activeTab, (newValue) => {
    getOthers()
})

</script>

<template>
    <transition name="fade" appear>
        <div v-if="others && others.length > 0 " :class="['even:bg-black min-512:rounded-xl py-6 flex flex-col gap-y-2']">
            <h3 class="px-4 font-medium text-lg">
                Другое
            </h3>

            <div>
                <swiper
                    :slides-per-view="'auto'"
                    space-between="12px"
                >
                <swiper-slide
                    v-for="(other, index) in others"
                    :key="index"
                    class="swiper-slide"
                    style="width: 208px;"
                >
                    <Item :product="other" />
                </swiper-slide>
                </swiper>
            </div>

            <div class="flex justify-center">
                <router-link :to="{ name: 'SUBCATEGORY', params: { id: 'other' }}" :class="[activeTab.platform === 'Xbox' ? 'bg-green' : 'bg-blue', 'px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all active:opacity-75']">Смотреть все</router-link>
            </div>

        </div>
    </transition>
</template>

<style scoped>
.swiper {
  padding: 16px;
}
</style>