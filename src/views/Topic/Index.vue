<script setup>

import { ref, reactive, onMounted, onActivated, onDeactivated } from 'vue'
import Item from '../../components/Index/Games/Item.vue'
import { createDirectus, rest, readItems } from '@directus/sdk'
import config from '../../config/config.json'
import { useRoute, useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import { Icon } from '@iconify/vue'
import scrollDown from "../../utils/scrollDown.js";
import { debounce } from "lodash";
import Loader from "../../components/Loader.vue";
import UpButton from "../../components/UpButton.vue";
import scrollTop from "../../utils/scrollTop.js";

const webapp = window.Telegram.WebApp

const route = useRoute()
const router = useRouter()

const back = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'INDEX' })
  }
}

const client = createDirectus(config.DIRECTUS.API).with(rest())

const loading = ref(false)

const games = ref([])
const tempGames = ref([])
const animating = ref(false);
const showUpButton = ref(false);

const page = ref(1)
const pageSize = ref(50)
const firstLoad = ref(true)
const sort = reactive({
  price: false,
  title: false
})

const orderBy = route.params.id

const platform = ref('Xbox')

const sale_prices = ref(null)

const getStartParams = async () => {
  let response = await client.request(readItems('start_params', {
    fields: ['sale_prices']
  }))
  sale_prices.value = response.sale_prices
}

const getGames = async () => {
  let filter;
  let sortParam = [];

  if (orderBy === 'sale') {
    filter = { sale_date_end: { "_nnull": true } };
  } else if (orderBy === 'new') {
    filter = { new: { "_eq": 'Yes' } };
  } else if (orderBy === 'preorder') {
    filter = { preorder: { "_eq": 'Yes' } };
  } else if (orderBy === 'popular') {
    filter = { popular: { "_eq": 'Yes' } };
  }

  if (sort.price) {
    sortParam.push(sort.price === 'lte' ? 'price_standart' : '-price_standart');
  } else if (sort.title) {
    sortParam.push('title');
  }

  try {
    let response = await client.request(readItems('Games', {
      fields: ['*.*.*'],
      filter: {
        status: { "_eq": "published" },
        platform: { "_eq": platform.value },
        ...filter
      },
      page: page.value,
      limit: pageSize.value,
      sort: sortParam.length ? sortParam : []
    }));

    if (response && response.length < pageSize.value) {
      ended.value = true;
    }
    firstLoad.value = false;
    return response;
  } catch (error) {
    loading.value = false;
    throw error;
  }
}

const scrollableElement = ref(null)
const currentScrollPosition = ref(0)

const logCurrentScrollPosition = debounce(() => {
  if (scrollableElement.value) {
    currentScrollPosition.value = scrollableElement.value.scrollTop;
    checkScroll();

    // Определение, показывать ли кнопку UpButton
    const scrollTop = scrollableElement.value.scrollTop;
    const clientHeight = scrollableElement.value.clientHeight;

    // Показываем кнопку, если прокрутка более чем на один экран вниз
    showUpButton.value = scrollTop > clientHeight;
  }
}, 50);

onActivated(() => {
  const from = localStorage.getItem('from')
  const shouldScrollDown = ref(from === 'card')
  webapp.onEvent('backButtonClicked', back)
  webapp.BackButton.show()
  if (shouldScrollDown) {
    scrollDown(scrollableElement, currentScrollPosition)
  } else {
    scrollTop(scrollableElement)
  }
})

onDeactivated(() => {
  webapp.offEvent('backButtonClicked', back)
  webapp.BackButton.hide()
})

onMounted(async () => {
  loading.value = false
  const activeTab = window.localStorage.getItem('activeTab')
  if (activeTab) {
    platform.value = JSON.parse(activeTab).platform
  }
  games.value = await getGames()
  await getStartParams()
})

const checkScroll = () => {
  loading.value = !ended.value;
  if (scrollableElement.value) {
    const scrollTop = scrollableElement.value.scrollTop
    const clientHeight = scrollableElement.value.clientHeight
    const scrollHeight = scrollableElement.value.scrollHeight

    const distanceToEnd = scrollHeight - (scrollTop + clientHeight)

    if (distanceToEnd < 300) {
      if (loading.value && !ended.value) {
        refreshHandler()
      }
    }
  }
  console.log(ended.value)
}

const ended = ref(false)

