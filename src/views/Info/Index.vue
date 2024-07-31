<script setup>

import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Header from '../../components/Header.vue'

import logo from '../../assets/icons/logo.png'
import Cubes from '../../assets/icons/cubes.svg'

const webapp = window.Telegram.WebApp
const router = useRouter()

const back = () => {
  router.go(-1)
}

onActivated(() => {
  webapp.onEvent('backButtonClicked', back)
  webapp.BackButton.show()
})

onDeactivated(() => {
  webapp.offEvent('backButtonClicked', back)
  webapp.BackButton.hide()
})

const links = [
    { id: 0, title: 'Написать в поддержку', icon: 'fluent:chat-16-regular', color: '#E3A226', path: 'https://t.me/lavka_assistant' },
    { id: 1, title: 'Канал со скидками и акциями', image: logo, linear: { from: '#54D277', to: '#354182' }, path: 'https://t.me/lavka_games' },
    { id: 2, title: 'Сообщество XBOX', icon: 'ri:xbox-fill', color: '#54D277', path: 'https://t.me/xboxcommunityru' },
    { id: 3, title: 'Сообщество PLAYSTATION', icon: 'simple-icons:playstation', color: '#354182', path: 'https://t.me/pscommunityru' },
    { id: 4, title: 'Пользовательское соглашение', image: Cubes, color: '#603582', path: '#', separator: true }
]

const getBackgroundStyle = (link) => {
  if (link.color) {
    return { backgroundColor: link.color }
  } else if (link.linear) {
    return { backgroundImage: `linear-gradient(to right, ${link.linear.from}, ${link.linear.to})` }
  } else {
    return {}
  }
}

</script>

<template>
    <main class="h-screen overflow-y-auto pt-20 flex flex-col">
        <Header :page="'INFO'" />

        <div v-if="!webapp.initDataUnsafe.user" class="px-4">
                    <button @click="back" class="flex bg-blue w-fit pl-2 pr-4 py-1.5 rounded-xl items-center gap-x-1 font-medium">
                        <Icon icon="ion:chevron-back-outline" />
                        <span>Назад</span>
                    </button>
                </div>

        <transition name="fade" appear>
            <div v-if="links && links.length > 0" class="flex flex-col gap-y-2 p-4 text-sm">
              <div v-for="link, index in links" :key="index">

                  <hr v-if="link?.separator" class="mt-2 mb-4 border-hint_color" />

                  <a :href="link.path" target="_blank" class="flex items-center gap-x-4">
                    <span :style="getBackgroundStyle(link)" class="w-12 h-12 flex justify-center items-center rounded-xl shrink-0">
                        <Icon v-if="link.icon" :icon="link.icon" class="text-xl" />
                        <img v-else-if="link.image" :src="link.image" class="w-4" />
                    </span>

                    <span>{{ link.title }}</span>
                  </a>
              </div>

              <span class="py-4">
                <span class="text-hint_color">Для обратной связи:</span> <a href='mailto:support@lavka-games.ru'>support@lavka-games.ru</a>
              </span>
            </div>
        </transition>
    </main>
</template>