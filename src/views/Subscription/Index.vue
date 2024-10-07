<script setup>

import config from '../../config/config.json'
import {useRoute, useRouter} from 'vue-router'
import {ref, reactive, onMounted, onUnmounted, watch, onActivated, onDeactivated} from 'vue'
import {createDirectus, rest, readItem} from '@directus/sdk'
import Header from '../../components/Header.vue'
import {Icon} from '@iconify/vue'
import {useBasketStore} from '../../store/basket'
import MainButton from '../../components/Product/MainButton.vue'
import Loader from '../../components/Loader.vue'

import Tab from '../../components/Product/Tab.vue'

import {Pagination} from 'swiper/modules'
import {Swiper, SwiperSlide} from 'swiper/vue'
import 'swiper/css'

const modules = [Pagination]

const client = createDirectus(config.DIRECTUS.API).with(rest())
const basketStore = useBasketStore()

const router = useRouter()
const route = useRoute()
const webapp = window.Telegram.WebApp

const product = ref(null)

const loading = ref(true)

let activeTabWatch = null;
let basketStoreWatch = null;

const back = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({name: 'INDEX'})
  }
}

onActivated(() => {
  webapp.onEvent('backButtonClicked', back)
  webapp.BackButton.show()

  webapp.onEvent('mainButtonClicked', mainButtonClicked)

  activeTabWatch = watch(() => activeTab, (newValue) => {
    checkBasket(newValue.plan);
  }, {deep: true});

  basketStoreWatch = watch(() => basketStore.orders, () => {
    checkBasket(activeTab.plan);
  }, {deep: true});

  if (product.value) {
    checkBasket()
    webapp.MainButton.color = product.value?.platform === 'Xbox' ? '#5AAD5D' : '#2E60E7'
    webapp.MainButton.show()
  }
})

onDeactivated(() => {
  if (activeTabWatch) {
    activeTabWatch();
    activeTabWatch = null;
  }

  if (basketStoreWatch) {
    basketStoreWatch();
    basketStoreWatch = null;
  }

  webapp.offEvent('backButtonClicked', back)
  webapp.BackButton.hide()

  webapp.offEvent('mainButtonClicked', mainButtonClicked)
  webapp.MainButton.hide()
})

onMounted(() => {
  getProduct(route.params.id)
})

const plus = [
  {id: 0, title: 'Essential'},
  {id: 1, title: 'Extra'},
  {id: 2, title: 'Deluxe'}
]

const getProduct = async (id) => {
  loading.value = true

  let response = await client.request(readItem('Subscriptions', id, {
    fields: ['*.*.*']
  }))

  product.value = response

  if (product.value.template === 'PP') {
    activeTab.subscribe = plus[0]
    activeTab.plan = product.value.prices_slot_1[0].variants_id
  } else if (product.value.template === 'GP') {
    activeTab.subscribe = 'For old users'
    activeTab.plan = product.value.prices_slot_2[0].variants_id
  } else if (product.value.template === 'EA') {
    activeTab.subscribe = null
    activeTab.plan = product.value.prices_slot_1[0].variants_id
  }

  webapp.MainButton.color = product.value?.platform === 'Xbox' ? '#5AAD5D' : '#2E60E7'
  checkBasket()
  webapp.MainButton.show()

  loading.value = false
}

const activeTab = reactive({
  subscribe: null,
  plan: null,
  productCollection: 'Subscriptions'
})

const setOrder = () => {
  if (activeTab.plan) {
    basketStore.setOrderInBasket({
      product: product.value,
      productOption: {
        subscribe: activeTab.subscribe,
        plan: activeTab.plan,
        productCollection: activeTab.productCollection
      }
    })
  }
}

const mainButtonText = ref('')

const mainButtonClicked = () => {
  if (mainButtonText.value === 'Добавить в корзину') {
    setOrder()
  } else {
    router.push({name: 'BASKET'})
  }
}

const checkBasket = (newValue) => {

  const productInBasket = basketStore.orders.find((el) => el.product.id === product.value.id)
  if (productInBasket) {

    if (productInBasket.productOption?.plan && newValue) {

      const findOption = basketStore.orders.find((el) => (el.product.id === product.value.id && el.productOption.plan.id === newValue.id && el.productOption.productCollection === activeTab.productCollection))

      if (findOption === undefined) {
        mainButtonText.value = 'Добавить в корзину'
      } else {
        mainButtonText.value = 'Перейти в корзину'
      }

    } else {
      mainButtonText.value = 'Перейти в корзину'
    }

  } else {
    mainButtonText.value = 'Добавить в корзину'
  }

  webapp.MainButton.text = mainButtonText.value
}


const share = () => {
  let reply = product.value.title
  let link = `t.me/${config.DEEP_LINK}?startapp=subscription-${product.value.id}`
  window.open(`https://t.me/share/url?url=${link}&text=${reply}`)
}

</script>

