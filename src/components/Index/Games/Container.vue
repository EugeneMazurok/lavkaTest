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

const games = ref(null)

const props = defineProps({
    activeTab: Object,
    orderBy: String,
    sale_prices: Array
})

const getGames = async () => {

    const cacheKey = props.activeTab.platform

    if (cache.value[cacheKey]) {
        games.value = cache.value[cacheKey]
        return
    }

    loading.value = true

    let filter

    if (props.orderBy === 'sale') {
        filter = {
            sale_date_end: {
                "_nnull": true
            }
        }
    } else
    if (props.orderBy === 'new') {
        filter = {
            new: {
                "_eq": 'Yes'
            }
        }
    } else
    if (props.orderBy === 'preorder') {
        filter = {
            preorder: {
                "_eq": 'Yes'
            }
        }
    } else
    if (props.orderBy === 'popular') {
        filter = {
            popular: {
                "_eq": 'Yes'
            }
        }
    }

    let response = await client.request(readItems('Games', {
        fields: ['*.*.*'],
        filter: {
            status: {
                "_eq": "published"
            },
            platform: {
                "_eq": props.activeTab.platform
            },
            ...filter
        },
        limit: 6
    }))

    cache.value[cacheKey] = response

    games.value = response

    loading.value = false

    emit('child-mounted')

}

onMounted(() => {
    getGames()
})

watch(() => props.activeTab, (newValue) => {
    getGames()
})

</script>

<template>
    <transition name="fade" appear>
        <div v-if="games && games.length > 0 " :class="['even:bg-black min-512:rounded-xl py-6 flex flex-col gap-y-2']">
            <h3 class="px-4 font-medium text-lg">
                {{ orderBy === 'sale' ? 'Скидки и спецпредложения' : '' }}
                {{ orderBy === 'new' ? 'Новинки' : '' }}
                {{ orderBy === 'preorder' ? 'Предзаказы' : '' }}
                {{ orderBy === 'popular' ? 'Популярные' : '' }}
            </h3>

            <div>
                <swiper
                    :slides-per-view="'auto'"
                    space-between="12px"
                >
                <swiper-slide
                    v-for="(game, index) in games"
                    :key="index"
                    class="swiper-slide"
                    style="width: 208px;"
                >
                    <Item :product="game" :sale_prices="sale_prices" />
                </swiper-slide>
                </swiper>
            </div>

            <div class="flex justify-center">
                <router-link :to="{ name: 'TOPIC', params: { id: orderBy }}" :class="[activeTab.platform === 'Xbox' ? 'bg-green' : 'bg-blue', 'px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all active:opacity-75']">Смотреть все</router-link>
            </div>

        </div>
    </transition>
</template>

<style scoped>
.swiper {
  padding: 16px;
}
</style>