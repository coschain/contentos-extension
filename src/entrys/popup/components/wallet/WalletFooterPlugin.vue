<template>
  <div class="footer-view-plugin">
    <v-popover placement="bottom" offset="8">
      <div class="option-item"><span :class="`icon icon-network${networkOk ? ' worked' : ''}`"></span>{{ $root.network.list[$root.network.selected].title }}</div>
      <div slot="popover" class="common-popover-list popover-bottom">
        <div
          v-close-popover
          v-for="(item, index) in $root.network.list"
          :key="index"
          @click="changeNetwork(item.id)"
          :class="`popover-item${index == $root.network.selected ? ' selected' : ''}`"
        >
          <a>{{ item.title }}</a>
        </div>
        <div class="popover-item item-space item-operate">
          <router-link to="/setting/network">{{ $t('components.addNetwork') }}</router-link>
        </div>
      </div>
    </v-popover>
    <div class="option-space"></div>
    <div @click="operateItem('explorer')" v-tooltip="$t('common.explorer')" class="option-item">
      <span class="icon icon-explorer"></span>
    </div>
    <div @click="operateItem('lock')" v-tooltip="$t('common.lock')" class="option-item">
      <span class="icon icon-lock"></span>
    </div>
    <div @click="operateItem('refresh')" v-tooltip="$t('common.refresh')" class="option-item">
      <span class="icon icon-refresh"></span>
    </div>
  </div>
</template>
<script>
import { changeNetworkSelected, logout } from '../../service/WalletApi';

export default {
  props: {
    networkOk: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    async changeNetwork(id) {
      try {
        await changeNetworkSelected(id);
      } catch (ex) {
        this.toast(ex.message);
      }
      this.startLoading();
      await this.getState();
    },
    async operateItem(type) {
      if (type === 'explorer') {
        this.openUrl(`/#/account/${this.currentAccount.account}`);
      } else if (type === 'lock') {
        await logout();
        await this.getState();
        this.$router.replace({
          path: '/account/lock',
        });
      } else if (type === 'refresh') {
        this.$emit('reloadData');
      }
    },
  },
};
</script>

<style lang="less" scoped>
.footer-view-plugin {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-top: solid 1px #eee;
  background: #fff;
  display: flex;
  align-items: center;
  height: 2rem;
  padding: 0 0.72rem;
  box-sizing: border-box;
  font-size: 0.74rem;
  .option-space {
    flex: 1;
  }
  .icon {
    display: inline-block;
    width: 1.2rem;
    height: 1.2rem;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    margin-right: 0;
    margin-top: -0.1rem;
    vertical-align: middle;
  }
  .option-item {
    padding: 0.2rem;
    cursor: pointer;
    margin-left: 0.4rem;
    user-select: none;
    &:nth-child(1) {
      margin-left: 0;
      .icon {
        margin-right: 0.3rem;
      }
    }
  }
  .icon-network {
    background-image: url('../../assets/images/icon/icon-network.png');
    &.worked {
      background-image: url('../../assets/images/icon/icon-network-green.png');
    }
  }
  .icon-explorer {
    background-image: url('../../assets/images/icon/icon-explorer.png');
    background-size: 68%;
  }
  .icon-lock {
    background-image: url('../../assets/images/icon/icon-lock.png');
  }
  .icon-refresh {
    background-image: url('../../assets/images/icon/icon-refresh.png');
  }
}
</style>
