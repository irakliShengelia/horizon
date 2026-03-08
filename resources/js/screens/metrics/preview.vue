<script type="text/ecmascript-6">
    import LineChart from '../../components/LineChart.vue';

    export default {
        components: {
            LineChart
        },

        data() {
            return {
                ready: false,
                rawData: {},
                metric: {}
            };
        },

        mounted() {
            document.title = "Horizon - Metrics";
            this.loadMetric();
        },

        methods: {
            loadMetric() {
                this.ready = false;

                this.$http.get(Horizon.basePath + '/api/metrics/' + this.$route.params.type + '/' + encodeURIComponent(this.$route.params.slug))
                    .then(response => {
                        let data = this.prepareData(response.data);

                        this.rawData = response.data;

                        this.metric.throughPutChart = this.buildChartData(data, 'throughput', 'Times');

                        this.metric.runTimeChart = this.buildChartData(data, 'runtime', 'Seconds');

                        this.ready = true;
                    });
            },

            prepareData(data) {
                return Object.values(this.groupBy(data.map(value => ({
                    ...value,
                    time: this.formatDate(value.time).format("MMM-D hh:mmA"),
                })), 'time')).map(value => value.reduce((sum, value) => ({
                    runtime: parseFloat(sum.runtime) + parseFloat(value.runtime),
                    throughput: parseInt(sum.throughput) + parseInt(value.throughput),
                    time: value.time
                })))
            },

            buildChartData(data, attribute, label) {
                return {
                    labels: data.map(entry => entry.time),
                    datasets: [
                        {
                            label: label,
                            data: data.map(entry => entry[attribute]),
                            lineTension: 0,
                            backgroundColor: 'transparent',
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#7746ec',
                            borderColor: '#7746ec',
                            borderWidth: 2,
                        },
                    ],
                };
            },
        }
    }
</script>

<template>
    <div>
        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Throughput - {{$route.params.slug}}</h2>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div class="p-5 bg-gray-50 dark:bg-gray-900" v-if="ready">
                <p class="text-center m-0 p-5 text-gray-500 dark:text-gray-400" v-if="ready && !rawData.length">
                    Not Enough Data
                </p>
                <line-chart v-if="ready && rawData.length" :data="metric.throughPutChart"/>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden mt-4">
            <div class="flex items-center justify-between px-5 py-3 min-h-[60px] border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold m-0">Runtime - {{$route.params.slug}}</h2>
            </div>

            <div v-if="!ready" class="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 spin mr-2 fill-gray-900 dark:fill-gray-100">
                    <path d="M12 10a2 2 0 0 1-3.41 1.41A2 2 0 0 1 10 8V0a9.97 9.97 0 0 1 10 10h-8zm7.9 1.41A10 10 0 1 1 8.59.1v2.03a8 8 0 1 0 9.29 9.29h2.02zm-4.07 0a6 6 0 1 1-7.25-7.25v2.1a3.99 3.99 0 0 0-1.4 6.57 4 4 0 0 0 6.56-1.42h2.1z"></path>
                </svg>
                <span>Loading...</span>
            </div>

            <div class="p-5 bg-gray-50 dark:bg-gray-900" v-if="ready">
                <p class="text-center m-0 p-5 text-gray-500 dark:text-gray-400" v-if="ready && !rawData.length">
                    Not Enough Data
                </p>
                <line-chart v-if="ready && rawData.length" :data="metric.runTimeChart"/>
            </div>
        </div>
    </div>
</template>
