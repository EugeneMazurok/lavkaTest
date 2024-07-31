<script setup>

import { ref, onMounted, onActivated, onDeactivated } from 'vue'
import Header from '../../components/Header.vue'
import Tabs from '../../components/Index/Tabs.vue'

import config from '../../config/config.json'

import { createDirectus, rest, readItems } from '@directus/sdk'

import Subscriptions from '../../components/Index/Subscriptions/Container.vue'
import Games from '../../components/Index/Games/Container.vue'
import Donations from '../../components/Index/Donations/Container.vue'
import OtherContainer from '../../components/Index/Donations/OtherContainer.vue'
import scrollDown from "../../utils/scrollDown.js";

const webapp = window.Telegram.WebApp;
const client = createDirectus(config.DIRECTUS.API).with(rest())

const tabs = [
    { id: 0, title: 'XBOX', platform: 'Xbox', icon: 'ri:xbox-fill', color: '#5AAD5D' },
    { id: 1, title: 'PlayStation', platform: 'PS', icon: 'simple-icons:playstation', color: '#4556E7' }
]

const activeTab = ref(null)

const changeTab = (tab) => {
    if (activeTab.value.id === tab.id) return
    activeTab.value = tab

    window.localStorage.setItem('activeTab', JSON.stringify(tab))
}

const loading = ref(true)

const sale_prices = ref(null)

const getStartParams = async () => {
    let response = await client.request(readItems('start_params', {
        fields: ['sale_prices']
    }))

    sale_prices.value = response.sale_prices
}

onMounted(async () => {
    let savedTab = window.localStorage.getItem('activeTab')
    if (savedTab) {
        activeTab.value = JSON.parse(savedTab)
    } else {
        activeTab.value = tabs[0]
    }

    await getStartParams()
    webapp.disableVerticalSwipes()
    loading.value = false
})

const scrollableElement = ref(null)
const currentScrollPosition = ref(0)


const logCurrentScrollPosition = () => {
  if (scrollableElement.value) {
    currentScrollPosition.value = scrollableElement.value.scrollTop
  }
}

onActivated(() => {
    scrollDown(scrollableElement, currentScrollPosition)
})

</script>

<template>
    <main ref="scrollableElement" @scroll="logCurrentScrollPosition" class="overflow-y-auto h-screen pt-20 flex flex-col">
          <Header />

          <div v-if="!loading && activeTab">

            <Tabs
                :tabs="tabs"
                :activeTab="activeTab"
                @changeTab="changeTab"
            />

            <Subscriptions 
                :activeTab="activeTab"
               
            />

            <Games
                v-if="sale_prices && sale_prices.includes(activeTab.platform)"
                :activeTab="activeTab"
                :orderBy="'sale'"
                :sale_prices="sale_prices"
               
            />

            <Games 
                :activeTab="activeTab"
                :orderBy="'popular'"
                :sale_prices="sale_prices"
               
            />

            <Games 
                :activeTab="activeTab"
                :orderBy="'new'"
                :sale_prices="sale_prices"
               
            />

            <Games 
                :activeTab="activeTab"
                :orderBy="'preorder'"
                :sale_prices="sale_prices"
               
            />

            <Donations 
                :activeTab="activeTab"
               
            />

            <OtherContainer 
                :activeTab="activeTab"
               
            />

        </div>
    </main>
</template>
