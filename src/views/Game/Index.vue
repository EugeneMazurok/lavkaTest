<script setup>

import config from '../../config/config.json'
import {useRoute, useRouter} from 'vue-router'
import {ref, reactive, onMounted, onUnmounted, watch, onActivated, onDeactivated} from 'vue'
import {createDirectus, rest, readItem, readItems} from '@directus/sdk'
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
let buttonColor = ref('')

const back = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({name: 'INDEX'})
  }
}

onActivated(() => {
  webapp.disableVerticalSwipes()
  webapp.onEvent('backButtonClicked', back)
  webapp.BackButton.show()

  activeTabWatch = watch(() => activeTab, (newValue) => {
    checkBasket(newValue.plan);
  }, {deep: true});

  basketStoreWatch = watch(() => basketStore.orders, () => {
    checkBasket(activeTab.plan);
  }, {deep: true});

  webapp.onEvent('mainButtonClicked', mainButtonClicked)
  if (product.value) {
    checkBasket()
    webapp.MainButton.color = product.value?.platform === 'Xbox' ? '#5AAD5D' : '#2E60E7'
  }
})

onDeactivated(() => {
  webapp.offEvent('backButtonClicked', back)
  webapp.BackButton.hide()

  webapp.offEvent('mainButtonClicked', mainButtonClicked)
  webapp.MainButton.hide()

  if (activeTabWatch) {
    activeTabWatch();
    activeTabWatch = null;
  }

  if (basketStoreWatch) {
    basketStoreWatch();
    basketStoreWatch = null;
  }
})

onMounted(async () => {
webapp.disableVerticalSwipes()
  await getProduct(route.params.id)
})

const sale_prices = ref(null)

const getStartParams = async () => {
  let response = await client.request(readItems('start_params', {
    fields: ['sale_prices']
  }))

  sale_prices.value = response.sale_prices.includes(product.value.platform)
}

const getProduct = async (id) => {
  loading.value = true

  let response = await client.request(readItem('Games', id, {
    fields: ['*.*.*']
  }))

  console.log(response)

  product.value = response

  await getStartParams()

  if (product.value.price_sale && sale_prices.value) {
    activeTab.subscribe = false
    activeTab.plan = {id: 'price_sale', price: product.value.price_sale,  title: "На аккаунт"}
  } else if (product.value.price_code) { // Новое условие для price_code
    activeTab.subscribe = false
    activeTab.plan = {id: 'price_code', price: product.value.price_code, title: "Код активации"}
  } else if (product.value.price_standart) {
    activeTab.subscribe = false
    activeTab.plan = {id: 'price_standart', price: product.value.price_standart, title: "На аккаунт"}
  } else {
    activeTab.subscribe = true
    activeTab.plan = {id: 'price_subscription', price: product.value.price_subscription,  title: "На аккаунт"}
  }


  buttonColor.value = JSON.parse(window.localStorage.getItem('activeTab')).color;  // Обновляем через .value

  checkBasket()

  loading.value = false
}

