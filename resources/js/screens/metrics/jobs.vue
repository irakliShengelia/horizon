<script type="text/ecmascript-6">
    export default {
        components: {},

        data() {
            return {
                ready: false,
                jobs: []
            };
        },

        mounted() {
            this.loadJobs();
        },

        methods: {
            loadJobs() {
                this.ready = false;

                this.$http.get(Horizon.basePath + '/api/metrics/jobs')
                    .then(response => {
                        this.jobs = response.data;
                        this.ready = true;
                    });
            }
        }
    }
</script>

<template>
    <div>
        <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
            </svg>
            <span>Loading...</span>
        </div>

        <div v-if="ready && jobs.length == 0" class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-12">
            <span class="text-gray-500 dark:text-gray-400">There aren't any jobs.</span>
        </div>

        <table v-if="ready && jobs.length > 0" class="w-full mb-0">
            <thead>
            <tr>
                <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Job</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="job in jobs" :key="job" class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                <td class="px-5 py-3 align-middle">
                    <router-link class="text-violet-600 dark:text-violet-400 hover:underline no-underline" :to="{ name: 'metrics-preview', params: { type: 'jobs', slug: job }}">
                        {{ job }}
                    </router-link>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
