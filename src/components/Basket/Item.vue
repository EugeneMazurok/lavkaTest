<script setup>

import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import config from '../../config/config.json'
import { useBasketStore } from '../../store/basket'
import { createDirectus, rest, readItem } from '@directus/sdk'

const client = createDirectus(config.DIRECTUS.API).with(rest())

const loading = ref(true)

const basketStore = useBasketStore()

const props = defineProps({
    product: Object,
    sale_prices: Array,
    discount: {
      type: Number,
      required: false,
      default: 0
    }
})

const setOrder = () => {
    basketStore.setOrderInBasket(props.product)

}

const getProduct = async (id) => {
  console.log(props.product)
    let collection = props.product.productOption.productCollection
    if (collection) {
      try {
            let response = await client.request(readItem(collection, id, {
                fields: ['date_updated', 'status']
            }))

            if (response) {
                if (response.date_updated !== props.product.product.date_updated || response.status !== 'published') {
                    setOrder()
                }
            }
        } catch (ex) {
            setOrder()
        }  
    }
    

    loading.value = false
}

const sales = ref(null)

onMounted(async () => {
    await getProduct(props.product.product.id)

    sales.value = props.sale_prices.includes(props.product.product.platform)

    if (!sales.value) {
       if (props.product.productOption.productCollection === 'Games') {
            if (props.product.productOption.plan.id !== 'price_standart') {
                setOrder()
            }
       }
    }
})

</script>

<template>
    <div class="flex justify-between gap-x-2 items-center">
        <div class="flex items-center gap-x-4">
            <div className="w-20 h-20 shrink-0 rounded-xl overflow-clip bg-secondary_bg_color">
                <div class="w-full h-full" v-if="product.product.cover_link">
                    <img :src="product.product.cover_link" class="w-full h-full object-cover rounded-xl" />
                </div>

                <div v-else-if="product.product.cover" class="w-full h-full">
                    <img :src="config.DIRECTUS.API + '/assets/' + product.product.cover.filename_disk" class="object-cover w-full h-full rounded-xl" />
                </div>

                <div class="w-full h-full" v-else-if="product.product.images && product.product.images.length > 0">
                    <img :src="config.DIRECTUS.API + '/assets/' + product.product.images[0].directus_files_id.id" class="w-full h-full object-cover rounded-xl" />
                </div>

                <span v-else class="flex justify-center items-center w-full h-full">
                    <Icon icon="hugeicons:image-not-found-02" class="text-3xl" />
                </span>
            </div>

            <div class="flex flex-col">
              <div class="flex items-center gap-x-2">
                    <span class="flex text-lg gap-x-1">
                        <span>{{ product.productOption.plan.price.toLocaleString('ru-RU') }}</span>
                        <span>₽</span>
                    </span>
                <span v-if="props.discount > 0" class="bg-green text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{{ props.discount.toLocaleString('ru-RU') }} ₽
                </span>
              </div>

                <span class="line-clamp-1">
                    {{ product.product.title }}
                    {{ product.productOption.subscribe?.title && product.productOption.subscribe.title }}
                    {{ product.productOption.plan?.title && product.productOption.plan.title }}
                </span>

                <span class="text-sm text-hint_color line-clamp-1">{{ product.product.compatible_platforms }}</span>
            </div>
        </div>

        <button @click="setOrder" class="w-12 h-12 rounded-full flex justify-center items-center">
            <Icon icon="mingcute:close-fill" class="text-2xl" />
        </button>
    </div>
</template>