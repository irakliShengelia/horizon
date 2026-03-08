<script type="text/ecmascript-6">
    export default {
        props: ['type', 'message', 'autoClose', 'confirmationProceed', 'confirmationCancel'],

        data(){
            return {
                timeout: null,
            }
        },

        mounted() {
            if (this.autoClose) {
                this.timeout = setTimeout(() => {
                    this.close();
                }, this.autoClose);
            }
        },

        methods: {
            close(){
                clearTimeout(this.timeout);
                this.$root.alert.type = null;
                this.$root.alert.autoClose = false;
                this.$root.alert.message = '';
                this.$root.alert.confirmationProceed = null;
                this.$root.alert.confirmationCancel = null;
            },

            confirm(){
                this.confirmationProceed();
                this.close();
            },

            cancel(){
                if (this.confirmationCancel) {
                    this.confirmationCancel();
                }
                this.close();
            }
        }
    }
</script>

<template>
    <div class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="p-6">
                <p class="m-0 py-4 text-gray-900 dark:text-gray-100">{{message}}</p>
            </div>

            <div class="flex flex-row-reverse gap-2 px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <button v-if="type == 'error'" class="px-4 py-2 bg-violet-600 text-white rounded text-sm font-medium hover:bg-violet-700 transition-colors" @click="close">
                    Close
                </button>

                <button v-if="type == 'success'" class="px-4 py-2 bg-violet-600 text-white rounded text-sm font-medium hover:bg-violet-700 transition-colors" @click="close">
                    Okay
                </button>

                <button v-if="type == 'confirmation'" class="px-4 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors" @click="confirm">
                    Yes
                </button>
                <button v-if="type == 'confirmation'" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" @click="cancel">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>
