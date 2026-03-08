<script type="text/ecmascript-6">
    export default {
        data() {
            return {
                ready: false,
                loadingNewEntries: false,
                hasNewEntries: false,
                page: 1,
                previousFirstId: null,
                batches: [],
            };
        },

        mounted() {
            document.title = "Horizon - Batches";
        },

        watch: {
            '$route'() {
                this.page = 1;
                this.loadBatches();
            },

            '$root.autoLoadsNewEntries'(autoLoadsNewEntries) {
                if (autoLoadsNewEntries && this.hasNewEntries) {
                    this.hasNewEntries = false;
                }
            }
        },

        methods: {
            loadBatches(beforeId = '', refreshing = false) {
                if (!refreshing) {
                    this.ready = false;
                }

                this.$http.get(Horizon.basePath + '/api/batches?before_id=' + beforeId)
                    .then(response => {
                        if (!this.$root.autoLoadsNewEntries && refreshing && !response.data.batches.length) {
                            this.ready = true;
                            return;
                        }

                        if (!this.$root.autoLoadsNewEntries && refreshing && this.batches.length && response.data.batches[0]?.id !== this.batches[0]?.id) {
                            this.hasNewEntries = true;
                        } else {
                            this.batches = response.data.batches;
                        }

                        this.ready = true;
                    });
            },

            loadNewEntries() {
                this.batches = [];
                this.loadBatches(0, false);
                this.hasNewEntries = false;
            },

            refreshBatchesPeriodically() {
                if (this.page != 1) return;
                this.loadBatches('', true);
            },

            previous() {
                this.loadBatches(this.page == 2 ? '' : this.previousFirstId);
                this.page -= 1;
                this.hasNewEntries = false;
            },

            next() {
                this.previousFirstId = this.batches[0]?.id + '0';
                this.loadBatches(this.batches.slice(-1)[0]?.id);
                this.page += 1;
                this.hasNewEntries = false;
            }
        }
    }
</script>

<template>
    <div>
        <poll @poll="refreshBatchesPeriodically" />

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Batches</h2>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div v-if="ready && batches.length == 0" class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <span class="text-gray-500 dark:text-gray-400">There aren't any batches.</span>
            </div>

            <table v-if="ready && batches.length > 0" class="w-full mb-0">
                <thead>
                <tr>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Batch</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Status</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Size</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Completion</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Created</th>
                </tr>
                </thead>

                <tbody>
                <tr v-if="hasNewEntries && !this.$root.autoLoadsNewEntries" key="newEntries" class="dontanimate">
                    <td colspan="100" class="text-center bg-gray-50 dark:bg-gray-900 py-2 border-t border-gray-200 dark:border-gray-700">
                        <small><a href="#" v-on:click.prevent="loadNewEntries" v-if="!loadingNewEntries" class="text-violet-600 dark:text-violet-400">Load New Entries</a></small>
                        <small v-if="loadingNewEntries" class="text-gray-500 dark:text-gray-400">Loading...</small>
                    </td>
                </tr>

                <tr v-for="batch in batches" :key="batch.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    <td class="px-5 py-3 align-middle">
                        <router-link :title="batch.id" :to="{ name: 'batches-preview', params: { batchId: batch.id }}" class="text-violet-600 dark:text-violet-400 hover:underline">
                            {{ batch.name || batch.id }}
                        </router-link>
                    </td>
                    <td class="px-5 py-3 align-middle">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500 text-red-600 dark:text-white" v-if="!batch.cancelledAt && batch.failedJobs > 0 && batch.totalJobs - batch.pendingJobs < batch.totalJobs">
                            Failures
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500 text-emerald-600 dark:text-white" v-if="!batch.cancelledAt && batch.totalJobs - batch.pendingJobs == batch.totalJobs">
                            Finished
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-300 text-gray-600 dark:text-gray-700" v-if="!batch.cancelledAt && batch.pendingJobs > 0 && !batch.failedJobs">
                            Pending
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500 text-amber-600 dark:text-white" v-if="batch.cancelledAt">
                            Cancelled
                        </span>
                    </td>
                    <td class="px-5 py-3 align-middle text-right text-gray-500 dark:text-gray-400">{{ batch.totalJobs }}</td>
                    <td class="px-5 py-3 align-middle text-right text-gray-500 dark:text-gray-400">{{ batch.progress }}%</td>
                    <td class="px-5 py-3 align-middle text-right w-px whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                        {{ formatDateIso(batch.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
                    </td>
                </tr>
                </tbody>
            </table>

            <div v-if="ready && batches.length" class="p-3 flex justify-between border-t border-gray-200 dark:border-gray-700">
                <button @click="previous" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :disabled="page==1">Previous</button>
                <button @click="next" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :disabled="batches.length < 50">Next</button>
            </div>
        </div>
    </div>
</template>
