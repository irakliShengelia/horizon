<script type="text/ecmascript-6">
    export default {
        props: ['type', 'message', 'autoClose', 'confirmationProceed', 'confirmationCancel'],

        data(){
            return {
                timeout: null,
                isVisible: true
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
            /**
             * Close the modal.
             */
            close(){
                clearTimeout(this.timeout);

                this.isVisible = false;

                this.$root.alert.type = null;
                this.$root.alert.autoClose = false;
                this.$root.alert.message = '';
                this.$root.alert.confirmationProceed = null;
                this.$root.alert.confirmationCancel = null;
            },


            /**
             * Confirm and close the modal.
             */
            confirm(){
                this.confirmationProceed();

                this.close();
            },


            /**
             * Cancel and close the modal.
             */
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
    <div v-if="isVisible" class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50" id="alertModal" tabindex="-1" role="dialog" aria-labelledby="alertModalLabel">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" role="document">
            <div class="p-6">
                <p class="m-0 py-4 text-gray-900 dark:text-gray-100">{{message}}</p>
            </div>

            <div class="px-6 pb-6 flex justify-start flex-row-reverse gap-2">
                <button v-if="type == 'error'" class="btn btn-primary" @click="close">
                    Close
                </button>

                <button v-if="type == 'success'" class="btn btn-primary" @click="close">
                    Okay
                </button>

                <button v-if="type == 'confirmation'" class="btn btn-danger" @click="confirm">
                    Yes
                </button>
                <button v-if="type == 'confirmation'" class="btn btn-secondary" @click="cancel">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<style>

    #alertModal svg {
        display: block;
        margin: 0 auto;
        width: 4rem;
        height: 4rem;
    }
</style>
