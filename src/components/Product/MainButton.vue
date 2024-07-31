<script setup>

    import { Icon } from '@iconify/vue'

    defineProps({
        title: String,
        buttonLoader: Boolean
    })

    const emit = defineEmits(['submit'])

</script>

<template>
    <span class="flex h-20" />
    <div class="fixed bottom-0 left-0 right-0 justify-center flex">
       <div class="min-512:w-[512px] w-full min-512:rounded-t-xl p-4 bg-secondary_bg_color flex justify-center items-center">
            <button :disable="buttonLoader" class="bg-blue w-full px-2 h-12 flex justify-center items-center rounded-xl shadow-sm font-medium active:opacity-75" @click="emit('submit')">
                <Icon v-if="buttonLoader" icon="line-md:loading-loop" class="text-lg" />
                <span v-else>{{ title }}</span>
            </button>
       </div>
    </div>
</template>