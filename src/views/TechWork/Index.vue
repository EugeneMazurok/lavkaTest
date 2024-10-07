<script setup>
const logoSrc = "../assets/logo.png";
</script>

<template>
  <div class="flex flex-col min-h-screen items-center justify-center bg-gray-100">

    <div class="absolute top-4 left-4">
      <img :src="logoSrc" alt="Logo" class="w-16 h-16" />
    </div>

    <div class="text-center">
      <h1 class="text-2xl font-semibold mb-4 text-gray-800">Проводятся технические работы</h1>

      <div class="mt-6 space-y-4">

        <a
            href="https://t.me/yourchannel"
            target="_blank"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
        >
          Telegram
        </a>

        <a
            href="https://instagram.com/yourprofile"
            target="_blank"
            class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
        >
          Instagram
        </a>

        <a
            href="https://twitter.com/yourprofile"
            target="_blank"
            class="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
        >
          Twitter
        </a>
      </div>
    </div>
  </div>
</template>

