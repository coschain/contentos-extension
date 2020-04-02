<template>
  <div class="vest-lend-page">
    <form @submit.prevent="goSubmit" action="#" method="post">
      <div class="form-items">
        <div class="form-item">
          <div class="item-title">{{ $t('transfer.fromAccount') }}</div>
          <input disabled :value="currentAccount.account" class="item-input disabled" />
        </div>
        <div class="form-item">
          <div class="item-title">{{ $t('transfer.toAccount') }}</div>
          <input spellcheck="false" v-model="toAccount" :placeholder="$t('exchange.recipientAccount')" class="item-input" />
        </div>
        <div class="form-item">
          <div class="item-title">
            {{ $t('transfer.amount') }}
            <div class="title-brief">{{ $t('vestlend.maxQuote') }}{{ getMaxQuota() }} VEST</div>
          </div>
          <input spellcheck="false" v-model="amount" :placeholder="$t('exchange.inputAmount')" class="item-input" />
          <div class="item-unit">VEST</div>
        </div>
        <div class="form-item">
          <div class="item-title">
            {{ $t('vestlend.duration') }}
            <div class="title-brief">{{ $t('vestlend.durationUnit') }}</div>
          </div>
          <input spellcheck="false" v-model="duration" :placeholder="$t('vestlend.inputDuration')" class="item-input" />
        </div>
      </div>
      <div class="buttons">
        <button :class="`common-button${operating ? ' disabled' : ''}`" type="submit">{{ $t('vestlend.confirm') }}</button>
      </div>
    </form>
  </div>
</template>
<script>
import { formatDecimal } from '../../../../util/Format';
import { delegateVest } from '../../service/WalletApi';

export default {
  data() {
    return {
      toAccount: '',
      amount: '',
      duration: '',
      operating: false,
    };
  },
  created() {
    this.eventBus.$emit('refreshAccountInfo');
  },
  mounted() {},
  components: {},
  methods: {
    async goSubmit() {
      if (this.operating) {
        return;
      }
      if (!this.toAccount) {
        this.toast(this.$t('exchange.amountTips'));
        return;
      }
      const amount = parseFloat(this.amount, 10) || 0;
      if (!amount || amount <= 0) {
        this.toast(this.$t('exchange.enterAmount'));
        return;
      }
      const duration = parseFloat(this.duration, 10) || 0;
      if (!duration || duration <= 0) {
        this.toast(this.$t('vestlend.enterDuration'));
        return;
      }
      this.operating = true;
      this.startLoading(true);
      const result = await delegateVest(this.currentAccount.account, this.toAccount, formatDecimal(amount, 6), this.duration);
      if (result && result.invoice && result.invoice.status === 200) {
        const { trxId } = result.invoice;
        this.$root.dialogData = {
          title: this.$t('vestlend.success'),
          content: `TxHash：${trxId}`,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('exchange.openExplorer'),
          onConfirm: () => {
            this.openUrl(`/#/tx/${trxId}`);
            return Promise.resolve(true);
          },
        };
        this.amount = '';
        this.duration = '';
        this.toAccount = '';
      } else {
        this.showErrorDialog(this.$t('vestlend.failed'), result);
      }
      this.operating = false;
      this.stopLoading();
      this.eventBus.$emit('refreshAccountInfo');
    },
    getMaxQuota() {
      const effectiveVest = parseFloat(this.$root.userData.vest, 10) || 0;
      const borrowedVest = parseFloat(this.$root.userData.vestBorrowed, 10) || 0;
      const powerDownVest = parseFloat(this.$root.userData.withdrawLeft, 10) || 0;
      const accountCreationFee = 0.1;
      const d = borrowedVest + powerDownVest + accountCreationFee;
      const maxQuota = effectiveVest > d ? effectiveVest - d : 0;
      return formatDecimal(maxQuota, 6);
    },
  },
};
</script>

<style lang="less" scoped>
.vest-lend-page {
  padding: 0.8rem 1rem;
  .buttons {
    padding-top: 0.6rem;
  }
}
</style>
