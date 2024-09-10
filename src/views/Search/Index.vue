<script setup>
import {ref, onMounted, nextTick, onActivated, onDeactivated, watch} from 'vue'
import Item from '../../components/Index/Games/Item.vue'
import El from '../../components/Index/Donations/El.vue'
import { createDirectus, rest, readItems } from '@directus/sdk'
import config from '../../config/config.json'
import {useRouter, useRoute, onBeforeRouteLeave} from 'vue-router'
import { Icon } from '@iconify/vue'
import scrollDown from "../../utils/scrollDown.js";

const webapp = window.Telegram.WebApp

const router = useRouter()
const route = useRoute()

const back = () => {
  router.go(-1)
}

const client = createDirectus(config.DIRECTUS.API).with(rest())

const loading = ref(false)

const games = ref(null)
const donations = ref(null)

const platform = ref('Xbox')

const inputRef = ref(null)
const searchValue = ref('')

const sale_prices = ref(null)

const previousRoute = ref(null)

router.beforeEach((to, from, next) => {
  previousRoute.value = from
  next()
})

const clearSearch = () => {
  searchValue.value = ''
  games.value = null
  donations.value = null
}

onBeforeRouteLeave((to, from, next) => {
  if (!to.path.includes('/game')) {
    clearSearch();
    console.log("Переход на маршрут не связанный с играми");
  } else {
    console.log("Переход на маршрут, связанный с играми");
  }
  next();
});

const getStartParams = async () => {
  let response = await client.request(readItems('start_params', {
    fields: ['sale_prices']
  }))

  sale_prices.value = response.sale_prices
}

const search = async () => {
  if (searchValue.value.length >= 3) {
    loading.value = true

    window.sessionStorage.setItem('search', searchValue.value)

    games.value = await getGames()
    donations.value = await getDonations()

    loading.value = false
  }
}

const getGames = async () => {
  loading.value = true

  let response = await client.request(readItems('Games', {
    fields: ['*.*.*'],
    filter: {
      status: {
        "_eq": "published"
      },
      platform: {
        "_eq": platform.value
      },
      _or: [
        { title: { "_icontains": searchValue.value } },
        { meta: { "_icontains": searchValue.value } }
      ]
    },
    limit: 25
  }))

  loading.value = false

  return response
}

const getDonations = async () => {
  loading.value = true

  let response = await client.request(readItems('Donations', {
    fields: ['*.*.*'],
    filter: {
      status: {
        "_eq": "published"
      },
      _or: [
        {
          platform: {
            "_eq": platform.value
          },
        },
        {
          other: {
            "_eq": 'Yes'
          },
        },
      ],
      _or: [
        { title: { "_icontains": searchValue.value } },
        { meta: { "_icontains": searchValue.value } }
      ]
    },
    limit: 25
  }))

  loading.value = false

  return response
}

const scrollableElement = ref(null)
const currentScrollPosition = ref(0)

const logCurrentScrollPosition = () => {
  if (scrollableElement.value) {
    currentScrollPosition.value = scrollableElement.value.scrollTop
  }
}

onActivated(async () => {
  const activeTab = window.localStorage.getItem('activeTab')
  if (activeTab) {
    platform.value = JSON.parse(activeTab).platform
  }
  webapp.onEvent('backButtonClicked', back)
  webapp.BackButton.show()

  await nextTick()
  inputRef.value.focus()
  scrollDown(scrollableElement, currentScrollPosition)
})

onDeactivated(() => {
  webapp.offEvent('backButtonClicked', back)
  webapp.BackButton.hide()
})

onMounted(async () => {
  await nextTick()
  inputRef.value.focus()
  loading.value = true

  const activeTab = window.localStorage.getItem('activeTab')
  if (activeTab) {
    platform.value = JSON.parse(activeTab).platform
  }

  let savedSearch = window.sessionStorage.getItem('search')
  if (savedSearch) {
    searchValue.value = savedSearch
  }

  await getStartParams()
  await search()

  loading.value = false
})
</script>

<template>
  <div class="overflow-y-auto h-screen pt-20 flex flex-col" ref="scrollableElement" @scroll="logCurrentScrollPosition">
    <div class="relative flex flex-col">
      <div v-if="!webapp.initDataUnsafe.user" class="px-4">
        <button @click="back" class="flex bg-blue w-fit pl-2 pr-4 py-1.5 rounded-xl items-center gap-x-1 font-medium">
          <Icon icon="ion:chevron-back-outline" />
          <span>Назад</span>
        </button>
      </div>

      <header class="flex justify-center p-4 gap-x-2 fixed z-20 left-0 right-0 top-0 bg-bg_color">
        <div class="w-full min-512:w-[480px]">
          <div class="flex transition-all items-center gap-x-2.5 text-left bg-hint_bg_color rounded-xl h-12 px-4 w-full">
            <Icon icon="ion:search" class="text-xl shrink-0" />
            <input v-model="searchValue" @keyup.enter="(e) => { e.focus(); e.target.blur(); search() }" ref="inputRef" class="placeholder:text-hint_color line-clamp-1 text-sm w-full h-full outline-none bg-transparent" placeholder="Найти игру" />
          </div>
        </div>
      </header>

      <transition name="fade" appear>
        <div v-if="games && donations" :class="['pb-4 flex flex-col gap-y-2']">
          <div v-if="games.length < 1 && donations.length < 1" class="px-4 py-4 flex justify-center">
            <span class="text-sm text-hint_color text-semibold">Хм, ничего не найдено :(</span>
          </div>

          <div v-if="games.length > 0 || donations.length > 0" class="grid grid-cols-2 gap-4 p-4" v-auto-animate>
            <Item
                v-for="game, index in games"
                :key="index"
                :product="game"
                :sale_prices="sale_prices"
            />

            <El
                v-for="donation, index in donations"
                :key="index"
                :product="donation"
            />
          </div>

          <div class="flex justify-center flex-col items-center gap-y-2.5 px-4">
            <span class="font-medium">Не нашли нужную игру? Напишите нам!</span>
            <a :class="['w-full rounded-xl px-4 py-2.5 text-center shadow-sm active:opacity-75 font-medium', platform === 'Xbox' ? 'bg-green' : 'bg-blue']" href="https://t.me/lavka_assistant" target="_blank">Написать Продавцу Лавки</a>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="loading" class="grid grid-cols-2 gap-4 p-4">
          <div v-for="el in 3" class="flex flex-col h-52 bg-hint_bg_color animate-pulse rounded-xl overflow-clip w-full" />
        </div>
      </transition>
    </div>
  </div>
</template>