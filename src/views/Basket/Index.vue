<script setup>

import config from '../../config/config.json'
import {useRoute, useRouter} from 'vue-router'
import {computed, onActivated, onDeactivated, onMounted, reactive, ref, watch} from 'vue'
import {createDirectus, createItem, createItems, readItems, rest} from '@directus/sdk'
import Header from '../../components/Header.vue'
import {Icon} from '@iconify/vue'
import {useBasketStore} from '../../store/basket'
import Item from '../../components/Basket/Item.vue'
import isValidEmail from '../../utils/isValidEmail'
import axios from 'axios'
import MainButton from '../../components/Product/MainButton.vue'

let checkBasket = null
const client = createDirectus(config.DIRECTUS.API).with(rest())
const isButtonFixed = ref(false);
const basketStore = useBasketStore()

const router = useRouter()
const route = useRoute()
const webapp = window.Telegram.WebApp

const loading = ref(true)
const emailInputRef = ref<HTMLInputElement | null>null;

const back = () => {
  router.go(-1)
}

let buttonColor = ref('')
const start_params = ref(null)

const updateButtonFixedState = () => {
  if (basketStore.orders.length >= 6) {
    isButtonFixed.value = true;
    console.log("ABPBA")
  } else {
    console.log("FALSE")
    isButtonFixed.value = false;
  }
}

const handleBlur = () => {
    emailInputRef.blur(); // Убираем фокус с активного элемента (закрывает клавиатуру)

};

const handleFocus = () => {
  const emailInput = document.getElementById('email-input')
  if (emailInput) {
    emailInput.scrollIntoView({ behavior: 'smooth' })
  }

};

watch(() => basketStore.orders, (newValue) => {
  setMainButton()
}, {deep: true})

const getStartParams = async () => {
  let response = await client.request(readItems('start_params', {
    fields: ['*']
  }))

  start_params.value = response
}

const handleDocumentClick = (event) => {
  const target = event.target;
  if (emailInputRef.value && !emailInputRef.value.contains(target)) {
    console.log("fdsfds")
    emailInputRef.blur();
  }
};

onActivated(() => {
checkBasket = watch(() => basketStore.orders.length, () => {
  updateButtonFixedState();
});
  webapp.MainButton.hide();
  setMainButton()
  window.addEventListener('resize', updateHeight)
  webapp.onEvent('backButtonClicked', back)
  webapp.BackButton.show()


  webapp.onEvent('mainButtonClicked', mainButtonClicked)

})

onMounted(async () => {
checkBasket = watch(() => basketStore.orders.length, () => {
  updateButtonFixedState();
});
  setMainButton()
  await getStartParams()
  window.addEventListener('resize', updateHeight)
  loading.value = false
})

onDeactivated(() => {
  checkBasket = null
  handleBlur()
  webapp.offEvent('backButtonClicked', back)
  webapp.BackButton.hide()

  webapp.offEvent('mainButtonClicked', mainButtonClicked)
  webapp.MainButton.hide()
  webapp.MainButton.enable()

  window.removeEventListener('resize', updateHeight)
})

const screenHeight = ref(window.innerHeight)

const updateHeight = () => {
  screenHeight.value = window.visualViewport?.height || window.innerHeight;
};

const mainButtonText = ref('Оформить заказ')
const mainButtonClicked = async () => {

  if (buttonLoader.value) return

  if (!otherData.mail) {

    notValidEmail.error = true
    notValidEmail.message = 'Обязательное поле'
    webapp.HapticFeedback.notificationOccurred('error')
    const emailInput = document.getElementById('email-input')
    if (emailInput) {
      emailInput.scrollIntoView({ behavior: 'smooth' })
    }
    return

  } else if (!isValidEmail(otherData.mail)) {
    const emailInput = document.getElementById('email-input')
    if (emailInput) {
      emailInput.scrollIntoView({ behavior: 'smooth' })
    }
    notValidEmail.error = true
    notValidEmail.message = 'Некорректно введён e-mail'
    webapp.HapticFeedback.notificationOccurred('error')
    return
  }

  if (start_params.value.sale === 'MANUAL') {
    await manualeMode()
  } else if (start_params.value.sale === 'TEST_TINKOFF') {
    await testMode()
  } else if (start_params.value.sale === 'PROD_TINKOFF') {
    await prodMode()
  }

}

