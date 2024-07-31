<script setup>

    import { ref, onMounted, reactive } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import axios from 'axios'
    import config from '../../config/config.json'
    import { createDirectus, rest, readItem } from '@directus/sdk'
    import { Icon } from '@iconify/vue'
    import Loader from '../../components/Loader.vue'

    const client = createDirectus(config.DIRECTUS.API).with(rest())

    const router = useRouter()
    const route = useRoute()

    const order = ref(null)

    const pageLoading = ref(true)

    const getOrder = async () => {
        pageLoading.value = true
        try {
            order.value = await client.request(readItem('orders', route.params.id, {
                fields: ['*']
            }))

            if (order.value.status === 'paid') {
                router.replace({ name: 'SUCCESS' })
            }
        } catch (ex) {
            console.log(ex)
            router.replace({ name: 'INDEX' })
        }

        pageLoading.value = false
    }

    onMounted(() => {
        if (!route.params.id) {
            router.replace({ name: 'INDEX' })
        }

        getOrder()
    })

    const loading = ref(false)

    const submit = async () => {
        loading.value = true

        try {
            const ipResponse = await axios.get('https://api.ipify.org?format=json')
            const clientIp = ipResponse.data.ip

            const { data: { payment_url } } = await axios.post(config.BOT + `/generate-payment-link`, {
                amount: order.value.total_price,
                email: order.value.email,
                ip: clientIp,
                payment_method: "sbp",
                paymentId: order.value.id
            })

            if (!payment_url) return
            window.location.href = payment_url
        } catch (ex) {
            console.log(ex)
        } finally {
            loading.value = false
        }
    }

</script>

<template>
    <Loader v-if="pageLoading" />
    <div v-else class="flex justify-center items-center h-screen p-4">
        <span class="w-[100px] fixed top-8 left-8">
            <img src="../../assets/logo.png" />
        </span>

        <div class="flex flex-col gap-y-6 items-center text-center p-4 max-w-[332px] w-full">
            <div class="flex flex-col gap-y-2 w-full">
                <div class="flex justify-around font-medium flex-wrap text-2xl items-center">
                    <h4>Ваш заказ:</h4>
                    <span>{{ order.total_price }} ₽</span>
                </div>
            </div>
            
            <div class="flex flex-col from-[#696969] to-[#505050] w-full bg-gradient-to-br rounded-xl">

                <div class="p-2">
                    <h4 class="font-medium">Способ оплаты:</h4>
                </div>

                <button class="font-medium bg-[#323232] h-12 flex items-center py-2 px-4 active:opacity-75">
                    <span class="text-[#FA5745] uppercase">Free</span>
                    <span class="text-[#888888] uppercase">Kassa</span>
                </button>

                <button class="font-medium h-12 flex items-center py-2 px-4 active:opacity-75">
                    <img src="../../assets/icons/enot.png" class="w-16" />
                </button>

                <div class="px-4 py-6 flex">
                    <h4 class="text-left text-sm">Оплатите покупку по СБП или картой любого банка РФ</h4>
                </div>

                <div class="p-2">
                    <button :disabled="loading" @click="submit" class="bg-green active:opacity-75 flex justify-center items-center transition-all shadow-sm px-4 h-12 font-semibold text-sm w-full rounded-xl" href="#" target='_blank'>
                        <Icon v-if="loading" icon="line-md:loading-loop" class="text-lg" />
                        <span v-else>Оплатить</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>