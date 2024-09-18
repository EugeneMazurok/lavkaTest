<script setup>

import config from '../../config/config.json'
import { useRoute, useRouter } from 'vue-router'
import { ref, reactive, onMounted, onUnmounted, watch, computed, onActivated, onDeactivated } from 'vue'
import { createDirectus, rest, readItems, createItem, createItems } from '@directus/sdk'
import Header from '../../components/Header.vue'
import { Icon } from '@iconify/vue'
import { useBasketStore } from '../../store/basket'
import Item from '../../components/Basket/Item.vue'
import isValidEmail from '../../utils/isValidEmail'
import axios from 'axios'
import generateUUID from '../../utils/generateUUID'
import MainButton from '../../components/Product/MainButton.vue'

const client = createDirectus(config.DIRECTUS.API).with(rest())
const basketStore = useBasketStore()

const router = useRouter()
const route = useRoute()
const webapp = window.Telegram.WebApp

const loading = ref(true)

const back = () => {
  router.go(-1)
}

const start_params = ref(null)

const getStartParams = async () => {
    let response = await client.request(readItems('start_params', {
        fields: ['*']
    }))

    start_params.value = response
}

onActivated(() => {
    webapp.onEvent('backButtonClicked', back)
    webapp.BackButton.show()

    setMainButton()

    webapp.onEvent('mainButtonClicked', mainButtonClicked)

    window.addEventListener('resize', updateHeight)
})

onMounted(async () => {
    await getStartParams()

    loading.value = false
})

