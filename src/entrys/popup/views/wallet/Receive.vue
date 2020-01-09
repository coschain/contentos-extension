<template>
  <div class="receive-page">
    <div class="tips" v-html="$t('receive.tips')"></div>
    <template v-if="currentAccount">
      <div class="qr-code">
        <div class="qr-image"><qrcode tag="img" :value="currentAccount.account" :options="{ width: 200 }"></qrcode></div>
        <div class="username">{{ currentAccount.account }}</div>
      </div>
      <div class="buttons">
        <a v-clipboard="currentAccount.account" @success="onCopySuccess" @error="onCopyError" class="common-button">{{ $t('common.copyAddress') }}</a>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  created() {},
  mounted() {},
  components: {},
  methods: {
    onCopySuccess() {
      this.toast(this.$t('common.copySuccess'));
    },
    onCopyError() {
      this.toast(this.$t('common.copyFailed'));
    },
  },
};
</script>

<style lang="less" scoped>
.receive-page {
  padding: 0.8rem;
  text-align: center;
  .tips {
    padding: 0.6rem 0 1rem;
    font-size: 0.84rem;
    color: @red-color;
    span {
      font-weight: bold;
    }
  }
  .qr-code {
    .qr-image {
      display: inline-block;
      border-radius: 0.4rem;
      overflow: hidden;
      border: solid 1px #eaeaea;
      width: 10rem;
      height: 10rem;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .username {
      color: @black-color;
      font-size: 1rem;
      padding: 0.5rem 0 1rem;
    }
  }
}
</style>
