import { createRouter, createWebHistory } from "vue-router"
import Index from './views/Index/Index.vue'
import TechWork from './views/TechWork/Index.vue'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/basket',
            component: () => import('./views/Basket/Index.vue'),
            name: 'BASKET'
        },
        {
            path: '/categories',
            component: () => import('./views/Categories/Index.vue'),
            name: 'CATEGORIES'
        },
        {
            path: '/donation/:id?',
            component: () => import('./views/Donation/Index.vue'),
            name: 'DONATION'
        },
        {
            path: '/game/:id?',
            component: () => import('./views/Game/Index.vue'),
            name: 'GAME'
        },
        {
            path: '/',
            component: TechWork,
            name: 'TECHWORK'
        },
        {
            path: '/info',
            component: () => import('./views/Info/Index.vue'),
            name: 'INFO'
        },
        {
            path: '/search',
            component: () => import('./views/Search/Index.vue'),
            name: 'SEARCH'
        },
        {
            path: '/subcategory/:id?',
            component: () => import('./views/Subcategory/Index.vue'),
            name: 'SUBCATEGORY'
        },
        {
            path: '/subscription/:id?',
            component: () => import('./views/Subscription/Index.vue'),
            name: 'SUBSCRIPTION'
        },
        {
            path: '/topic/:id?',
            component: () => import('./views/Topic/Index.vue'),
            name: 'TOPIC'
        },
        {
            path: '/:catchAll(.*)',
            redirect: '/'
        },

        {
            path: '/order/:id?', // POST
            component: () => import('./views/Order/Index.vue'),
            name: 'ORDER'
        },
        {
            path: '/pay/freekassa', // ?amount=1000&order=1
            component: () => import('./views/Pay/Freekassa.vue'),
            name: 'PAY_FREEKASSA'
        },
        {
            path: '/pay/enot', // ?amount=1000&order=1
            component: () => import('./views/Pay/Enot.vue'),
            name: 'PAY_ENOT'
        },

        {
            path: '/success', // Success Payment
            component: () => import('./views/Success/Index.vue'),
            name: 'SUCCESS'
        },
    ]
})