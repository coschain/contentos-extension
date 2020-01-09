<template>
  <div v-if="$root.wallet" class="common-popover-list">
    <div
      v-close-popover
      v-for="(item, index) in $root.wallet.accounts"
      :key="index"
      @click="changeAccount(item.id)"
      :class="`popover-item item-wallet${index == $root.wallet.selected ? ' selected' : ''}`"
    >
      <a>
        {{ item.account }}<span :class="`network-type type-${item.network}`">{{ item.networkTitle }}</span>
      </a>
    </div>
    <div class="popover-item item-space item-operate">
      <router-link to="/account/create">{{ $t('nav.createAccount') }}</router-link>
    </div>
    <div class="popover-item item-operate">
      <router-link to="/account/import">{{ $t('nav.importAccount') }}</router-link>
    </div>
  </div>
</template>

<script>
import { changeAccountSelected } from '../../service/WalletApi';

export default {
  data() {
    return {};
  },
  props: {},
  computed: {},
  mounted() {},
  methods: {
    async changeAccount(id) {
      try {
        await changeAccountSelected(id);
      } catch (ex) {
        this.toast(ex.message);
        return;
      }
      this.startLoading();
      await this.getState();
    },
  },
};
</script>

<style lang="less" scoped>
.common-popover-list {
  .popover-item {
    &.item-wallet {
      a {
        padding-right: 1.5rem;
      }
    }
    .network-type {
      font-size: 0.68rem;
      padding: 0rem 0.6rem;
      color: #fff;
      background-color: @green-color;
      border-radius: 2rem;
      transform: translateY(-50%) scale(0.68);
      transform-origin: right center;
      display: inline-block;
      position: absolute;
      right: -0.1rem;
      line-height: 1.4rem;
      top: 50%;
      height: 1.4rem;
      &.type-main {
        background-color: @primary-color;
      }
    }
  }
}
</style>
