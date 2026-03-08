<template>
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
        <td class="px-5 py-3 align-middle">
            <router-link :title="job.name" :to="{ name: 'job-preview', params: { jobId: job.id, type: $route.params.type }}" class="text-violet-600 dark:text-violet-400 hover:underline">
                {{ jobBaseName(job.name) }}
            </router-link>

            <span class="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-300 text-gray-600 dark:text-gray-700"
                :title="`Delayed for ${delayed}`"
                v-if="delayed && (job.status == 'reserved' || job.status == 'pending')">
                Delayed
            </span>

            <br>

            <small class="text-gray-500 dark:text-gray-400">
                Queue: {{job.queue}}
                <span v-if="job.payload.tags && job.payload.tags.length" class="break-all">
                    | Tags: {{ job.payload.tags && job.payload.tags.length ? job.payload.tags.slice(0,3).join(', ') : '' }}<span class="text-gray-500 dark:text-gray-400" v-if="job.payload.tags.length > 3"> +{{ job.payload.tags.length - 3 }} more</span>
                </span>
            </small>
        </td>

        <td class="px-5 py-3 align-middle w-px whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
            {{ readableTimestamp(job.payload.pushedAt) }}
        </td>

        <td v-if="$route.params.type=='completed' || $route.params.type=='silenced'" class="px-5 py-3 align-middle w-px whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
            {{ readableTimestamp(job.completed_at) }}
        </td>

        <td v-if="$route.params.type=='completed' || $route.params.type=='silenced'" class="px-5 py-3 align-middle w-px whitespace-nowrap text-right text-gray-500 dark:text-gray-400 text-sm">
            <span>{{ job.completed_at ? (job.completed_at - job.reserved_at).toFixed(2)+'s' : '-' }}</span>
        </td>
    </tr>
</template>

<script type="text/ecmascript-6">
    import phpunserialize from 'phpunserialize'
    import moment from 'moment-timezone';

    export default {
        props: {
            job: {
                type: Object,
                required: true
            }
        },

        computed: {
            unserialized() {
                try {
                    return phpunserialize(this.job.payload.data.command);
                }catch(err){
                    //
                }
            },

            delayed() {
                if (this.unserialized && this.unserialized.delay && this.unserialized.delay.date) {
                    return moment.tz(this.unserialized.delay.date, this.unserialized.delay.timezone)
                        .fromNow(true);
                } else if (this.unserialized && this.unserialized.delay) {
                    return this.formatDate(this.job.payload.pushedAt).add(this.unserialized.delay, 'seconds')
                        .fromNow(true);
                }

                return null;
            },
        },
    }
</script>