const setMainButton = () => {
// Отключаем встроенную кнопку
  if (basketStore.orders && basketStore.orders.length > 0) {
    if (start_params.value?.sale === 'OFF') return;
    mainButtonText.value = 'Оформить заказ';
    const activeTab = window.localStorage.getItem('activeTab');
    if (activeTab) {
      buttonColor.value = JSON.parse(activeTab).color;  // Обновляем через .value
    }
    if (basketStore.orders.length >= 6) {
      isButtonFixed.value = true;
    } else {
      isButtonFixed.value = false;
    }
    console.log(buttonColor.value);
  } else {

    mainButtonText.value = 'Пока нечего оформлять';
    buttonColor.value = '#5A5A5A'
  }
};

const finalPrice = computed(() => {
  return basketStore.orders.reduce((total, order) => {
    return total + (order.productOption?.plan?.price || 0)
  }, 0)
})

const otherData = reactive({
  mail: '',
  checkbox: false
})

const notValidEmail = reactive({
  error: false,
  message: ''
})

const createOrderItems = async () => {
  let ordersData = []

  basketStore.orders.forEach(async (el) => {

    let name = el.product.platform + ' | ' + el.product.title

    if (el.productOption.subscribe?.title) {
      name = name + ' ' + el.productOption.subscribe.title
    }

    const data = {
      Games: {
        game: el.product.id,
        about: name,
        price: el.productOption.plan.price,
        type: el.productOption.plan.id
      },
      Subscriptions: {
        subscription: el.product.id,
        about: name,
        price: el.productOption.plan.price
      },
      Donations: {
        donation: el.product.id,
        about: name,
        price: el.productOption.plan.price
      }
    }

    ordersData.push(data[el.productOption.productCollection])

  })

  return ordersData
}

const buttonLoader = ref(false)

const createOrder = async () => {

  buttonLoader.value = true

  webapp.MainButton.showProgress()
  webapp.MainButton.disable()

  const orders = await createOrderItems()
  const result = await client.request(createItems('order', orders))

  if (!webapp.initDataUnsafe.user?.id) {

    const ids = result.map((el) => {
      return {order_id: el.id}
    })

    const orderGroup = await client.request(
        createItem('orders', {
          user: webapp.initDataUnsafe.user?.id || null,
          products: ids,
          email: otherData.mail,
          help_with_creation: otherData.checkbox,
          total_price: finalPrice._value
        })
    )

    if (orderGroup) {
      router.push({name: 'ORDER', params: {id: orderGroup.id}})
    }

  } else {
    let composition_admin = result.map((el, index) =>
        `\n${index + 1}. ${el.about} - ${el.price.toLocaleString('ru-RU')} ₽` +
        `${(el.type && el.type === 'price_subscription') ? ' (цена по подписке)' : ''}` +
        `${el.type && el.type === 'price_code' ? ' (Код активации)' : ''}`
    );

    let composition_user = result.map((el, index) =>
        `\n${index + 1}. ${el.about} - ${el.price.toLocaleString('ru-RU')} ₽` +
        `${(el.type && el.type === 'price_subscription') ? ' (цена при условии наличия подписки на аккаунте)' : ''}` +
        `${el.type && el.type === 'price_code' ? ' (Кодом активации)' : ''}`
    );
    let order_admin = `<b>Состав заказа:</b>${composition_admin}\n\n<b>Сумма заказа:</b> ${finalPrice._value.toLocaleString('ru-RU')} ₽`
    let order_user = `<b>Состав заказа:</b>${composition_user}\n\n<b>Сумма заказа:</b> ${finalPrice._value.toLocaleString('ru-RU')} ₽`
    let reply
    let btn = []

    if (start_params.value.sale === 'MANUAL') {
      reply = order_user + `\n\nСсылка на оплату формируется и будет отправлена вам в этом чате.
            
    // Обратите внимание: заказы исполняются ежедневно с 11:00 до 23:00 по московскому времени. `
    }

    const ids = result.map((el) => {
      return {order_id: el.id}
    })

    const orderGroup = await client.request(
        createItem('orders', {
          user: webapp.initDataUnsafe.user?.id || null,
          products: ids,
          email: otherData.mail,
          help_with_creation: otherData.checkbox,
          total_price: finalPrice._value
        })
    )

    if (orderGroup) {

      let userId = webapp.initDataUnsafe.user?.id

      if (start_params.value?.admin_chat && start_params.value.sale === 'MANUAL') {

        let reply_with_admin = `<b>Новый заказ! 🔥🔥🔥</b>\n\n${order_admin}${otherData.checkbox ? '\n\n⚡️НУЖНО ПОМОЧЬ С АККАУНТОМ⚡️' : ''}\n\nПользователь: <a href='tg://user?id=${webapp.initDataUnsafe.user?.id}'>${webapp.initDataUnsafe.user?.first_name}</a> ${webapp.initDataUnsafe.user?.username ? '@' + webapp.initDataUnsafe.user.username : ''}\nID: ${webapp.initDataUnsafe.user?.id}\nПочта: ${otherData.mail}`
        let admin_chat = start_params.value.admin_chat
        try {
          await axios.post(config.BOT + '/api/send-message', {
            message: reply_with_admin,
            chatIds: [admin_chat],
            buttons: []
          })
        } catch (ex) {
          console.log(ex)
        }
      }

      if (userId) {
        try {
          await axios.post(config.BOT + '/api/send-message', {
            message: reply,
            chatIds: [userId],
            buttons: btn
          })
        } catch (ex) {
          console.log(ex)
        }
      }

      window.localStorage.removeItem('basket-store')
      basketStore.orders = []
      webapp.close()
    }

    webapp.MainButton.hideProgress()
    webapp.MainButton.enable()
  }

  buttonLoader.value = false

}

