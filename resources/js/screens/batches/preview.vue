<script type="text/ecmascript-6">
    export default {
        data() {
            return {
                ready: false,
                retrying: false,
                batch: {},
                failedJobs : []
            };
        },

        mounted() {
            document.title = "Horizon - Batches";
        },

        methods: {
            loadBatch(reload = true) {
                if (reload) {
                    this.ready = false;
                }

                this.$http.get(Horizon.basePath + '/api/batches/' + this.$route.params.batchId)
                    .then(response => {
                        this.batch = response.data.batch;
                        this.failedJobs = response.data.failedJobs;
                        this.ready = true;
                    });
            },

            retry(id) {
                if (this.retrying) {
                    return;
                }

                this.retrying = true;

                this.$http.post(Horizon.basePath + '/api/batches/retry/' + id)
                    .then(() => {
                        setTimeout(() => {
                            this.loadBatch(false);
                            this.retrying = false;
                        }, 3000);
                    });
            },
        }
    }
</script>

<template>
    <div>
        <poll @poll="loadBatch(false)" />

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0" v-if="!ready">Batch Preview</h2>
                <h2 class="text-sm font-semibold m-0" v-if="ready">{{batch.name || batch.id}}</h2>

                <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded text-sm font-medium hover:bg-violet-700 transition-colors" v-if="failedJobs.length > 0" v-on:click.prevent="retry(batch.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4" fill="currentColor" :class="{spin: retrying}">
                        <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" />
                    </svg>
                    Retry Failed Jobs
                </button>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div class="p-5 bg-gray-50 dark:bg-gray-900" v-if="ready">
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">ID</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">
                        {{batch.id}}
                        <span class="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500 text-red-600 dark:text-white" v-if="batch.failedJobs > 0 && batch.totalJobs - batch.pendingJobs < batch.totalJobs">Failures</span>
                        <span class="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500 text-emerald-600 dark:text-white" v-if="batch.totalJobs - batch.pendingJobs == batch.totalJobs">Finished</span>
                        <span class="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-300 text-gray-600 dark:text-gray-700" v-if="batch.pendingJobs > 0 && !batch.failedJobs">Pending</span>
                    </div>
                </div>
                <div class="flex mb-2" v-if="batch.name">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Name</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{batch.name}}</div>
                </div>
                <div class="flex mb-2" v-if="batch.options.queue">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Queue</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{batch.options.queue}}</div>
                </div>
                <div class="flex mb-2" v-if="batch.options.connection">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Connection</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{batch.options.connection}}</div>
                </div>
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Created</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDateIso(batch.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</div>
                </div>
                <div class="flex mb-2" v-if="batch.finishedAt">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Finished</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDateIso(batch.finishedAt).format('YYYY-MM-DD HH:mm:ss') }}</div>
                </div>
                <div class="flex mb-2" v-if="batch.cancelledAt">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Cancelled</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDateIso(batch.cancelledAt).format('YYYY-MM-DD HH:mm:ss') }}</div>
                </div>
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Total Jobs</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{batch.totalJobs}}</div>
                </div>
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Pending Jobs</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{batch.pendingJobs}}</div>
                </div>
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Failed Jobs</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{batch.failedJobs}}</div>
                </div>
                <div class="flex">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Processed Jobs<br><small>(Including Failed)</small></div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ (batch.processedJobs) }} ({{batch.progress}}%)</div>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden mt-4" v-if="ready && failedJobs.length">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Failed Jobs</h2>
            </div>

            <table class="w-full mb-0">
                <thead>
                <tr>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Job</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Runtime</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Failed</th>
                </tr>
                </thead>

                <tbody>
                <tr v-for="failedJob in failedJobs" class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    <td class="px-5 py-3 align-middle">
                        <router-link :title="failedJob.name" :to="{ name: 'failed-jobs-preview', params: { jobId: failedJob.id }}" class="text-violet-600 dark:text-violet-400 hover:underline">
                            {{ jobBaseName(failedJob.name) }}
                        </router-link>
                    </td>
                    <td class="px-5 py-3 align-middle text-right text-gray-500 dark:text-gray-400 w-px whitespace-nowrap">
                        <span>{{ failedJob.failed_at && failedJob.reserved_at ? String(( failedJob.failed_at - failedJob.reserved_at ).toFixed(2))+'s' : '-' }}</span>
                    </td>
                    <td class="px-5 py-3 align-middle text-right text-gray-500 dark:text-gray-400 w-px whitespace-nowrap text-sm">
                        {{ readableTimestamp(failedJob.failed_at) }}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
