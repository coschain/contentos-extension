import { accountInfo, callContentCallback } from '../service/WalletApi';
import { formatLongDate2 } from '../../../util/Date';
import { formatDecimal } from '../../../util/Format';

export default {
  data() {
    return {
      actionId: '',
      contentParams: null,
    };
  },
  methods: {
    async showHomePage() {
      await this.getState();
      if (this.currentAccount) {
        this.$router.replace('/wallet/home');
      } else {
        this.$router.replace('/');
      }
    },
    showBindWarningDialog(type) {
      this.$root.dialogData = {
        title: this.$t('components.warning'),
        content: this.$t('components.createAccountWarning', { type }),
        cancelText: this.$t('common.cancel'),
        confirmText: this.$t('components.gotoUnbind'),
        onConfirm: () => {
          this.openUrl('https://cos.tv');
          return Promise.resolve(true);
        },
      };
    },
    async getCurrentAccountInfo() {
      if (!this.currentAccount) {
        return null;
      }

      let res = null;
      try {
        res = await accountInfo(this.currentAccount.account);
      } catch (ex) {
        // TODO
      }
      if (!res || !res.info) {
        return null;
      }
      this.$root.userData.balance = formatDecimal(res.info.coin.value / 1e6, 6);
      this.$root.userData.vest = formatDecimal(res.info.vest.value / 1e6, 6);
      this.$root.userData.stake = formatDecimal(res.info.stakeVestForMe.value / 1e6, 6);
      this.$root.userData.stamina = res.info.staminaFreeRemain + res.info.staminaStakeRemain;
      this.$root.userData.percent = Math.min((this.$root.userData.stamina / res.info.staminaMax) * 100, 100).toFixed(2);
      this.$root.userData.withdrawRemains = formatDecimal(res.info.withdrawRemains.value / 1e6, 6);
      this.$root.userData.withdrawEachTime = formatDecimal(res.info.withdrawEachTime.value / 1e6, 6);
      this.$root.userData.votedBlockProducer = res.info.votedBlockProducer.value;
      const { utcSeconds } = res.info.nextWithdrawTime;
      this.$root.userData.nextWithdraw = utcSeconds > 0 ? formatLongDate2(utcSeconds) : this.$t('components.noWaitingWithdraw');
      this.$root.userData.vestLent = formatDecimal(res.info.vestLent.value / 1e6, 6);
      this.$root.userData.vestBorrowed = formatDecimal(res.info.vestBorrowed.value / 1e6, 6);
      this.$root.userData.vestDelivering = formatDecimal(res.info.vestDelivering.value / 1e6, 6);
      this.$root.userData.vestOwned = formatDecimal(res.info.vestOwned.value / 1e6, 6);
      return res;
    },
    restoreContentParams() {
      let { actionId } = this.$route.query;
      if (!actionId && this.$route.query.redirectQuery) {
        try {
          const redirectActionId = JSON.parse(this.$route.query.redirectQuery).actionId;
          actionId = redirectActionId;
        } catch (ex) {
          // TODO
        }
      }
      if (!actionId) {
        this.contentParams = null;
        return;
      }
      this.actionId = actionId;
      try {
        this.contentParams = JSON.parse(localStorage.getItem(actionId));
      } catch (ex) {
        // TODO
      }
      window.onbeforeunload = () => {
        this.onUserCancel();
      };
    },
    async onUserCancel() {
      try {
        await callContentCallback(this.actionId, null, { code: 10001, message: this.$t('components.userCancelled') });
      } catch (ex) {
        // TODO
      }
      this.closePopup();
    },
    closePopup() {
      setTimeout(() => {
        if (this.contentParams && this.contentParams.windowId) {
          chrome.windows.remove(this.contentParams.windowId);
        } else {
          window.close();
        }
      }, 80);
    },
  },
};
