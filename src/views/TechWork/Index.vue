<script setup>
const logoSrc = "../../src/assets/logo.png";
</script>

<template>
  <div class="flex flex-col min-h-screen items-center justify-center bg-bg_color overflow-y-hiddenw"> <!-- Добавлены отступы -->
    <!-- Логотип в левом верхнем углу -->
    <div class="absolute top-5 left-5 h-12"> <!-- Заменено на h-12 для высоты 50px -->
      <img :src=logoSrc alt="Logo" class="h-full w-auto" /> <!-- Установлены классы для логотипа -->
    </div>

    <!-- Сообщение по центру -->
    <div class="text-center px-10">
      <h1 class="text-3xl font-semibold mb-4">На сайте идут технические работы</h1>

      <!-- Новая надпись -->
      <h2 class="text-lg font-medium mb-4 mt-10">Наши социальные сети</h2>

      <!-- Кнопки в столбик -->
      <div class="mt-6 flex flex-col space-y-4 px-10">
        <a
            href="https://t.me/lavka_games"
            target="_blank"
            class="bg-gradient-to-r from-green to-blue text-white font-bold py-6 px-4 rounded-2xl transition-colors duration-200 text-xl"
        >
          Лавка Telegram
        </a>

        <a
            href="https://vk.com/lavka_xbox"
            target="_blank"
            class="bg-green text-white font-bold py-6 px-4 rounded-2xl transition-colors duration-200 text-xl"
        >
          Лавка Xbox ВК
        </a>

        <a
            href="https://vk.com/lavka_playstation"
            target="_blank"
            class="bg-blue text-white font-bold py-6 px-4 rounded-2xl transition-colors duration-200 text-xl"
        >
          Лавка Xbox ВК
        </a>
      </div>
    </div>
  </div>
</template>