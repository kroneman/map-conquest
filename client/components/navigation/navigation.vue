<template>
  <div class="navigation">
    <div
      class="navigation__back"
      @click="back"
    >
      Back
    </div>
    <ul class="navigation-list">
      <li
        v-for="(link) in navigationList"
        :key="link.routeName"
        class="navigation-list__item"
        @click="navigateTo(link.routeName)"
      >
        {{ link.text }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Navigation',
  data: () => ({
    navigationList: [
      {
        text: 'Home',
        routeName: 'Home'
      },
      {
        text: 'Create',
        routeName: 'CreateGame'
      },
      {
        text: 'Join',
        routeName: 'viewGames'
      }
    ]
  }),
  computed: {
    routes() {
      return this.$router.options.routes;
    }
  },
  methods: {
    navigateTo(routeName) {
      if (!routeName) {
        return;
      }

      this.$router.push({ name: routeName });
    },
    back() {
      this.$router.go(-1);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './navigation.scss';
</style>