const refreshHandler = async () => {
  if (!ended.value) {
    loading.value = true;
    page.value = page.value + 1;
    console.log(`Текущая страница: ${page.value}`);
    setTimeout(async () => {
      let next_items = await getGames();
      if (!next_items) return;
      games.value = [...games.value, ...next_items];
      loading.value = false;
    }, 100);
  }
};

function sortProducts() {
  page.value = 1
  ended.value = false
  loading.value = true
  animating.value = true

  getGames().then(newGames => {
    tempGames.value = newGames
    sortGames()
    games.value = [...tempGames.value]
    loading.value = false

    animating.value = false
  })
}

function sortGames() {
  if (tempGames.value) {
    tempGames.value.sort((a, b) => {
      let priceA
      let priceB

      if (sale_prices.value.includes(platform.value)) {
        priceA = a.price_subscription || a.price_sale || a.price_standart;
        priceB = b.price_subscription || b.price_sale || b.price_standart;
      } else {
        priceA = a.price_standart;
        priceB = b.price_standart;
      }

      if (sort.price === 'gte') {
        if (priceA < priceB) return 1;
        if (priceA > priceB) return -1;
      } else if (sort.price === 'lte') {
        if (priceA < priceB) return -1;
        if (priceA > priceB) return 1;
      }

      if (sort.title) {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
      }

      return 0;
    });
  }
}

</script>

<template>
    <main class="flex flex-col overflow-y-auto h-screen pt-20" ref="scrollableElement" @scroll="logCurrentScrollPosition">

        <Header />

        <div v-if="!webapp.initDataUnsafe.user" class="px-4 pb-2.5">
                <button @click="back" class="flex bg-blue w-fit pl-2 pr-4 py-1.5 rounded-xl items-center gap-x-1 font-medium">
                    <Icon icon="ion:chevron-back-outline" />
                    <span>Назад</span>
                </button>
            </div>

      <transition name="fade">
        <Loader v-if="firstLoad" position="fixed"/>
      </transition>
        <transition name="fade">
            <div v-if="games && games.length > 0 " :class="['flex flex-col gap-y-2']">
                <h3 class="px-4 font-medium text-lg">
                    {{ orderBy === 'sale' ? 'Скидки и спецпредложения' : '' }}
                    {{ orderBy === 'new' ? 'Новинки' : '' }}
                    {{ orderBy === 'preorder' ? 'Предзаказы' : '' }}
                    {{ orderBy === 'popular' ? 'Популярные' : '' }}
                </h3>

                <div class="flex justify-around px-4 pt-2">
                    <button @click="() => {
                        sort.title = false
                        if (sort.price === 'lte') {
                            sort.price = 'gte'
                        } else {
                            sort.price = 'lte'
                        }

                        sortProducts()
                    }" :class="['flex w-40 justify-center items-center gap-x-2', !sort.price ? 'text-hint_color' : (platform === 'Xbox' ? 'text-green' : 'text-blue')]">
                        <span class="flex items-center">
                            <Icon v-if="!sort.price || sort.price === 'gte'" icon="bxs:down-arrow" />
                            <Icon v-if="!sort.price || sort.price === 'lte'" icon="bxs:up-arrow" />
                        </span>

                        <span>По цене</span>
                    </button>

                    <button @click="() => {
                        sort.price = false
                        sort.title = true
                        sortProducts()
                    }" :class="['flex w-40 justify-center items-center gap-x-2', !sort.title ? 'text-hint_color' : (platform === 'Xbox' ? 'text-green' : 'text-blue')]">
                        <span class="flex items-center">
                            <Icon icon="icon-park-twotone:list-alphabet" />
                        </span>

                        <span>По названию</span>
                    </button>
                </div>

              <div v-if="sale_prices" :class="['grid grid-cols-2 gap-4 p-4', { 'animate-fade': animating }]">
                    <Item
                        v-for="game, index in games"
                        :key="index"
                        :product="game"
                        :autoResize="true"
                        :sale_prices="sale_prices"
                    />
                </div>
            </div>
        </transition>

      <UpButton />
      <transition name="fade">
        <Loader v-if="loading" position="inline"/>
      </transition>
      <UpButton :visible="scrollableElement && showUpButton" :platform=platform :scrollable-element=scrollableElement></UpButton>
    </main>
</template>

<style scoped>
.grid-cols-2 > * {
  min-height: 250px;
}

.animate-fade {
  animation: fadeOutIn 0.5s ease-in-out;
}

@keyframes fadeOutIn {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>