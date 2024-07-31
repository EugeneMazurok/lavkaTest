<script setup>

import { ref, reactive, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import Item from '../../components/Index/Donations/Item.vue'
import { createDirectus, rest, readItems, aggregate } from '@directus/sdk'
import config from '../../config/config.json'
import Loader from '../../components/Loader.vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import { Icon } from '@iconify/vue'
import scrollDown from "../../utils/scrollDown.js";

const webapp = window.Telegram.WebApp

const router = useRouter()

const back = () => {
  router.go(-1)
}

const route = useRoute()

const client = createDirectus(config.DIRECTUS.API).with(rest())

const loading = ref(false)

const donation_categories = ref(null)

const page = ref(1)
const pageSize = ref(50)

const platform = ref('Xbox')

const getCategories = async () => {

    loading.value = true

    let response = await client.request(readItems('Subcategories', {
        fields: ['*.*.*'],
        filter: {
            status: {
                "_eq": "published"
            },
            platform: {
                "_eq": platform.value
            },
        },
        page: page.value,
        limit: pageSize.value
    }))

    if (response && response.length < pageSize.value) {
        ended.value = true
    }

    return response

}

const scrollableElement = ref(null)
const currentScrollPosition = ref(0)

const logCurrentScrollPosition = () => {
  if (scrollableElement.value) {
    currentScrollPosition.value = scrollableElement.value.scrollTop
    checkScroll()
  }
}

onActivated(() => {
    webapp.onEvent('backButtonClicked', back)
    webapp.BackButton.show()

    window.addEventListener('scroll', checkScroll)
    scrollDown(scrollableElement, currentScrollPosition)
})

onMounted(async () => {
    loading.value = true

    const activeTab = window.localStorage.getItem('activeTab')
    if (activeTab) {
        platform.value = JSON.parse(activeTab).platform
    }

    donation_categories.value = await getCategories()
    loading.value = false
})

onDeactivated(()  => {
    webapp.offEvent('backButtonClicked', back)
    webapp.BackButton.hide()

    window.removeEventListener('scroll', checkScroll)
})

const checkScroll = () => {
    if (scrollableElement.value.scrollTop + scrollableElement.value.clientHeight >= scrollableElement.value.scrollHeight - 30) {
        if (!loading.value) {
            refreshHandler()
        }
    }
}

const ended = ref(false)

const refreshHandler = async () => {
    if (!ended.value) {
        loading.value = true
        page.value = page.value + 1

        let next_items = await getCategories()

        if (!next_items) return
        donation_categories.value = [...donation_categories.value, ...next_items]
    }

    loading.value = false
}

</script>

<template>
    <main class="flex flex-col overflow-y-auto h-screen top-20" ref="scrollableElement" @scroll="logCurrentScrollPosition">

        <Header />

        <div v-if="!webapp.initDataUnsafe.user" class="px-4 pb-2.5">
                    <button @click="back" class="flex bg-blue w-fit pl-2 pr-4 py-1.5 rounded-xl items-center gap-x-1 font-medium">
                        <Icon icon="ion:chevron-back-outline" />
                        <span>Назад</span>
                    </button>
                </div>

        <transition name="fade">
            <div v-if="donation_categories && donation_categories.length > 0 " :class="['pb-4 flex flex-col gap-y-2']">

                <h3 class="px-4 font-medium text-lg">
                    Товары для игр
                </h3>

                <div className="grid grid-cols-2 gap-4 p-4" v-auto-animate>
                    <Item 
                        v-for="product, index in donation_categories"
                        :key="index"
                        :product="product"
                        :autoResize="true"
                    />
                </div>

            </div>
        </transition>
    </main>
</template>