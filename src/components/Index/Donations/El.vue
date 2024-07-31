<script setup>
import { ref } from 'vue';
import config from '../../../config/config.json';

const props = defineProps({
    product: Object,
    autoResize: Boolean
});

const imageLoaded = ref(false);
const onImageLoad = () => {
    imageLoaded.value = true;
};
</script>

<template>
    <router-link :to="{ name: 'DONATION', params: { id: product.id }}" :class="['flex flex-col bg-hint_bg_color rounded-xl overflow-clip w-full']">
        <div class="aspect-w-1 aspect-h-1 relative">
            <!-- Skeleton Animation -->
            <div v-if="!imageLoaded" class="absolute inset-0 bg-gray-200 animate-pulse"></div>
            
            <!-- Image -->
            <img 
                v-if="product.cover" 
                :src="config.DIRECTUS.API + '/assets/' + product.cover.filename_disk" 
                @load="onImageLoad" 
                class="object-cover w-full h-full rounded-t-xl" 
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

            <span v-if="product.prices[0].variants_id?.price">
              <span v-if="product.prices.length > 1">от</span> {{ product.prices[0].variants_id.price.toLocaleString('ru-RU') }} ₽
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
