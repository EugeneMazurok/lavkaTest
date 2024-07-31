<script setup>

import { ref, reactive, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import El from '../../components/Index/Donations/El.vue'
import { createDirectus, rest, readItems, readItem, aggregate } from '@directus/sdk'
import config from '../../config/config.json'
import { useRoute, useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import { Icon } from '@iconify/vue'
import Loader from "../../components/Loader.vue";
import scrollDown from "../../utils/scrollDown.js";

const webapp = window.Telegram.WebApp

const router = useRouter()

const back = () => {
  router.go(-1)
}

const route = useRoute()

const client = createDirectus(config.DIRECTUS.API).with(rest())

const loading = ref(false)

const donations = ref(null)

const page = ref(1)
const pageSize = ref(50)

const platform = ref('Xbox')

const cat_id = route.params.id

const subcategory = ref(null)

const getSubcategory = async () => {
    let response = await client.request(readItem('Subcategories', cat_id, {
        fields: ['*']
    }))

    subcategory.value = response
}

const getDonations = async () => {

    loading.value = true

    let filter

    if (cat_id === 'other') {
        filter = {
            other: {
                "_eq": 'Yes'
            },
            _or: [
                {
                    platform: {
                        "_eq": platform.value
                    }
                },
                {
                    platform: {
                        "_null": true
                    },
                }
            ]
        }
    } else {
        await getSubcategory()
        filter = {
            platform: {
                "_eq": platform.value
            },
            other: {
                "_null": true
            },
            subcategory: {
                "_eq": cat_id
            }
        }
    }


    let response = await client.request(readItems('Donations', {
        fields: ['*.*.*'],
        filter: {
            status: {
                "_eq": "published"
            },
            ...filter
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

    scrollDown(scrollableElement, currentScrollPosition)
})

onDeactivated(() => {
    webapp.offEvent('backButtonClicked', back)
    webapp.BackButton.hide()
})

onMounted(async () => {
    loading.value = true

    const activeTab = window.localStorage.getItem('activeTab')
    if (activeTab) {
        platform.value = JSON.parse(activeTab).platform
    }

    donations.value = await getDonations()
    loading.value = false
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

        let next_items = await getDonations()

        if (!next_items) return
        donations.value = [...donations.value, ...next_items]
    }

    loading.value = false
}

</script>

<template>
    <main class="flex flex-col pb-4 overflow-y-auto h-screen pt-20" ref="scrollableElement" @scroll="logCurrentScrollPosition">

        <Header />

        <div v-if="!webapp.initDataUnsafe.user" class="px-4 pb-2.5">
                    <button @click="back" class="flex bg-blue w-fit pl-2 pr-4 py-1.5 rounded-xl items-center gap-x-1 font-medium">
                        <Icon icon="ion:chevron-back-outline" />
                        <span>Назад</span>
                    </button>
                </div>

        <transition name="fade">
            <div v-if="donations && donations.length > 0 " :class="['flex flex-col gap-y-2']">

                <h3 v-if="subcategory" class="px-4 font-medium text-lg">
                    {{ subcategory.title }}
                </h3>

                <div className="grid grid-cols-2 gap-4 p-4" v-auto-animate>
                    <El 
                        v-for="donation, index in donations"
                        :key="index"
                        :product="donation"
                        :autoResize="true"
                    />
                </div>

            </div>
        </transition>

        <transition name="fade">
          <Loader v-if="loading" />
        </transition>
    </main>
</template>