const manualeMode = async () => {
  await createOrder()
}

</script>

<template>
  <main class="flex flex-col h-screen min-h-screen">
    <!-- Header Корзины -->
    <div v-if="basketStore.orders && basketStore.orders.length > 0" class="absolute inset-x-0 top-0 z-20 bg-bg_color py-2 px-4 flex justify-between items-center text-xl font-medium">
      <h2>Корзина</h2>
      <span>{{ finalPrice && finalPrice.toLocaleString('ru-RU') }} ₽</span>
    </div>

    <!-- Основной контент -->
    <div class="flex-1 overflow-y-auto">
      <!-- Кнопка Назад -->
      <div v-if="!webapp.initDataUnsafe.user" class="px-4 py-2">
        <button @click="back" class="flex items-center gap-x-1 bg-blue text-white rounded-xl px-4 py-2 font-medium">
          <Icon icon="ion:chevron-back-outline" />
          <span>Назад</span>
        </button>
      </div>

      <transition name="fade" appear>
        <div class="px-4 flex flex-col gap-y-4">
          <div v-if="basketStore.orders && basketStore.orders.length > 0 " class="mt-16 space-y-4" v-auto-animate>
            <Item
                v-for="(el, index) in basketStore.orders"
                :key="index"
                :product="el"
            />
          </div>

          <!-- Форма для Email -->
          <div class="relative space-y-6">
            <hr class="border-hint_color" />
            <!-- Чекбокс -->
            <div>
              <button @click="() => otherData.checkbox = !otherData.checkbox" class="flex justify-between items-center w-full text-start gap-x-2 pr-1.5">
                <span class="font-medium">У меня нет аккаунта</span>
                <span class="w-8 h-8 bg-white shadow-sm rounded-lg overflow-hidden">
                  <span v-if="otherData.checkbox" class="flex justify-center items-center w-full h-full bg-gradient-to-b from-[#6BF792] to-[#36A254] rounded-lg">
                    <Icon icon="mdi:check-bold" class="text-2xl" />
                  </span>
                </span>
              </button>
              <p class="text-sm text-hint_color mt-1 w-4/5">Отметьте, если вам нужна помощь в создании. Это бесплатно.</p>
            </div>
            <!-- Поле ввода Email -->
            <div class="space-y-2">
              <input
                  id="email-input"
                  ref="emailInputRef"
                  v-model="otherData.mail"
                  :class="['bg-hint_bg_color placeholder:text-hint_color border', notValidEmail.error ? 'border-red' : 'border-transparent', 'px-4 py-3 rounded-xl w-full outline-none']"
                  @blur="handleBlur"
                  @focus="handleFocus"
                  @keyup.enter="(e) => e.target.blur()"
                  type="text"
                  placeholder="Введите e-mail для чека"
              />
              <span v-if="notValidEmail.error && notValidEmail.message" class="text-sm text-red">{{ notValidEmail.message }}</span>

              <!-- Кнопка Подтверждения -->
              <MainButton
                  :title="mainButtonText"
                  :color="buttonColor"
                  @submit="mainButtonClicked"
                  :buttonLoader="buttonLoader"
                  :isFixed="isButtonFixed"
              />
            </div>
          </div>

          <!-- Заглушка для режима OFF -->
          <transition name="fade">
            <div v-if="start_params?.sale === 'OFF'" class="absolute inset-0 flex justify-center items-center bg-[#373737] bg-opacity-90 backdrop-blur-sm border border-hint_color rounded-xl">
              <div class="text-center space-y-4">
                <h3 class="font-medium">Проводятся технические работы</h3>
                <span class="text-sm text-hint_color">Мы скоро вернёмся и обязательно оповестим в чате</span>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </main>
</template>