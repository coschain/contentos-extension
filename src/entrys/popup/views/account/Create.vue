<template>
  <div class="createaccount-page">
    <div v-if="stepIndex == 0" class="steps-item steps-1">
      <div class="form-item">
        <div class="item-title">{{ $t('create.enterUsername') }}</div>
        <input spellcheck="false" v-model="username" :placeholder="$t('create.userNameTips')" class="item-input" />
        <div class="item-brief">{{ $t('create.userNameRule') }}</div>
      </div>
    </div>
    <div v-if="stepIndex == 1" class="steps-item steps-2">
      <div class="form-item">
        <div class="item-title">{{ $t('create.mnemonic') }}</div>
        <div class="item-textarea mnemonic-words">
          <span v-for="(item, index) in formatMnemonic" :key="index" class="word-item"><template v-if="index != 0">&nbsp;</template>{{ item }}</span>
        </div>
        <div class="item-brief">{{ $t('components.warnMnemonicTips') }}</div>
      </div>
      <div class="form-item">
        <div class="item-title">{{ $t('create.privateKey') }}</div>
        <div class="item-textarea">{{ privateKey }}</div>
        <div class="item-brief">{{ $t('components.warnPrivateKeyTips') }}</div>
      </div>
    </div>
    <div v-if="stepIndex == 2" class="steps-item steps-3">
      <div class="layout-box common-switch">
        <a
          v-for="(item, index) in importTypes"
          :key="index"
          :class="`box-col switch-item${importTypeIndex == index ? ' selected' : ''}`"
          @click="importTypeIndex = index"
          href="javascript:;"
          >{{ item }}</a
        >
      </div>
      <div v-if="importTypeIndex == 0" class="form-item">
        <div class="item-title">{{ $t('create.inputMnemonic') }}</div>
        <textarea spellcheck="false" rows="4" :placeholder="$t('components.dontInputPublic')" class="item-textarea" v-model="confirmMnemonic"></textarea>
      </div>
      <div v-else class="form-item">
        <div class="item-title">{{ $t('create.inputPrivateKey') }}</div>
        <textarea spellcheck="false" rows="2" :placeholder="$t('components.dontInputPublic')" class="item-textarea" v-model="confirmPrivateKey"></textarea>
      </div>
    </div>
    <div class="buttons">
      <vueTencentCaptcha v-if="stepIndex == 2" appid="2085519879" @callback="oncaptCaptchaCallback">
        <a :class="`common-button${operating ? ' disabled' : ''}`" href="javascript:;">{{ $t('create.verify') }}</a>
      </vueTencentCaptcha>
      <a v-else :class="`common-button${operating ? ' disabled' : ''}`" @click="goNext" href="javascript:;">{{ $t('common.next') }}</a>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import MixinAccount from '../../plugins/MixinAccount';
import { accountInfo, generateKeysWithMonemonic, createNewAccount } from '../../service/WalletApi';

export default {
  data() {
    return {
      username: '',
      mnemonic: '',
      privateKey: '',
      publicKey: '',
      stepIndex: 0,
      importTypes: [this.$t('create.verifyMnemonic'), this.$t('create.verifyMnemonic')],
      importTypeIndex: 0,
      confirmMnemonic: '',
      confirmPrivateKey: '',
      operating: false,
    };
  },
  computed: {
    formatMnemonic() {
      return this.mnemonic.split(' ');
    },
  },
  mixins: [MixinAccount],
  methods: {
    async goNext() {
      if (this.operating) {
        return;
      }
      if (this.stepIndex === 0) {
        if (!this.username) {
          this.toast(this.$t('create.enterUsernameTips'));
          return;
        }
        if (this.username.length < 6 || this.username.length > 16) {
          this.toast(this.$t('create.usernameRuleTips'));
          return;
        }
        this.startLoading();
        this.operating = true;
        const account = await accountInfo(this.username);
        this.stopLoading();
        this.operating = false;
        if (account && account.info && account.info.publicKey) {
          this.toast(this.$t('create.usernameRepeat'));
          return;
        }
        const [publicKey, privateKey, mnemonic] = await generateKeysWithMonemonic();
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.mnemonic = mnemonic;
      }
      if (this.stepIndex < 2) {
        this.stepIndex = this.stepIndex + 1;
      }
    },
    async oncaptCaptchaCallback(res) {
      if (res.ret !== 0) {
        return;
      }
      if (this.importTypeIndex === 0) {
        if (!this.confirmMnemonic) {
          this.toast(this.$t('create.enterMnemonic'));
          return;
        }
        if (this.confirmMnemonic !== this.mnemonic) {
          this.toast(this.$t('create.mnemonicNotMatch'));
          return;
        }
      } else {
        if (!this.confirmPrivateKey) {
          this.toast(this.$t('create.enterPrivateKey'));
          return;
        }
        if (this.confirmPrivateKey !== this.privateKey) {
          this.toast(this.$t('create.privateKeyNotMatch'));
          return;
        }
      }
      const { ticket, randstr } = res;
      this.startLoading();
      this.operating = true;
      const { list, selected } = this.$root.network;
      const result = await axios({
        method: 'post',
        url: `${list[selected].createAccountUrl || list[0].createAccountUrl}/v1/create_account`,
        data: {
          username: this.username,
          pubkey: this.publicKey,
          randstr,
          ticket,
        },
      });
      if (result && result.data && result.data.success) {
        try {
          await createNewAccount(this.username, this.privateKey, this.publicKey, this.$route.params.password);
        } catch (ex) {
          this.showErrorDialog(this.$t('create.createAccountFailed'), ex.message);
          return;
        } finally {
          this.stopLoading();
          this.operating = false;
        }
        await this.showHomePage();
      } else {
        this.stopLoading();
        this.operating = false;
        this.showErrorDialog(this.$t('components.warning'), this.$t('create.createAccountFailed'));
      }
    },
  },
};
</script>

<style lang="less" scoped>
.createaccount-page {
  padding: 0.8rem 1rem;
  .steps-1,
  .steps-2 {
    .item-textarea {
      color: @red-color;
      border-color: #ddd;
    }
  }
  .mnemonic-words {
    font-size: 0.7rem;
    padding: 0.8rem 0.4rem 0.4rem 0.8rem;
    .word-item {
      text-align: center;
      border: solid 1px @red-color;
      display: inline-block;
      border-radius: 0.28rem;
      background: rgba(255, 152, 0, 0.06);
      padding: 0 0.3rem;
      margin: 0 0.4rem 0.4rem 0;
      height: 1.2rem;
      line-height: 1.2rem;
    }
  }
  .steps-3 {
    padding-top: 0.2rem;
    .common-switch {
      margin-bottom: 0.8rem;
    }
  }
}
</style>