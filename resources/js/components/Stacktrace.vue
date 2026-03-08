<script type="text/ecmascript-6">
    export default {
        props: ['trace'],

        data() {
            return {
                minimumLines: 5,
                showAll: false,
            };
        },

        computed: {
            lines() {
                return this.trace.slice(0, this.showAll ? 1000 : this.minimumLines);
            }
        }
    }
</script>

<template>
    <div class="overflow-x-auto">
        <table class="w-full mb-0">
            <tbody>
            <tr v-for="line in lines">
                <td class="px-5 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"><code class="text-sm font-mono text-gray-800 dark:text-gray-200">{{line}}</code></td>
            </tr>

            <tr v-if="! showAll">
                <td class="px-5 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <a href="*" class="text-violet-600 dark:text-violet-400 no-underline hover:underline text-sm" v-on:click.prevent="showAll = true">Show All</a>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>
