<script setup>
import { ref } from 'vue';
import config from '../../../config/config.json';

const props = defineProps({
    data: Object
});

const bannerImageLoaded = ref(false);
const nonBannerImageLoaded = ref(false);

const onBannerImageLoad = () => {
    bannerImageLoaded.value = true;
};

const onNonBannerImageLoad = () => {
    nonBannerImageLoaded.value = true;
};
</script>

<template>
    <router-link v-if="data.is_banner" :to="{ name: 'SUBSCRIPTION', params: { id: data.id }}" :class="['relative flex h-36 shadow-sm']">
        <div class="flex z-10 px-4 py-6">
            <h3 class="font-medium text-lg">Подписка {{ data.title }}</h3>
            <button class="flex bg-[#BE3847] absolute bottom-4 right-4 rounded-xl px-4 py-2 font-medium">Подробнее</button>
        </div>

        <div class="absolute top-0 left-0 right-0 bottom-0">
            <!-- Skeleton Animation -->
            <div v-if="!bannerImageLoaded" class="absolute inset-0 bg-gray-200 animate-pulse"></div>
            
            <!-- Image -->
            <img 
                v-if="data.cover" 
                :src="config.DIRECTUS.API + '/assets/' + data.cover"
                @load="onBannerImageLoad" 
                class="object-cover w-full h-full" 
                :class="{ 'hidden': !bannerImageLoaded }"
            />
            <img 
                v-else-if="data.images && data.images.length > 0" 
                :src="config.DIRECTUS.API + '/assets/' + data.images[0].directus_files_id.id" 
                @load="onBannerImageLoad" 
                class="object-cover w-full h-full" 
                :class="{ 'hidden': !bannerImageLoaded }"
            />
        </div>
    </router-link>

    <div v-else :class="['px-4 py-6 flex flex-col gap-y-6']">
        <h3 class="font-medium text-lg">Подписка {{ data.title }}</h3>

        <router-link :to="{ name: 'SUBSCRIPTION', params: { id: data.id }}" class="bg-card_bg_color max-w-lg overflow-clip rounded-xl flex flex-col">
            <div class="w-full h-56 flex justify-center items-center text-hint_color relative">
                <!-- Skeleton Animation -->
                <div v-if="!nonBannerImageLoaded" class="absolute inset-0 bg-gray-200 animate-pulse"></div>
                
                <!-- Image -->
                <img 
                    v-if="data.cover" 
                    :src="config.DIRECTUS.API + '/assets/' + data.cover.filename_disk" 
                    @load="onNonBannerImageLoad" 
                    class="object-cover w-full h-full rounded-t-xl" 
                    :class="{ 'hidden': !nonBannerImageLoaded }"
                />
            </div>

            <div class="flex flex-col py-4 px-3 gap-y-2">
                <h4 class="font-medium">{{ data.title }}</h4>
                <span v-if="data.prices_slot_1[0].variants_id?.price">от {{ data.prices_slot_1[0].variants_id.price.toLocaleString('ru-RU') }} ₽</span>
            </div>
        </router-link>
    </div>
</template>

<style>
/* Ensure images are not displayed when hidden class is applied */
.hidden {
    display: none;
}
</style>
