<script type="text/ecmascript-6">
    import JobRow from './job-row.vue';

    export default {
        data() {
            return {
                ready: false,
                loadingNewEntries: false,
                hasNewEntries: false,
                page: 1,
                perPage: 50,
                totalPages: 1,
                jobs: []
            };
        },

        components: {
            JobRow,
        },

        mounted() {
            this.updatePageTitle();
            this.loadJobs();
        },

        watch: {
            '$route'() {
                this.updatePageTitle();
                this.page = 1;
                this.loadJobs();
            },

            '$root.autoLoadsNewEntries'(autoLoadsNewEntries) {
                if (autoLoadsNewEntries && this.hasNewEntries) {
                    this.hasNewEntries = false;
                }
            }
        },

        methods: {
            loadJobs(starting = -1, refreshing = false) {
                if (!refreshing) {
                    this.ready = false;
                }

                this.$http.get(Horizon.basePath + '/api/jobs/' + this.$route.params.type + '?starting_at=' + starting + '&limit=' + this.perPage)
                    .then(response => {
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
                this.loadJobs(-1, false);
                this.hasNewEntries = false;
            },

            refreshJobsPeriodically() {
                if (this.page != 1) {
                    return;
                }
                this.loadJobs(-1, true);
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
            },

            updatePageTitle() {
                document.title = this.$route.params.type == 'pending'
                    ? 'Horizon - Pending Jobs'
                    : (
                        this.$route.params.type == 'silenced'
                            ? 'Horizon - Silenced Jobs'
                            : 'Horizon - Completed Jobs'
                    );
            }
        }
    }
</script>

<template>
    <div>
        <poll @poll="refreshJobsPeriodically" />

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0" v-if="$route.params.type == 'pending'">Pending Jobs</h2>
                <h2 class="text-sm font-semibold m-0" v-if="$route.params.type == 'completed'">Completed Jobs</h2>
                <h2 class="text-sm font-semibold m-0" v-if="$route.params.type == 'silenced'">Silenced Jobs</h2>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div v-if="ready && jobs.length == 0" class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <span v-if="$route.params.type == 'pending'" class="text-gray-500 dark:text-gray-400">There aren't any pending jobs.</span>
                <span v-else-if="$route.params.type == 'completed'" class="text-gray-500 dark:text-gray-400">There aren't any completed jobs.</span>
                <span v-else-if="$route.params.type == 'silenced'" class="text-gray-500 dark:text-gray-400">There aren't any silenced jobs.</span>
                <span v-else class="text-gray-500 dark:text-gray-400">There aren't any jobs.</span>
            </div>

            <table v-if="ready && jobs.length > 0" class="w-full mb-0">
                <thead>
                    <tr>
                        <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Job</th>
                        <th v-if="$route.params.type=='pending'" class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Queued</th>
                        <th v-if="$route.params.type=='completed' || $route.params.type=='silenced'" class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Queued</th>
                        <th v-if="$route.params.type=='completed' || $route.params.type=='silenced'" class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Completed</th>
                        <th v-if="$route.params.type=='completed' || $route.params.type=='silenced'" class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Runtime</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="hasNewEntries && !this.$root.autoLoadsNewEntries" key="newEntries" class="dontanimate">
                        <td colspan="100" class="text-center bg-gray-50 dark:bg-gray-900 py-1 border-t border-gray-200 dark:border-gray-700">
                            <small><a href="#" v-on:click.prevent="loadNewEntries" v-if="!loadingNewEntries" class="text-violet-600 dark:text-violet-400">Load New Entries</a></small>
                            <small v-if="loadingNewEntries" class="text-gray-500 dark:text-gray-400">Loading...</small>
                        </td>
                    </tr>

                    <component v-for="job in jobs" :key="job.id" :job="job" is="job-row">
                    </component>
                </tbody>
            </table>

            <div v-if="ready && jobs.length" class="p-3 flex justify-between border-t border-gray-200 dark:border-gray-700">
                <button @click="previous" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :disabled="page==1">Previous</button>
                <button @click="next" class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :disabled="page>=totalPages">Next</button>
            </div>
        </div>
    </div>
</template>
