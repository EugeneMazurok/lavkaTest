<script setup>
import { ref, onMounted } from 'vue';
import config from '../../../config/config.json';

const props = defineProps({
    product: Object,
    sale_prices: Array
});

const imageLoaded = ref(false);
const onImageLoad = () => {
    imageLoaded.value = true;
};

const sales = ref(null)
onMounted(() => {
    sales.value = props.sale_prices.includes(props.product.platform)
})
</script>

<template>
    <router-link :to="{ name: 'GAME', params: { id: product.id }}" :class="['carousel-item flex flex-col bg-hint_bg_color rounded-xl overflow-clip w-full']">
        <div class="aspect-w-1 aspect-h-1 relative">
            <!-- Skeleton Animation -->
            <div v-if="!imageLoaded" class="absolute inset-0 bg-gray-200 animate-pulse"></div>
            
            <!-- Image -->
            <img 
                v-if="product.cover_link" 
                :src="product.cover_link" 
                @load="onImageLoad" 
                class="w-full h-full object-cover" 
                :class="{ 'hidden': !imageLoaded }"
            />
            <img 
                v-else-if="product.images && product.images.length > 0" 
                :src="config.DIRECTUS.API + '/assets/' + product.images[0].directus_files_id.id" 
                @load="onImageLoad" 
                class="w-full h-full object-cover" 
                :class="{ 'hidden': !imageLoaded }"
            />
        </div>
        
        <div class="flex flex-col justify-between py-4 px-3 h-28">
            <span class="line-clamp-2 text-sm font-medium">{{ product.title }}</span>
            <span>
                {{ (product.price_subscription && sales) && product.price_subscription.toLocaleString('ru-RU') || (product.price_sale && sales) && product.price_sale.toLocaleString('ru-RU') || product.price_standart && product.price_standart.toLocaleString('ru-RU') }} ₽
            </span>
        </div>
    </router-link>
</template>

<style>
/* Ensure images are not displayed when hidden class is applied */
.hidden {
    display: none;
}
</style>