<template>
  <main class="overflow-y-auto h-screen pt-20 flex flex-col">
    <Header/>

    <transition name="fade" appear>
      <div v-if="!loading" class="flex flex-col gap-y-4 pb-4">

        <div v-if="!webapp.initDataUnsafe.user" class="px-4">
          <button @click="back" class="flex bg-blue w-fit pl-2 pr-4 py-1.5 rounded-xl items-center gap-x-1 font-medium">
            <Icon icon="ion:chevron-back-outline"/>
            <span>Назад</span>
          </button>
        </div>

        <div>
          <swiper
              :modules="modules"
              class="h-80"
              :slides-per-view="1"
              :pagination="{ clickable: true }"
          >

            <swiper-slide v-if="product.cover && !product.is_banner">
              <img :src="config.DIRECTUS.API + '/assets/' + product.cover.filename_disk"
                   class="w-full h-full object-cover"/>
            </swiper-slide>

            <swiper-slide v-if="product.images && product.images.length > 0" v-for="el, index in product.images"
                          :key="index">
              <img :src="config.DIRECTUS.API + '/assets/' + el.directus_files_id.id"
                   class="w-full h-full object-cover"/>
            </swiper-slide>

          </swiper>
        </div>

        <div class="px-4 flex justify-between items-start gap-x-2">
          <h1 class="font-medium text-lg">{{ product.title }}
            {{ activeTab.subscribe?.title ? activeTab.subscribe.title : '' }} {{ activeTab.plan.title }}</h1>
          <button @click="share"
                  class="text-3xl h-8 w-8 justify-center items-center flex active:opacity-75 transition-all text-hint_color">
            <Icon icon="ion:share-outline"/>
          </button>
        </div>

        <div v-if="product.template === 'PP'" class="flex flex-col gap-y-4">

          <div class="px-4">
            <div class="flex w-full justify-between border-[1.5px] border-hint_color rounded-xl p-0.5">
              <button @click="() => { activeTab.subscribe = el }" v-for="el, index in plus" :key="index"
                      :class="['flex font-medium text-sm p-2.5 transition-all rounded-lg w-1/3 justify-center', activeTab.subscribe?.id === el.id && 'from-[#4F7DF9] to-[#2E60E7] bg-gradient-to-b']">
                {{ el.title }}
              </button>
            </div>
          </div>

          <div class="carousel carousel-center w-full px-4 space-x-2">
            <Tab
                v-for="{ variants_id: el }, index in activeTab.subscribe.id === 0 && product.prices_slot_1 || activeTab.subscribe.id === 1 && product.prices_slot_2 || activeTab.subscribe.id === 2 && product.prices_slot_3"
                :key="index"
                :title="el.title"
                :tab="el"
                :active="el.id === activeTab.plan?.id"
                @change="(e) => activeTab.plan = e"
                :platform="product.platform"
            />
          </div>

        </div>

        <div v-if="product.template === 'GP'" class="flex flex-col gap-y-4">

          <button @click="() => {
                        if (activeTab.subscribe === 'For new users') {
                            activeTab.subscribe = 'For old users'
                        } else {
                            activeTab.subscribe = 'For new users'
                        }
                    }" class="flex justify-between text-start px-4 gap-x-2 items-center w-full">
            <span class="text-sm text-hint_color">На аккаунте ранее не было<br/>подписок</span>
            <span class="w-8 h-8 rounded-lg bg-white shadow-sm  overflow-clip">
                            <span v-if="activeTab.subscribe === 'For new users'"
                                  class="flex w-full h-full justify-center items-center from-[#6BF792] to-[#36A254] bg-gradient-to-b rounded-lg">
                                <Icon icon="mdi:check-bold" class="text-2xl"/>
                            </span>
                        </span>
          </button>
          
          <div class="carousel carousel-center w-full px-4 space-x-2">
            <Tab
                v-for="{ variants_id: el }, index in activeTab.subscribe === 'For new users' ? product.prices_slot_1 : product.prices_slot_2"
                :key="index"
                :title="el.title"
                :tab="el"
                :active="el.id === activeTab.plan?.id"
                @change="(e) => activeTab.plan = e"
                :platform="product.platform"
            />
          </div>

        </div>

        <div v-if="product.template === 'EA'" class="flex flex-col gap-y-4">

          <div class="carousel carousel-center w-full px-4 space-x-2">
            <Tab
                v-for="{ variants_id: el }, index in product.prices_slot_1"
                :key="index"
                :title="el.title"
                :tab="el"
                :active="el.id === activeTab.plan?.id"
                @change="(e) => activeTab.plan = e"
                :platform="product.platform"
            />
          </div>

        </div>

        <div class="px-4 flex flex-col gap-y-4">
          <div v-if="product.description" class="flex flex-col gap-y-1">
            <h3>Описание:</h3>
            <p class="whitespace-pre-wrap text-hint_color text-sm">{{ product.description }}</p>
          </div>

          <div class="flex flex-col gap-y-2">
            <div v-if="product.compatible_platforms" class="flex gap-x-1 justify-between text-sm flex-wrap">
              <h3 class="text-hint_color">Платформа:</h3>
              <p>{{ product.compatible_platforms }}</p>
            </div>
          </div>
        </div>

        <MainButton
            v-if="!webapp.initDataUnsafe?.user"
            :title="mainButtonText"
            @submit="mainButtonClicked"
        />
      </div>

      <Loader v-else/>
    </transition>

  </main>
</template>