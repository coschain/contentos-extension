<template>
  <account-layout>
    <div class="welcome-page">
      <div class="operate-item">
        <div class="item-brief">{{ $t('welcome.accountNone') }}</div>
        <a @click="navigationTo('createAccount')" class="common-button">{{ $t('welcome.createAccount') }}</a>
      </div>
      <div class="operate-item">
        <div class="item-brief">{{ $t('welcome.haveAccount') }}</div>
        <a @click="navigationTo('importAccount')" plain class="common-button">{{ $t('welcome.importAccount') }}</a>
      </div>
    </div>
  </account-layout>
</template>
<script>
import AccountLayout from '../../components/layout/AccountLayout';

export default {
  data() {
    return {};
  },
  created() {},
  components: {
    AccountLayout,
  },
  mounted() {},
  methods: {
    navigationTo(name) {
      if (!this.$root.walletCreated) {
        this.$router.push({
          name: 'password',
          params: {
            callbackPathName: name,
          },
        });
      } else {
        this.$router.push({ name });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.welcome-page {
  padding: 2.4rem 1.6rem 0;
  text-align: center;
  .operate-item {
    margin-bottom: 1.8rem;
    .item-brief {
      margin-bottom: 0.6rem;
    }
    .common-button[plain] {
      border-color: @primary-color;
      color: @primary-color;
    }
  }
}
</style>
