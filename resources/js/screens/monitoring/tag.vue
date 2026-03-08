<script type="text/ecmascript-6">
    export default {}
</script>

<template>
    <div>
        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Recent Jobs for "{{ $route.params.tag }}"</h2>
            </div>

            <div class="flex bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <router-link class="px-5 py-3 text-sm no-underline text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent transition-colors" active-class="!text-violet-600 dark:!text-violet-400 border-violet-600 dark:border-violet-400" :to="{ name: 'monitoring-jobs', params: { tag:$route.params.tag }}" href="#">
                    Recent Jobs
                </router-link>
                <router-link class="px-5 py-3 text-sm no-underline text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent transition-colors" active-class="!text-violet-600 dark:!text-violet-400 border-violet-600 dark:border-violet-400" :to="{ name: 'monitoring-failed', params: { tag:$route.params.tag }}" href="#">
                    Failed Jobs
                </router-link>
            </div>

            <router-view/>
        </div>
    </div>
</template>