const activeTab = reactive({
  subscribe: null,
  plan: null,
  productCollection: 'Games'
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
  let link = `t.me/${config.DEEP_LINK}?startapp=game-${product.value.id}`
  window.open(`https://t.me/share/url?url=${link}&text=${reply}`)
}

</script>

<template>
  <main class="pt-20 min-h-screen h-screen flex flex-col">
    <div class="flex-1 overflow-y-auto overscroll-contain">
      <div class="flex flex-col">
    <Header/>

    <transition name="fade" appear>

      <div v-if="!loading" class="flex flex-col gap-y-4">

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

            <swiper-slide v-if="product?.cover_link">
              <img :src="product.cover_link" class="w-full h-full object-cover"/>
            </swiper-slide>

            <swiper-slide v-if="product.images" v-for="(url, index) in product.images.split(',')" :key="index">
              <img :src="url.trim()" class="w-full h-full object-cover"/>
            </swiper-slide>

          </swiper>
        </div>

        <div class="px-4 flex justify-between items-start gap-x-2">
          <h1 class="font-medium text-lg">{{ product.title }}</h1>
          <button @click="share"
                  class="text-3xl h-8 w-8 justify-center items-center flex active:opacity-75 transition-all text-hint_color">
            <Icon icon="ion:share-outline"/>
          </button>
        </div>

        <div class="flex flex-col gap-y-2">
          <div class="carousel carousel-center w-full px-4 space-x-2">
            <Tab
                v-if="product.price_sale && sale_prices"
                :title="product.platform === 'PS' ? 'На аккаунт Турция' : 'На аккаунт'"
                :tab="{ price: product.price_sale }"
                :active="activeTab.plan?.id === 'price_sale'"
                @change="() => {
            activeTab.plan = { id: 'price_sale', price: product.price_sale,  title: 'На аккаунт' }
            activeTab.subscribe = false
        }"
                :platform="product.platform"
            />

            <Tab
                v-if="!product.price_sale && product.price_standart"
                :title="product.platform === 'PS' ? 'На аккаунт Турция' : 'На аккаунт'"
                :tab="{ price: product.price_standart }"
                :active="activeTab.plan?.id === 'price_standart'"
                @change="() => {
        activeTab.plan = { id: 'price_standart', price: product.price_standart,  title: 'На аккаунт' }
        activeTab.subscribe = false
    }"
                :platform="product.platform"
            />

            <Tab
                v-if="product.price_subscription && sale_prices"
                :title="product.platform === 'PS' ? 'На аккаунт Турция с PS Plus' : 'На аккаунт\n' +
                 'с Game Pass'"
                :tab="{ price: product.price_subscription }"
                :active="activeTab.plan?.id === 'price_subscription'"
                @change="() => {
            activeTab.plan = { id: 'price_subscription', price: product.price_subscription,  title: 'На аккаунт' }
            activeTab.subscribe = true
        }"
                :platform="product.platform"
            />

            <Tab
                v-if="product.price_code"
                :title="'Код активации'"
                :tab="{ price: product.price_code }"
                :active="activeTab.plan?.id === 'price_code'"
                @change="() => {
            activeTab.plan = { id: 'price_code', price: product.price_code,  title: 'Код активации' }
            activeTab.subscribe = false
        }"
                :platform="product.platform"
            />


          </div>

          <span v-if="product.sale_date_end && sale_prices"
                class="px-4 text-sm text-hint_color">Скидка до {{ product.sale_date_end }}</span>
        </div>

        <div v-if="product.price_subscription" class="flex px-4 w-full">
          <div class="bg-[#9D9D9D] w-full flex flex-col rounded-xl px-4 py-2.5">
            <span class="font-medium text-black">Важно:</span>
            <p v-if="product.platform === 'Xbox'" class="text-black text-sm">Покупка по цене «с Game Pass» возможна,
              если на вашем аккаунте есть подписка Game Pass</p>
            <p v-if="product.platform === 'PS'" class="text-black text-sm">Покупка по цене «с PS Plus» возможна, если на
              вашем аккаунте есть подписка PlayStation Plus</p>
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

            <div v-if="product.language" class="flex gap-x-1 justify-between text-sm flex-wrap">
              <h3 class="text-hint_color">Перевод:</h3>
              <p>{{ product.language }}</p>
            </div>

            <div v-if="product.release_date" class="flex gap-x-1 justify-between text-sm flex-wrap">
              <h3 class="text-hint_color">Дата релиза:</h3>
              <p>{{ product.release_date }}</p>
            </div>
          </div>
        </div>



      </div>

      <Loader v-else/>

    </transition>
        <MainButton
            :is-fixed="true"
            :title="mainButtonText"
            @submit="mainButtonClicked"
            :color="buttonColor"
        />
      </div>
    </div>

  </main>

</template>