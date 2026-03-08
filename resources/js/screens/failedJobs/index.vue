<script type="text/ecmascript-6">
    export default {
        data() {
            return {
                tagSearchPhrase: '',
                searchTimeout: null,
                ready: false,
                loadingNewEntries: false,
                hasNewEntries: false,
                page: 1,
                perPage: 50,
                totalPages: 1,
                jobs: [],
                retryingJobs: [],
            };
        },

        mounted() {
            document.title = "Horizon - Failed Jobs";
        },

        watch: {
            '$route'() {
                this.page = 1;
                this.loadJobs();
            },

            tagSearchPhrase() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.loadJobs();
                    this.refreshJobsPeriodically();
                }, 500);
            },

            '$root.autoLoadsNewEntries'(autoLoadsNewEntries) {
                if (autoLoadsNewEntries && this.hasNewEntries) {
                    this.hasNewEntries = false;
                }
            }
        },

        methods: {
            loadJobs(starting = 0, refreshing = false) {
                if (!refreshing) {
                    this.ready = false;
                }

                var tagQuery = this.tagSearchPhrase ? 'tag=' + this.tagSearchPhrase + '&' : '';

                this.$http.get(Horizon.basePath + '/api/jobs/failed?' + tagQuery + 'starting_at=' + starting)
                    .then(response => {
                        if (!this.$root.autoLoadsNewEntries && refreshing && !response.data.jobs.length) {
                            this.ready = true;
                            return;
                        }

                        if (!this.$root.autoLoadsNewEntries && refreshing && this.jobs.length && response.data.jobs[0]?.id !== this.jobs[0]?.id) {
                            this.hasNewEntries = true;
                        } else {
                            this.jobs = response.data.jobs;
                            this.totalPages = Math.ceil(response.data.total / this.perPage);
                        }

                        this.ready = true;
                    });
            },

            loadNewEntries() {
                this.jobs = [];
                this.loadJobs(0, false);
                this.hasNewEntries = false;
            },

            retry(id) {
                if (this.isRetrying(id)) {
                    return;
                }

                this.retryingJobs.push(id);

                this.$http.post(Horizon.basePath + '/api/jobs/retry/' + id)
                    .then((response) => {
                        setTimeout(() => {
                            this.retryingJobs = this.retryingJobs.filter(job => job != id);
                        }, 5000);
                    }).catch(error => {
                        this.retryingJobs = this.retryingJobs.filter(job => job != id);
                    });
            },

            isRetrying(id) {
                return this.retryingJobs.includes(id);
            },

            hasCompleted(job) {
                return job.retried_by.find(retry => retry.status === 'completed');
            },

            wasRetried(job) {
                return job.retried_by && job.retried_by.length;
            },

            isRetry(job) {
                return job.payload.retry_of;
            },

            retriedJobTooltip(job) {
                let lastRetry = job.retried_by[job.retried_by.length - 1];
                return `Total retries: ${job.retried_by.length}, Last retry status: ${this.upperFirst(lastRetry.status)}`;
            },

            refreshJobsPeriodically() {
                this.loadJobs((this.page - 1) * this.perPage, true);
            },

            previous() {
                this.loadJobs((this.page - 2) * this.perPage - 1);
                this.page -= 1;
                this.hasNewEntries = false;
            },

            next() {
                this.loadJobs(this.page * this.perPage - 1);
                this.page += 1;
                this.hasNewEntries = false;
            }
        }
    }
</script>

<template>
    <div>
        <poll @poll="refreshJobsPeriodically" />

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Failed Jobs</h2>

                <div class="relative">
                    <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 fill-gray-400 dark:fill-gray-500">
                            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <input type="text" class="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 w-full" v-model="tagSearchPhrase" placeholder="Search Tags">
                </div>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div v-if="ready && jobs.length == 0" class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <span class="text-gray-500 dark:text-gray-400">There aren't any failed jobs.</span>
            </div>

            <table v-if="ready && jobs.length > 0" class="w-full mb-0">
                <thead>
                <tr>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Job</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Runtime</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Failed</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Retry</th>
                </tr>
                </thead>

                <tbody>
                <tr v-if="hasNewEntries && !this.$root.autoLoadsNewEntries" key="newEntries" class="dontanimate">
                    <td colspan="100" class="text-center bg-gray-50 dark:bg-gray-900 py-2 border-t border-gray-200 dark:border-gray-700">
                        <small><a href="#" v-on:click.prevent="loadNewEntries" v-if="!loadingNewEntries" class="text-violet-600 dark:text-violet-400">Load New Entries</a></small>
                        <small v-if="loadingNewEntries" class="text-gray-500 dark:text-gray-400">Loading...</small>
                    </td>
                </tr>

                <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    <td class="px-5 py-3 align-middle">
                        <router-link :title="job.name" :to="{ name: 'failed-jobs-preview', params: { jobId: job.id }}" class="text-violet-600 dark:text-violet-400 hover:underline">{{ jobBaseName(job.name) }}</router-link>

                        <span class="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-300 text-gray-600 dark:text-gray-700"
                               :title="retriedJobTooltip(job)"
                               v-if="wasRetried(job)">
                            Retried
                        </span>

                        <br>

                        <small class="text-gray-500 dark:text-gray-400">
                            Queue: {{job.queue}}
                            | Attempts: {{ job.payload.attempts }}
                            <span v-if="isRetry(job)">
                            | Retry of
                            <router-link :title="job.name" :to="{ name: 'failed-jobs-preview', params: { jobId: job.payload.retry_of }}" class="text-violet-600 dark:text-violet-400">
                                {{ job.payload.retry_of.split('-')[0] }}
                            </router-link>
                            </span>
                            <span v-if="job.payload.tags && job.payload.tags.length" class="break-all">
                            | Tags: {{ job.payload.tags && job.payload.tags.length ? job.payload.tags.join(', ') : '' }}
                            </span>
                        </small>
                    </td>

                    <td class="px-5 py-3 align-middle w-px whitespace-nowrap text-gray-500 dark:text-gray-400 text-right">
                        <span>{{ job.failed_at ? String((job.failed_at - job.reserved_at).toFixed(2))+'s' : '-' }}</span>
                    </td>

                    <td class="px-5 py-3 align-middle w-px whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {{ readableTimestamp(job.failed_at) }}
                    </td>

                    <td class="px-5 py-3 align-middle text-right w-px whitespace-nowrap">
                        <a href="#" title="Retry Job" @click.prevent="retry(job.id)" v-if="!hasCompleted(job)">
                            <svg class="fill-violet-600 dark:fill-violet-400" viewBox="0 0 20 20" style="width: 1.25rem; height: 1.25rem;" :class="{spin: isRetrying(job.id)}">
                                <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" />
                            </svg>
                        </a>
                    </td>
                </tr>
                </tbody>
            </table>

            <div v-if="ready && jobs.length" class="p-3 flex justify-between border-t border-gray-200 dark:border-gray-700">
                <button @click="previous" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :disabled="page==1">Previous</button>
                <button @click="next" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :disabled="page>=totalPages">Next</button>
            </div>
        </div>
    </div>
</template>
