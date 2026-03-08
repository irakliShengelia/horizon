<script type="text/ecmascript-6">
    export default {
        data() {
            return {
                ready: false,
                newTag: '',
                showAddTagModal: false,
                tags: []
            };
        },

        mounted() {
            document.title = "Horizon - Monitoring";
        },

        methods: {
            loadTags() {
                this.$http.get(Horizon.basePath + '/api/monitoring')
                    .then(response => {
                        this.tags = response.data;
                        this.ready = true;
                    });
            },

            refreshTagsPeriodically() {
                this.loadTags();
            },

            openNewTagModal() {
                this.showAddTagModal = true;
                this.$nextTick(() => {
                    const input = document.getElementById('newTagInput');
                    if (input) input.focus();
                });
            },

            monitorNewTag() {
                if (!this.newTag) {
                    const input = document.getElementById('newTagInput');
                    if (input) input.focus();
                    return;
                }

                this.$http.post(Horizon.basePath + '/api/monitoring', {'tag': this.newTag})
                    .then(response => {
                        this.showAddTagModal = false;
                        this.tags.push({tag: this.newTag, count: 0});
                        this.newTag = '';
                    });
            },

            cancelNewTag() {
                this.showAddTagModal = false;
                this.newTag = '';
            },

            stopMonitoring(tag) {
                this.$http.delete(Horizon.basePath + '/api/monitoring/' + encodeURIComponent(tag))
                    .then(() => {
                        this.tags = this.tags.filter(existing => existing.tag !== tag);
                    });
            }
        }
    }
</script>

<template>
    <div>
        <poll @poll="refreshTagsPeriodically" />

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Monitoring</h2>
                <button @click="openNewTagModal" class="px-3 py-1 bg-violet-600 text-white rounded text-sm font-medium hover:bg-violet-700 transition-colors">Monitor Tag</button>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div v-if="ready && tags.length == 0" class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-12 rounded-b-md">
                <span class="text-gray-500 dark:text-gray-400">You're not monitoring any tags.</span>
            </div>

            <table v-if="ready && tags.length > 0" class="w-full mb-0">
                <thead>
                <tr>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-left">Tag</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right">Jobs</th>
                    <th class="bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 px-5 py-2 text-right"></th>
                </tr>
                </thead>

                <tbody>
                <tr v-for="tag in tags" class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    <td class="px-5 py-3 align-middle">
                        <router-link :to="{ name: 'monitoring-jobs', params: { tag:tag.tag }}" href="#" class="text-violet-600 dark:text-violet-400 hover:underline">
                            {{ tag.tag }}
                        </router-link>
                    </td>
                    <td class="px-5 py-3 align-middle text-right text-gray-500 dark:text-gray-400">{{ tag.count }}</td>
                    <td class="px-5 py-3 align-middle text-right">
                        <a href="#" @click="stopMonitoring(tag.tag)" title="Stop Monitoring" class="inline-block">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-5 h-5 fill-gray-300 dark:fill-gray-500 hover:fill-violet-600 dark:hover:fill-violet-400 transition-colors">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                            </svg>
                        </a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

        <!-- Add Tag Modal -->
        <div v-if="showAddTagModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Monitor New Tag</h3>
                </div>
                <div class="px-6 py-4">
                    <input type="text"
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                           placeholder="App\Models\User:6352"
                           v-on:keyup.enter="monitorNewTag"
                           v-model="newTag"
                           id="newTagInput">
                </div>
                <div class="flex flex-row-reverse gap-2 px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button class="px-4 py-2 bg-violet-600 text-white rounded text-sm font-medium hover:bg-violet-700 transition-colors" @click="monitorNewTag">
                        Monitor
                    </button>
                    <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" @click="cancelNewTag">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
