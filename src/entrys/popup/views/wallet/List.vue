<template>
  <div v-if="$root.wallet" class="common-list wallet-list-page">
    <div v-for="(item, index) in $root.wallet.accounts" :key="index" :class="`common-list-item wallet-item${index == $root.wallet.selected ? ' selected' : ''}`">
      <div class="list-item-title wallet-name">
        {{ item.account }}
        <div class="space"></div>
        <a v-if="index != $root.wallet.selected" @click="changeAccount(item.id)" class="icon icon-selection" v-tooltip="$t('common.setDefault')"></a>
        <a v-clipboard="item.account" @success="onCopySuccess" @error="onCopyError" class="icon icon-copy" v-tooltip="$t('common.copyAddress')"></a>
        <a @click="exportAccount(item.id)" class="icon icon-export" v-tooltip="$t('common.export')"></a>
        <a @click="deleteAccount(item.id)" class="icon icon-delete" v-tooltip="$t('common.delete')"></a>
      </div>
      <div class="list-item-content wallet-balances">
        <div class="balance-item layout-box">
          <div class="box-col">{{ $t('common.balance') }}</div>
          <div class="box-col">{{ (balances[index] && balances[index].balance) || '0.000000' }} COS</div>
        </div>
        <div class="balance-item layout-box">
          <div class="box-col">Vest</div>
          <div class="box-col">{{ (balances[index] && balances[index].vest) || '0.000000' }} VEST</div>
        </div>
        <div class="balance-item layout-box">
          <div class="box-col">Stamina</div>
          <div class="box-col">{{ (balances[index] && balances[index].stamina) || '0' }}（{{ (balances[index] && balances[index].percent) || '0' }}% {{ $t('home.left') }}）</div>
        </div>
        <div class="balance-item layout-box">
          <div class="box-col">Network</div>
          <div class="box-col">{{ item.networkTitle }}</div>
        </div>
      </div>
    </div>
    <div class="common-list-item wallet-operate layout-box">
      <div class="box-col">
        <router-link to="/account/create">{{ $t('nav.createAccount') }}</router-link>
      </div>
      <div class="box-col">
        <router-link to="/account/import">{{ $t('nav.importAccount') }}</router-link>
      </div>
    </div>
  </div>
</template>
<script>
import { changeAccountSelected, removeAccountById, getPrivateKeyById, accountInfo } from '../../service/WalletApi';
import { formatDecimal } from '../../../../util/Format';

export default {
  data() {
    return {
      balances: [],
    };
  },
  created() {
    this.initData();
  },
  mounted() {},
  components: {},
  methods: {
    initData() {
      if (!this.$root.wallet) {
        return;
      }
      const { accounts } = this.$root.wallet;
      if (accounts.length <= 0) {
        return;
      }
      accounts.forEach((item, index) => {
        const { account } = item;
        accountInfo(account).then(res => {
          if (res && res.info) {
            const stamina = res.info.staminaFreeRemain + res.info.staminaStakeRemain;
            this.$set(this.balances, index, {
              balance: formatDecimal(res.info.coin.value / 1e6, 6),
              vest: formatDecimal(res.info.vest.value / 1e6, 6),
              percent: Math.min((stamina / res.info.staminaMax) * 100, 100).toFixed(2),
              stamina,
            });
          } else {
            this.$set(this.balances, index, {
              balance: '- ',
              vest: '- ',
              stamina: '- ',
              percent: '0',
            });
          }
        });
      });
    },
    async changeAccount(id) {
      try {
        await changeAccountSelected(id);
      } catch (ex) {
        this.toast(ex.message);
        return;
      }
      await this.getState();
    },
    deleteAccount(id) {
      const filterList = this.$root.wallet.accounts.filter(item => item.id === id);
      if (filterList.length <= 0) {
        this.toast(this.$t('list.notFound'));
        return;
      }
      const { account } = filterList[0];
      this.$root.dialogData = {
        title: this.$t('components.warning'),
        content: this.$t('list.delteConfirm', { account }),
        cancelText: this.$t('common.cancel'),
        confirmText: this.$t('common.confirm'),
        onConfirm: async () => {
          let result = true;
          try {
            await removeAccountById(id);
          } catch (ex) {
            this.toast(ex.message);
            result = false;
          }
          if (result) {
            this.getState().then(() => {
              if (!this.$root.wallet || this.$root.wallet.accounts.length <= 0) {
                this.$router.replace({ path: '/' });
              }
            });
          }
          return Promise.resolve(result);
        },
      };
    },
    exportAccount(id) {
      this.$root.dialogData = {
        title: this.$t('list.inputPassword'),
        inputFields: [
          {
            type: 'password',
            placeholder: this.$t('lock.enterPassword'),
            name: 'password',
          },
        ],
        cancelText: this.$t('common.cancel'),
        confirmText: this.$t('common.confirm'),
        onConfirm: async data => {
          let result = true;
          if (!data.password) {
            this.toast(this.$t('lock.enterPassword'));
            result = false;
          }
          if (result) {
            let privateKey = '';
            try {
              privateKey = await getPrivateKeyById(id, data.password);
            } catch (ex) {
              this.toast(ex.message);
            }
            if (privateKey) {
              result = true;
              setTimeout(() => {
                this.showPrivateKeyDialog(privateKey);
              }, 60);
            } else {
              result = false;
            }
          }
          return Promise.resolve(result);
        },
      };
    },
    showPrivateKeyDialog(privateKey) {
      this.$root.dialogData = {
        title: this.$t('list.exportTitle'),
        content: this.$t('list.exportTips'),
        inputFields: [
          {
            type: 'privateKey',
            value: privateKey,
          },
        ],
        clipboardData: privateKey,
        onConfirm: () => {
          this.onCopySuccess();
          return Promise.resolve(false);
        },
      };
    },
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
.wallet-list-page {
  padding: 1rem;
  .icon-selection {
    background-image: url('../../assets/images/icon/icon-selection.png');
  }
  .icon-copy {
    background-image: url('../../assets/images/icon/icon-copy.png');
    background-size: 74% !important;
    background-position: 50% 40% !important;
  }
  .icon-export {
    background-image: url('../../assets/images/icon/icon-export.png');
  }
  .icon-delete {
    background-image: url('../../assets/images/icon/icon-delete.png');
  }
  .wallet-operate {
    text-align: center;
    padding: 0.65rem 0;
    .box-col:nth-child(1) {
      border-right: solid 1px #eee;
    }
    a {
      color: @black-color;
      transition: color ease 0.2s;
      &:hover {
        color: @primary-color;
      }
    }
    &:hover {
      box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.1);
    }
  }
  .wallet-item {
    padding: 0.2rem 1rem 0.8rem;
    .wallet-balances {
      font-size: 0.72rem;
      .balance-item {
        margin-top: 0.2rem;
      }
      .box-col:nth-child(1) {
        flex: 0.5;
      }
    }
    .network-type {
      font-size: 0.64rem;
    }
    &.selected {
      .icon-copy {
        background-image: url('../../assets/images/icon/icon-copy-white.png');
      }
      .icon-export {
        background-image: url('../../assets/images/icon/icon-export-white.png');
      }
      .icon-delete {
        background-image: url('../../assets/images/icon/icon-delete-white.png');
      }
    }
  }
}
</style>
