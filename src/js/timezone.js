const pathArray = window.location.pathname.split('/').filter(x => x !== '');
const user = pathArray[1];
const code = pathArray[2];

new Vue({
    el: '#app',
    data() {
        return {
            message: '',
            status: 'Loading...',
            loading: true
        }
    },
    created() {
        this.fetch()
    },
    methods: {
        async fetch() {
            try {
                const res = await fetch(`/api/timezone/${user}/${code}`);
                if (!res) return this.status = 'Failed to load.';
                const json = await res.json();
                if (!json) return this.status = 'Failed to load.';

                if (json && !json.error && res.ok) {
                    this.loading = false;
                    this.message = "Code OK";
                } else {
                    this.loading = false;
                    this.message = "Error: " + (json && json.error ? json.error : 'Failed to load.');
                }
            } catch (e) {
                this.status = 'Failed to load.'
            }
        }
    }
})