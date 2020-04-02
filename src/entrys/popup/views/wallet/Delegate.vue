<template>
  <div v-if="$root.wallet" class="common-list delegate-list-page">
    <div class="common-list-item delegate-operate layout-box">
      <div class="box-col">
        <router-link to="/wallet/vestlend">{{ $t('delegate.lend') }}</router-link>
      </div>
    </div>
    <div v-if="orders.length > 0">
      <div v-for="(item, index) in orders" :key="index" class="common-list-item delegate-item">
        <div class="list-item-title">
          {{ item.toAccount.value }}
          <div class="space"></div>
          <div v-if="getOrderStatus(item) === 'Matured'">
            <a @click="undelegateOrder(item.id)">{{ $t('delegate.undelegate') }}</a>
          </div>
        </div>
        <div class="list-item-content delegate-details">
          <div class="delegate-item layout-box">
            <div class="box-col">{{ $t('delegate.borrower') }}</div>
            <div class="box-col">{{ item.toAccount.value }}</div>
          </div>
          <div class="delegate-item layout-box">
            <div class="box-col">{{ $t('delegate.amount') }}</div>
            <div class="box-col">{{ formatVestValue(item.amount.value) }} VEST</div>
          </div>
          <div class="delegate-item layout-box">
            <div class="box-col">{{ $t('delegate.duration') }}</div>
            <div class="box-col">{{ item.maturityBlock - item.createdBlock }} Sec</div>
          </div>
          <div class="delegate-item layout-box">
            <div class="box-col">{{ $t('delegate.status') }}</div>
            <div class="box-col">{{ getOrderStatus(item) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDecimal } from '../../../../util/Format';
import MixinAccount from '../../plugins/MixinAccount';
import * as WalletApi from '../../service/WalletApi';

export default {
  data() {
    return {
      networkOk: false,
      orders: [],
      chainState: null,
      recalling: false,
    };
  },
  created() {
    this.eventBus.$on('refreshAccountInfo', () => {
      this.getDelegationOrders();
    });
    this.eventBus.$emit('refreshAccountInfo');
  },
  mixins: [MixinAccount],
  methods: {
    async getDelegationOrders() {
      this.startLoading();
      this.orders = [];
      if (!this.currentAccount) {
        this.stopLoading();
        this.networkOk = false;
        return;
      }
      const stateResp = await WalletApi.chainInfo();
      this.chainState = stateResp.state;
      const res = await WalletApi.vestDelegationOrders(this.currentAccount.account, true);
      if (res) {
        this.orders = res.ordersList;
        this.networkOk = true;
      } else {
        this.toast(this.$t('home.networkError'));
        this.networkOk = false;
      }
      this.stopLoading();
    },
    getOrderStatus(order) {
      const head = this.chainState.lastIrreversibleBlockNumber;
      if (order.deliveryBlock < 1e18) {
        return 'Delivering';
      }
      if (order.maturityBlock < head) {
        return 'Matured';
      }
      return 'Not Matured';
    },
    formatVestValue(value) {
      return formatDecimal(value / 1e6, 6);
    },
    async undelegateOrder(orderId) {
      if (this.recalling) {
        return;
      }
      this.recalling = true;
      this.startLoading(true);
      const result = await WalletApi.unDelegateVest(this.currentAccount.account, orderId);
      if (result && result.invoice && result.invoice.status === 200) {
        const { trxId } = result.invoice;
        this.$root.dialogData = {
          title: this.$t('delegate.recall_success'),
          content: `TxHash：${trxId}`,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('exchange.openExplorer'),
          onConfirm: () => {
            this.openUrl(`/#/tx/${trxId}`);
            return Promise.resolve(true);
          },
        };
      } else {
        this.showErrorDialog(this.$t('delegate.recall_failed'), result);
      }
      this.recalling = false;
      this.stopLoading();
      this.eventBus.$emit('refreshAccountInfo');
    },
  },
};
</script>

<style lang="less" scoped>
.delegate-list-page {
  padding: 1rem;
  .delegate-operate {
    background-color: #1b46d3;
    text-align: center;
    padding: 0.65rem 0;
    a {
      color: #eaeaea;
      transition: color ease 0.2s;
      &:hover {
        color: @yellow-color;
      }
    }
    &:hover {
      box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.1);
    }
  }
  .delegate-item {
    padding: 0.2rem 1rem 0.8rem;
    .delegate-details {
      font-size: 0.72rem;
      .detail-item {
        margin-top: 0.2rem;
      }
      .box-col:nth-child(1) {
        flex: 0.5;
      }
    }
  }
}
</style>
