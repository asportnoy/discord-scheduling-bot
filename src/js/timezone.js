const querystring = new URLSearchParams(window.location.search);
const id = querystring.get('id');
const code = querystring.get('code');

new Vue({
    el: '#app',
    data() {
        return {
            map: null
        }
    },
    created() {},
    mounted() {
        this.map = $('#map');

        this.map.timezonePicker({
            quickLink: [],
            defaultValue: {
                showHoverText: false,
                value: moment.tz.guess(),
                attribute: "timezone"
            },
            hoverText: function (e, data) {
                document.getElementById('hover').innerText = data.timezone;
                return;
            },
        });

        if (this.map.data('timezonePicker')) {
            setInterval(this.updateCurrentTime, 1000);
            this.updateCurrentTime(true);
        } else {
            this.map.on('map:loaded', () => {
                setInterval(this.updateCurrentTime, 1000);
                this.updateCurrentTime(true);
            });
        }

        this.map.on('map:value:changed', () => this.updateCurrentTime(true));

    },
    methods: {
        updateCurrentTime(zone) {
            if (!this.map || !this.map.data('timezonePicker')) return;
            const value = this.map.data('timezonePicker').getValue()[0];
            if (!value) return;
            const now = moment().tz(value.timezone).format('h:mm A');
            if (zone) {
                document.getElementById('zone').innerText = value.timezone;
                document.getElementById('hover').innerText = value.timezone;
            }
            document.getElementById('time').innerText = now;
        },
        didSave(data) {
            this.$bvToast.toast(data.reason || (data.success ? 'Your timezone was set.' : 'Your timezone was not set.'), {
                title: data.success ? 'Success' : 'Failed',
                autoHideDelay: 15000,
                appendToast: true
              })
        },
        async save() {
            if (!id || !code) this.didSave({
                success: false,
                reason: 'Cannot get code from URL'
            });

            const value = this.map.data('timezonePicker').getValue()[0];
            if (!value) this.didSave({
                success: false,
                reason: 'No timezone selected'
            });
            const response = await fetch(`/timezone?id=${id}&code=${code}`, {
                method: 'POST',
                body: value.timezone
            });
            try {
                const text = await response.text();
                if (!text) return this.didSave({
                    success: response.ok,
                    reason: null
                })
                this.didSave({
                    success: response.ok,
                    reason: text
                })
            } catch (e) {
                this.didSave({
                    success: response.ok,
                    reason: null
                })
            }
        }
    }
})