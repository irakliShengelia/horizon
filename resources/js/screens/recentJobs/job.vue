<template>
    <div>
        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0" v-if="!ready">Job Preview</h2>
                <h2 class="text-sm font-semibold m-0" v-if="ready">{{job.name}}</h2>

                <button @click="showDetails = !showDetails" class="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                    {{ showDetails ? 'Collapse' : 'Expand' }}
                </button>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div class="p-5 bg-gray-50 dark:bg-gray-900" v-if="ready && showDetails">
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">ID</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{job.id}}</div>
                </div>
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Connection</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{job.connection}}</div>
                </div>
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Queue</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{job.queue}}</div>
                </div>
                <div class="flex mb-2">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Pushed</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{ readableTimestamp(job.payload.pushedAt) }}</div>
                </div>
                <div class="flex mb-2" v-if="prettyPrintJob(job.payload.data).batchId">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Batch</div>
                    <div class="flex-1 text-sm">
                        <router-link :to="{ name: 'batches-preview', params: { batchId: prettyPrintJob(job.payload.data).batchId }}" class="text-violet-600 dark:text-violet-400 hover:underline">
                            {{ prettyPrintJob(job.payload.data).batchId }}
                        </router-link>
                    </div>
                </div>
                <div class="flex mb-2" v-if="delayed">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Delayed Until</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100">{{delayed}}</div>
                </div>
                <div class="flex">
                    <div class="w-1/6 text-gray-500 dark:text-gray-400 text-sm">Completed</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100" v-if="job.completed_at">{{readableTimestamp(job.completed_at)}}</div>
                    <div class="flex-1 text-sm text-gray-900 dark:text-gray-100" v-else>-</div>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden mt-4" v-if="ready">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Data</h2>
                <button @click="showData = !showData" class="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                    {{ showData ? 'Collapse' : 'Expand' }}
                </button>
            </div>
            <div class="p-5 bg-[#292d3e] text-white" v-if="showData">
                <vue-json-pretty :data="prettyPrintJob(job.payload.data)"></vue-json-pretty>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden mt-4" v-if="ready && job.payload.tags.length">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Tags</h2>
                <button @click="showTags = !showTags" class="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                    {{ showTags ? 'Collapse' : 'Expand' }}
                </button>
            </div>
            <div class="p-5 bg-[#292d3e] text-white" v-if="showTags">
                <vue-json-pretty :data="job.payload.tags"></vue-json-pretty>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import phpunserialize from 'phpunserialize';
    import moment from 'moment-timezone';
    import StackTrace from './../../components/Stacktrace.vue';

    export default {
        components: {
            'stack-trace': StackTrace,
        },

        data() {
            return {
                ready: false,
                job: {},
                showDetails: true,
                showData: true,
                showTags: true,
            };
        },

        computed: {
            unserialized() {
                return phpunserialize(this.job.payload.data.command);
            },

            delayed() {
                let unserialized;

                try {
                    unserialized = phpunserialize(this.job.payload.data.command);
                }catch(err){
                    //
                }

                if (unserialized && unserialized.delay && unserialized.delay.date) {
                    return moment.tz(unserialized.delay.date, unserialized.delay.timezone)
                        .local()
                        .format('YYYY-MM-DD HH:mm:ss');
                } else if (unserialized && unserialized.delay) {
                    return this.formatDate(this.job.payload.pushedAt).add(unserialized.delay, 'seconds')
                        .local()
                        .format('YYYY-MM-DD HH:mm:ss');
                }

                return null;
            },
        },

        mounted() {
            this.loadJob(this.$route.params.jobId);
            document.title = "Horizon - Job Detail";
        },

        methods: {
            loadJob(id) {
                this.ready = false;

                this.$http.get(Horizon.basePath + '/api/jobs/' + id)
                    .then(response => {
                        this.job = response.data;
                        this.ready = true;
                    });
            },

            prettyPrintJob(data) {
                try {
                    return data.command && !data.command.includes('CallQueuedClosure')
                        ? phpunserialize(data.command) : data;
                } catch (err) {
                    return data;
                }
            }
        }
    }
</script>
