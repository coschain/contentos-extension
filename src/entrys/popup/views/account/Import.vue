<template>
  <div class="createaccount-page">
    <div class="layout-box common-switch">
      <a v-for="(item, index) in importTypes" :key="index" :class="`box-col switch-item${importTypeIndex == index ? ' selected' : ''}`" @click="importTypeIndex = index">{{
        item
      }}</a>
    </div>
    <div class="form-items">
      <div class="form-item">
        <div class="item-title">{{ $t('import.enterYourName') }}</div>
        <input maxlength="16" spellcheck="false" v-model="username" :placeholder="$t('import.nameRule')" class="item-input" />
      </div>
      <div v-if="importTypeIndex == 0" class="form-item">
        <div class="item-title">{{ $t('import.enterYourMnemonic') }}</div>
        <textarea spellcheck="false" rows="4" :placeholder="$t('components.dontInputPublic')" class="item-textarea" v-model="mnemonic"></textarea>
      </div>
      <div v-else class="form-item">
        <div class="item-title">{{ $t('import.enterYourPrivateKey') }}</div>
        <textarea spellcheck="false" rows="2" :placeholder="$t('components.dontInputPublic')" class="item-textarea" v-model="privateKey"></textarea>
      </div>
    </div>
    <div class="buttons">
      <a :class="`common-button${operating ? ' disabled' : ''}`" @click="goConfirm">{{ $t('common.confirm') }}</a>
    </div>
  </div>
</template>
<script>
import MixinAccount from '../../plugins/MixinAccount';
import { importNewAccount } from '../../service/WalletApi';

export default {
  data() {
    return {
      importTypes: [this.$t('import.usingMnemonic'), this.$t('import.usingPrivateKey')],
      importTypeIndex: 0,
      username: '',
      mnemonic: '',
      privateKey: '',
      operating: false,
    };
  },
  mixins: [MixinAccount],
  methods: {
    async goConfirm() {
      if (this.operating) {
        return;
      }
      if (!this.username) {
        this.toast(this.$t('create.enterUsernameTips'));
        return;
      }
      if (this.username.length < 6 || this.username.length > 16) {
        this.toast(this.$t('create.usernameRuleTips'));
        return;
      }
      if (!this.username.match(/^[0-9a-z]+$/)) {
        this.toast(this.$t('create.usernameRuleCharsTips'));
        return;
      }
      if (this.importTypeIndex === 0) {
        if (!this.mnemonic) {
          this.toast(this.$t('create.enterMnemonic'));
          return;
        }
      } else if (!this.privateKey) {
        this.toast(this.$t('create.enterPrivateKey'));
        return;
      }
      this.startLoading();
      this.operating = true;
      try {
        await importNewAccount(this.username, this.privateKey, this.mnemonic, this.$route.params.password);
      } catch (ex) {
        if (ex.code === 10002) {
          this.toast(ex.message);
        } else {
          this.showBindWarningDialog(this.importTypeIndex === 0 ? this.$t('common.mnemonic') : this.$t('common.privateKey'));
        }
        return;
      } finally {
        this.stopLoading();
        this.operating = false;
      }
      await this.showHomePage();
    },
  },
};
</script>

<style lang="less" scoped>
.createaccount-page {
  padding: 1rem 1rem 0.8rem;
  .form-items {
    padding-top: 1.2rem;
  }
  .buttons {
    padding-top: 0.6rem;
  }
}
</style>
