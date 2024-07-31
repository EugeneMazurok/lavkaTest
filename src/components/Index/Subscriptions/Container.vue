<script setup>

import { ref, onMounted, watch } from 'vue'
import Item from './Item.vue'
import { createDirectus, rest, readItems } from '@directus/sdk'
import config from '../../../config/config.json'

const client = createDirectus(config.DIRECTUS.API).with(rest())

const emit = defineEmits(['child-mounted'])

const loading = ref(false)
const cache = ref({})

const subscriptions = ref(null)

const props = defineProps({
    activeTab: Object
})

const getSubscriptions = async () => {

    const cacheKey = props.activeTab.platform
    
    if (cache.value[cacheKey]) {
        subscriptions.value = cache.value[cacheKey]
        return
    }

    loading.value = true

    let response = await client.request(readItems('Subscriptions', {
            fields: ['*.*.*'],
            filter: {
                status: {
                    "_eq": "published"
                },
                platform: {
                    "_eq": cacheKey
                }
            }
        }))
    
    cache.value[cacheKey] = response

    subscriptions.value = response

    loading.value = false

    emit('child-mounted')

}

onMounted(() => {
    getSubscriptions()
})

watch(() => props.activeTab, (newValue) => {
    subscriptions.value = null
    getSubscriptions()
})

</script>

<template>
   <transition name="fade" appear>
        <div class="even:bg-secondary_bg_color min-512:rounded-xl" v-if="subscriptions && subscriptions.length > 0">
            <Item
                v-for="subscribe, index in subscriptions"
                :key="index"
                :data="subscribe"
            />
        </div>
    </transition>
</template>