<template>
  <div class="vue-wrapper">
    <router-view class="view" />
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style lang="scss" scoped>
  .vue-wrapper {
    position: fixed;
    top: 0;
  }
</style>
