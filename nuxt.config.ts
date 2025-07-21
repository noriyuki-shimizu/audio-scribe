// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  nitro: {
    preset: 'vercel',
    vercel: {
      functions: {
        maxDuration: 60
      }
    },
    experimental: {
      wasm: true
    }
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    }
  },
  modules: ['nuxt-svgo', '@nuxt/eslint'],
  imports: {
    dirs: [
      '@/composables/**/index.{ts,js,mjs,mts}',
      '@/shared/**/index.{ts,js,mjs,mts}',
      '@/utils/**/index.{ts,js,mjs,mts}'
    ]
  }
})
