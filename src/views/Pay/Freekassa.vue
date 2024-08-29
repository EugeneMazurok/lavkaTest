<script setup>
import {ref, onMounted, reactive} from 'vue'
import {useRouter} from 'vue-router'
import isValidEmail from '../../utils/isValidEmail.js'
import axios from 'axios'
import config from '../../config/config.json'
import sbpImage from '../../assets/icons/sbp.png'
import sbpSelectedImage from '../../assets/icons/sbp_selected.png'
import cardImage from '../../assets/icons/card.png'
import cardSelectedImage from '../../assets/icons/card_selected.png'

const router = useRouter()

const mail = ref('')

const notValidEmail = reactive({
  error: false,
  message: ''
})

const amount = new URLSearchParams(window.location.search).get('amount')
const order = new URLSearchParams(window.location.search).get('order')

onMounted(() => {
  if (!amount) {
    router.replace({name: 'INDEX'})
  }
})

const loading = ref(false)
const paymentMethod = ref('sbp') // По умолчанию выбран способ оплаты СБП

const submit = async () => {
  if (!mail.value) {
    notValidEmail.error = true
    notValidEmail.message = 'Обязательное поле'
    return
  } else if (!isValidEmail(mail.value)) {
    notValidEmail.error = true
    notValidEmail.message = 'Некорректно введён e-mail'
    return
  }

  loading.value = true

  try {
    const ipResponse = await axios.get('https://api.ipify.org?format=json')
    const clientIp = ipResponse.data.ip

    const {data: {payment_url}} = await axios.post(config.BOT + `/generate-payment-link`, {
      amount: amount,
      email: mail.value,
      ip: clientIp,
      payment_method: paymentMethod.value, // Используем выбранный способ оплаты
      paymentId: order
    })

    if (!payment_url) return
    window.location.href = payment_url
  } catch (ex) {
    console.log(ex)
  } finally {
    loading.value = false
  }
}

const selectPaymentMethod = (method) => {
  paymentMethod.value = method
}
</script>

<template>
  <div class="flex justify-center items-center h-screen p-4">
        <span class="w-[100px] fixed top-8 left-8">
            <img src="../../assets/logo.png"/>
        </span>

    <div class="flex flex-col gap-y-6 items-center text-center p-4 max-w-[332px] w-full">
      <div class="flex flex-col gap-y-2 w-full">
        <div class="flex justify-around font-medium flex-wrap text-2xl items-center">
          <h4>Ваш заказ:</h4>
          <span>{{ amount }} ₽</span>
        </div>
      </div>

      <div class="flex flex-col from-[#696969] to-[#505050] w-full bg-gradient-to-br rounded-xl">

        <div class="p-2">
          <h4 class="font-medium">Способ оплаты:</h4>
        </div>

        <div class="flex justify-between px-3">
          <img
              :src="paymentMethod === 'sbp' ? sbpSelectedImage : sbpImage"
              @click="selectPaymentMethod('sbp')"
              class="cursor-pointer w-[calc(50%-10px)]"
              alt="Оплата через СБП"
          />
          <img
              :src="paymentMethod === 'card' ? cardSelectedImage : cardImage"
              @click="selectPaymentMethod('card')"
              class="cursor-pointer w-[calc(50%-10px)]"
              alt="Оплата картой"
          />
        </div>

        <div class="px-4 py-6 flex">
          <h4 class="text-left text-sm">Оплатите покупку по СБП или картой любого банка РФ</h4>
        </div>

        <div class="flex flex-col gap-y-2 px-2">
          <input
              :class="['bg-[#7B7B7B] placeholder:text-[#B0B0B0] px-4 py-2.5 text-sm rounded-xl outline-none border-[1.5px]', notValidEmail.error ? 'border-red' : 'border-transparent']"
              v-model="mail" @keyup.enter="(e) => e.target.blur()" type="email" placeholder="Введите e-mail для чека"
              @focus="() => { notValidEmail.error = false; }"
          />

          <span v-if="notValidEmail.error && notValidEmail.message" class="text-sm text-red">{{
              notValidEmail.message
            }}</span>
        </div>

        <div class="p-2">
          <button :disabled="loading" @click="submit"
                  class="bg-green active:opacity-75 flex justify-center items-center transition-all shadow-sm px-4 h-12 font-semibold text-sm w-full rounded-xl"
                  href="#" target='_blank'>
            <Icon v-if="loading" icon="line-md:loading-loop" class="text-lg"/>
            <span v-else>Оплатить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>