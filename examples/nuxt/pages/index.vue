<template>
    <div class="w-full">
        <nav class="w-full h-16 bg-green-900">
            <div class="max-w-6xl px-12 lg:px-0 h-full flex justify-between items-center mx-auto">
                <span class="text-white text-xl font-bold">Tensei</span>
                <button @click="login" class="text-white cursor-pointer font-semibold" v-text="user ? user.email: 'Login'">
                    
                </button>
            </div>
        </nav>

        <section class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mt-16">
          <div class="w-full bg-green-100 rounded h-96" v-for="sq in [1, 2, 3, 4, 5, 6, 7, 8]" :key="sq"></div>
        </section>
    </div>
</template>

<script>
    import { sdk } from '@tensei/sdk'

    const tensei = sdk()

    export default {
        async asyncData(ctx) {
            return {
                user: ctx.req?.session?.user
            }
        },
        mounted() {
            tensei.auth().lis
           tensei.auth().login({
               object: {

               }
           })
        },
        methods: {
            logout() {
                fetch('/auth/logout', {
                    method: 'POST'
                }).then(() => {
                    window.location.href = '/'
                })
            },
            login() {
                if (this.user) {
                    return this.logout()
                }
                fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: 'hey@mail.ru',
                        password: 'password'
                    })
                }).then(() => {
                    window.location.href = '/'
                })
            }
        }
    }
</script>