onDeactivated(() => {
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
  screenHeight.value = window.innerHeight
}

const mainButtonText = ref('Оформить заказ')
const mainButtonClicked = async () => {

    if (buttonLoader.value) return

    if (!otherData.mail) {

        notValidEmail.error = true
        notValidEmail.message = 'Обязательное поле'
        webapp.HapticFeedback.notificationOccurred('error')
        return

    } else

    if (!isValidEmail(otherData.mail)) {

        notValidEmail.error = true
        notValidEmail.message = 'Некорректно введён e-mail'
        webapp.HapticFeedback.notificationOccurred('error')
        return

    }

    if (start_params.value.sale === 'MANUAL') {
        await manualeMode()
    } else
    if (start_params.value.sale === 'TEST_TINKOFF') {
        await testMode()
    } else
    if (start_params.value.sale === 'PROD_TINKOFF') {
        await prodMode()
    }

}

const setMainButton = () => {
    if (basketStore.orders && basketStore.orders.length > 0) {
        if (start_params.value?.sale === 'OFF') return
        webapp.MainButton.enable()
        mainButtonText.value = 'Оформить заказ'
        webapp.MainButton.color = '#5AAD5D'
        webapp.MainButton.show()
    } else {
        webapp.MainButton.disable()
        mainButtonText.value = 'Пока нечего оформлять'
        webapp.MainButton.color = '#5A5A5A'
        webapp.MainButton.show()
    }

    webapp.MainButton.text = mainButtonText.value
}

watch(() => basketStore.orders, (newValue) => {
    setMainButton()
}, { deep: true })

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
        
        if (el.productOption.plan?.title) {
            name = name + ' ' + el.productOption.plan.title
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

        const ids = result.map((el) => { return { order_id: el.id } })

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
            router.push({ name: 'ORDER', params: { id: orderGroup.id }})
        }

    } else {
        let composition_admin = result.map((el, index) => `\n${index + 1}. ${el.about} - ${el.price.toLocaleString('ru-RU')} ₽ ${(el.type && el.type === 'price_subscription') ? '(цена по подписке)' : ''}`)
        let composition_user = result.map((el, index) => `\n${index + 1}. ${el.about} - ${el.price.toLocaleString('ru-RU')} ₽ ${(el.type && el.type === 'price_subscription') ? '(цена при условии наличия подписки на аккаунте)' : ''}`)
        let order_admin = `<b>Состав заказа:</b>${composition_admin}\n\n<b>Сумма заказа:</b> ${finalPrice._value.toLocaleString('ru-RU')} ₽`
        let order_user = `<b>Состав заказа:</b>${composition_user}\n\n<b>Сумма заказа:</b> ${finalPrice._value.toLocaleString('ru-RU')} ₽`
        let reply
        let btn = []
    
        if (start_params.value.sale === 'MANUAL') {
            reply = order_user + `\n\nСсылка на оплату формируется и будет отправлена вам в этом чате.
            
    // Обратите внимание: заказы исполняются ежедневно с 11:00 до 23:00 по московскому времени. `
        }

        const ids = result.map((el) => { return { order_id: el.id } })

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
    <main class="h-screen pt-20 overflow-y-auto flex flex-col">
        <div class="pb-4">
            <div class="flex flex-col">
                <Header />

                <div v-if="!webapp.initDataUnsafe.user" class="px-4 pb-2.5">
                    <button @click="back" class="flex bg-blue w-fit pl-2 pr-4 py-1.5 rounded-xl items-center gap-x-1 font-medium">
                        <Icon icon="ion:chevron-back-outline" />
                        <span>Назад</span>
                    </button>
                </div>

                <transition name="fade" appear>
                    <div v-if="basketStore.orders && basketStore.orders.length > 0" class="px-4 flex flex-col gap-y-4">
                        <div class="flex text-xl justify-between items-center font-medium">
                            <h2>Корзина</h2>
                            <span>{{ finalPrice && finalPrice.toLocaleString('ru-RU') }} ₽</span>
                        </div>

                        <div class="flex flex-col gap-y-2" v-auto-animate v-if="start_params">
                            <Item
                                v-for="el, index in basketStore.orders"
                                :key="index"
                                :product="el"
                                :sale_prices="start_params.sale_prices"
                            />
                        </div>

                        <div class="relative">
                            <div class="flex flex-col py-2 gap-y-6">
                                <hr class="border-hint_color" />

                                <div class="flex flex-col gap-y-1">
                                    <button @click="() => otherData.checkbox = !otherData.checkbox" class="flex pr-1.5 justify-between text-start gap-x-2 items-center w-full">
                                        <span class="font-medium">У меня нет аккаунта</span>
                                        <span class="w-8 h-8 rounded-lg bg-white shadow-sm  overflow-clip">
                                            <span v-if="otherData.checkbox" class="flex w-full h-full justify-center items-center from-[#6BF792] to-[#36A254] bg-gradient-to-b rounded-lg">
                                                <Icon icon="mdi:check-bold" class="text-2xl" />
                                            </span>
                                        </span>
                                    </button>

                                    <p class="text-sm text-hint_color w-[80%]">Отметьте, если вам нужна помощь в создании. Это бесплатно.</p>
                                </div>

                                <div class="flex flex-col gap-y-2">
                                    <input
                                        :class="['bg-hint_bg_color px-4 py-3 rounded-xl placeholder:text-hint_color outline-none border-[1.5px]', notValidEmail.error ? 'border-red' : 'border-transparent']"
                                        v-model="otherData.mail" @keyup.enter="(e) => e.target.blur()" type="email" placeholder="Введите e-mail для чека"
                                        @focus="() => { notValidEmail.error = false; }"
                                    />

                                    <span v-if="notValidEmail.error && notValidEmail.message" class="text-sm text-red">{{ notValidEmail.message }}</span>
                                </div>

                            </div>

                            <transition name="fade">
                                <div v-if="start_params?.sale === 'OFF'" class="absolute p-4 flex justify-center items-center top-0 left-0 right-0 bottom-0 rounded-xl border-[1.5px] border-hint_color bg-[#373737] bg-opacity-[90%] backdrop-blur-sm">
                                    <div class="flex flex-col gap-y-4 justify-center items-center">
                                        <h3 class="font-medium text-center">Проводятся технические работы</h3>
                                        <span class="text-hint_color text-sm text-center">Мы скоро вернёмся и обязательно оповестим в чате</span>
                                    </div>
                                </div>
                            </transition>
                        </div>

                        <MainButton 
                            v-if="!webapp.initDataUnsafe?.user && start_params?.sale !== 'OFF'"
                            :title="mainButtonText"
                            @submit="mainButtonClicked"
                            :buttonLoader="buttonLoader"
                        />
                    </div>

                    <div :style="{ height: `${screenHeight-142}px` }" v-else class="flex justify-center items-center">
                        <span class="text-xl">Корзина пуста</span>
                    </div>
                </transition>
            </div>
        </div>
    </main>
</template>