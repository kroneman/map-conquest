import Vue from 'vue';
import Vuex from 'vuex';
import game from './game';

// Don't enable strict for production
// See: https://vuex.vuejs.org/guide/strict.html
const isStrictMode = process.env.NODE_ENV !== 'production';

// For further config see
// https://github.com/championswimmer/vuex-persist#readme
// const vuexLocal = new VuexPersistence({
//   strict: isStrictMode,
//   storage: window.localStorage
// });

Vue.use(Vuex);
// Curious about mutating state via the mutations object
export default new Vuex.Store({
  strict: isStrictMode,
  // plugins: [vuexLocal.plugin],
  modules: {
    game
  }
});
