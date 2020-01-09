<template>
  <div ref="app" id="app" class="mobile-widget">
    <header-widget :headerType="headerType"></header-widget>
    <div :class="`app-container container-${headerType}`">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
    <bus-dialog-instance></bus-dialog-instance>
  </div>
</template>

<script>
import HeaderWidget from './components/bus/HeaderWidget';
import BusDialogInstance from './components/bus/BusDialogInstance';
import * as HeaderType from './enums/HeaderType';

export default {
  name: 'app',
  data() {
    return {};
  },
  computed: {
    headerType() {
      return this.$route.meta.headerType || HeaderType.none;
    },
  },
  created() {
    if (!this.$root.walletCreated) {
      this.$router.replace({ path: '/' }).catch(() => {});
      return;
    }
    const initRoutePath = this.$route.path;
    const flagRedirect = initRoutePath && initRoutePath !== '/';

    if (this.$root.locked) {
      const initRouteQuery = this.$route.query;
      const lockPagePath = '/account/lock';

      if (initRoutePath === lockPagePath) {
        this.$router.replace({ path: lockPagePath, query: initRouteQuery });
      } else {
        this.$router.replace({
          path: lockPagePath,
          query: flagRedirect
            ? {
                redirectPath: initRoutePath,
                redirectQuery: JSON.stringify(initRouteQuery),
              }
            : {},
        });
      }
      return;
    }

    if (!this.currentAccount) {
      this.$router.replace({ path: '/' });
      return;
    }

    if (!flagRedirect) {
      this.$router.replace({
        path: '/wallet/home',
      });
    }
  },
  components: {
    HeaderWidget,
    BusDialogInstance,
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.app-container {
  height: calc(100% - 2.6rem);
  overflow: auto;
  &.container-none,
  &.container-account {
    height: 100%;
  }
}
</style>
