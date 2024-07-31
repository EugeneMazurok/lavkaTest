import { ref, watch } from 'vue'

import {
    defineStore
} from "pinia"

export const useBasketStore = defineStore('basketStore', () => {

    let orders = ref([])

    const ordersInLocalStorage = localStorage.getItem("basket-store")
    if (ordersInLocalStorage) orders.value = JSON.parse(ordersInLocalStorage)._value

    watch(() => orders, (state) => {
        localStorage.setItem("basket-store", JSON.stringify(state))
    }, { deep: true })

    const setOrderInBasket = (order) => {
        const productIndexInBasket = orders.value.findIndex((el) => el.product.id === order.product.id);

        if (productIndexInBasket !== -1) {

            if (order.productOption?.plan) {

                const findOptionIndex = orders.value.findIndex((el) =>
                    el.product.id === order.product.id && el.productOption.plan.id === order.productOption.plan.id && el.productOption.productCollection == order.productOption.productCollection
                );

                if (findOptionIndex === -1) {
                    orders.value.splice(productIndexInBasket, 1);
                    orders.value.push(order);
                } else {
                    orders.value.splice(productIndexInBasket, 1);
                }

            } else {
                orders.value.splice(productIndexInBasket, 1);
            }

        } else {
            orders.value.push(order);
        }
    }

    return {
        orders,
        setOrderInBasket
    }
})