import Vue from 'vue';

import router from './router';
import store from './store/store';
import app from './app.vue';

new Vue({
  store,
  router,
  render: h => h(app)
}).$mount('#root');

store.dispatch('LOAD_SETTINGS');
store.dispatch('START_SOCKET_LISTENERS');
