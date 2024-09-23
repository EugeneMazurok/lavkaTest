<template>
  <main v-if="!loading && !exit" class="flex justify-center overflow-y-hidden">
    <div class="w-full max-w-lg">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </router-view>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import config from './config/config.json';
import { createDirectus, rest, readItem } from '@directus/sdk';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const history = ref([
  { name: 'INDEX', path: '/' }
]);

const openedWindows = ref([
  { name: 'INDEX', path: '/' }
]);

const updateWindows = (newRoute) => {
  const matchedHistory = history.value.find(item => item.path === newRoute.path);
  if (!matchedHistory) {
    const newHistoryItem = { name: newRoute.name || newRoute.path, path: newRoute.path };
    history.value.push(newHistoryItem);
    openedWindows.value.push(newHistoryItem);
  }
};

watch(route, (newRoute) => {
  updateWindows(newRoute);
});

const client = createDirectus(config.DIRECTUS.API).with(rest());

const webapp = window.Telegram.WebApp;
const init = Object.entries(webapp.initDataUnsafe).length > 0;
const chat_id = webapp.initDataUnsafe?.user?.id || config.TEST_CHAT_ID || null;
const loading = ref(false);

onMounted(async () => {

  // if (window.location.protocol !== 'https:') {
  //   window.location.href = window.location.href.replace("http", "https")
  // }

  if (init) {
    webapp.disableVerticalSwipes();
    webapp.setBackgroundColor('#181818');
    webapp.setHeaderColor('#181818');
    webapp.expand();
  }

  if (chat_id) {
    loading.value = true;
    await getUserData(chat_id);
    loading.value = false;
  }

  let tgWebAppStartParam = new URLSearchParams(window.location.search).get('tgWebAppStartParam');

  const tabs = [
    { id: 0, title: 'XBOX', platform: 'Xbox', icon: 'ri:xbox-fill', color: '#5AAD5D' },
    { id: 1, title: 'PlayStation', platform: 'PS', icon: 'simple-icons:playstation', color: '#4556E7' }
  ];

  if (tgWebAppStartParam) {
    const params = tgWebAppStartParam.split('-');
    const page = params[0].toUpperCase();
    const remainingValues = params.slice(1).join('-');

    if (page === 'XBOX' ||  page === 'PS') {
        const tab = page === 'XBOX' ? tabs[0] : tabs[1];
        window.localStorage.setItem('activeTab', JSON.stringify(tab))
        await router.replace({ name: 'TOPIC', params: { id: remainingValues }});
        return
    }

    await router.push({ name: page, params: { id: remainingValues }});
  } else {
    if (route.path !== '/') {
      router.push('/');
    }
  }
  updateWindows(route);
});

const userData = ref(null);
const exit = ref(false);

const getUserData = async (chat_id) => {
  let response = await client.request(readItem('users', chat_id, {
    fields: ['blocked']
  }));

  userData.value = response;

  if (response.blocked) {
    exit.value = true;
    webapp.showAlert('Доступ к боту заблокирован, если вы считаете, что произошла ошибка, напишите, пожалуйста, Продавцу Лавки — @lavka_assistant', () => {
      webapp.close();
    });
  }
};
</script>
