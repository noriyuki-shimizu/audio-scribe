// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.scss'],
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
  app: {
    head: {
      htmlAttrs: {
        lang: 'ja'
      },
      link: [
        {
          rel: 'icon',
          sizes: '24x24',
          type: 'image/webp',
          href: '/favicon/icon-24x24.webp'
        },
        {
          rel: 'icon',
          sizes: '32x32',
          type: 'image/webp',
          href: '/favicon/icon-32x32.webp'
        },
        {
          rel: 'icon',
          sizes: '36x36',
          type: 'image/webp',
          href: '/favicon/icon-36x36.webp'
        },
        {
          rel: 'icon',
          sizes: '48x48',
          type: 'image/webp',
          href: '/favicon/icon-48x48.webp'
        },
        {
          rel: 'icon',
          sizes: '192x192',
          type: 'image/webp',
          href: '/favicon/android-chrome-192x192.webp'
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          type: 'image/webp',
          href: '/favicon/apple-touch-icon-180x180.webp'
        }
      ]
    }
  },
  imports: {
    dirs: [
      '@/composables/**/index.{ts,js,mjs,mts}',
      '@/shared/**/index.{ts,js,mjs,mts}',
      '@/utils/**/index.{ts,js,mjs,mts}'
    ]
  }
})
