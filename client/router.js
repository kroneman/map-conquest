import Vue from 'vue';
import VueRouter from 'vue-router';

// State
import store from './store/store';

// Pages
import home from './pages/home/home.vue';
import createGame from './pages/create-game/create-game.vue';
import viewGames from './pages/view-games/view-games.vue';
import gameLobby from './pages/game-lobby/game-lobby.vue';
import gameSession from './pages/game-session/game-session.vue';
import settings from './pages/settings/settings.vue';
import about from './pages/about/about.vue';
import testMap from './pages/test-map/test-map.vue';

Vue.use(VueRouter);
const router = new VueRouter({
  // Use Hash instead for separation between express and the game
  // mode: 'history',
  routes: [
    {
      name: 'Home',
      path: '/',
      component: home
    },
    {
      name: 'CreateGame',
      path: '/create-game',
      component: createGame
    },
    {
      name: 'gameSession',
      path: '/game-session',
      component: gameSession,
      beforeEnter(to, from, next) {
        // if there is no current game id redirect to show games
        if (!store.state.game.gameInSession) {
          return next({ name: 'gameLobby' });
        }

        return next();
      }
    },
    {
      name: 'testMap',
      path: '/test-map',
      component: testMap,
      beforeEnter(to, from, next) {
        return next();
      }
    },
    {
      name: 'gameLobby',
      path: '/game-lobby',
      component: gameLobby,
      beforeEnter(to, from, next) {
        // if there is no current game id redirect to show games
        if (!store.state.game.currentGame.id) {
          return next({ name: 'viewGames' });
        }

        return next();
      }
    },
    {
      name: 'viewGames',
      path: '/view-games',
      component: viewGames
    },
    {
      path: '/settings', component: settings
    },
    {
      path: '/about', component: about
    }
  ]
});

export default router;
