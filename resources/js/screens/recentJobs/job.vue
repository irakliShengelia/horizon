<template>
    <div>
        <div class="card overflow-hidden">
            <div class="card-header flex items-center justify-between">
                <h2 class="text-base font-semibold m-0" v-if="!ready">Job Preview</h2>
                <h2 class="text-base font-semibold m-0" v-if="ready">{{job.name}}</h2>

                <button @click="showDetails = !showDetails" class="text-sm hover:text-primary transition-colors">
                    {{ showDetails ? 'Collapse' : 'Expand' }}
                </button>
            </div>

            <div v-if="!ready" class="flex items-center justify-center card-bg-secondary p-5 bottom-radius">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="icon animate-spin mr-2 fill-text-color">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>

                <span>Loading...</span>
            </div>

            <div v-if="ready && showDetails" class="card-body card-bg-secondary">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
                    <div class="md:col-span-2 text-muted">ID</div>
                    <div class="md:col-span-10">{{job.id}}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
                    <div class="md:col-span-2 text-muted">Queue</div>
                    <div class="md:col-span-10">{{job.queue}}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
                    <div class="md:col-span-2 text-muted">Pushed</div>
                    <div class="md:col-span-10">{{ readableTimestamp(job.payload.pushedAt) }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2" v-if="prettyPrintJob(job.payload.data).batchId">
                    <div class="md:col-span-2 text-muted">Batch</div>
                    <div class="md:col-span-10">
                        <router-link :to="{ name: 'batches-preview', params: { batchId: prettyPrintJob(job.payload.data).batchId }}">
                            {{ prettyPrintJob(job.payload.data).batchId }}
                        </router-link>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2" v-if="delayed">
                    <div class="md:col-span-2 text-muted">Delayed Until</div>
                    <div class="md:col-span-10">{{delayed}}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div class="md:col-span-2 text-muted">Completed</div>
                    <div class="md:col-span-10" v-if="job.completed_at">{{readableTimestamp(job.completed_at)}}</div>
                    <div class="md:col-span-10" v-else>-</div>
                </div>
            </div>
        </div>

        <div class="card overflow-hidden mt-4" v-if="ready">
            <div class="card-header flex items-center justify-between">
                <h2 class="text-base font-semibold m-0">Data</h2>

                <button @click="showData = !showData" class="text-sm hover:text-primary transition-colors">
                    {{ showData ? 'Collapse' : 'Expand' }}
                </button>
            </div>

            <div v-if="showData" class="card-body code-bg text-white">
                <vue-json-pretty :data="prettyPrintJob(job.payload.data)"></vue-json-pretty>
            </div>
        </div>

        <div class="card overflow-hidden mt-4" v-if="ready && job.payload.tags.length">
            <div class="card-header flex items-center justify-between">
                <h2 class="text-base font-semibold m-0">Tags</h2>

                <button @click="showTags = !showTags" class="text-sm hover:text-primary transition-colors">
                    {{ showTags ? 'Collapse' : 'Expand' }}
                </button>
            </div>

            <div v-if="showTags" class="card-body code-bg text-white">
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
                showTags: true
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
            /**
             * Load a job by the given ID.
             */
            loadJob(id) {
                this.ready = false;

                this.$http.get(Horizon.basePath + '/api/jobs/' + id)
                    .then(response => {
                        this.job = response.data;

                        this.ready = true;
                    });
            },

            /**
             * Pretty print serialized job.
             */
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
