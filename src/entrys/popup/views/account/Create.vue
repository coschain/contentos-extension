<template>
  <div class="createaccount-page">
    <div v-if="stepIndex == 0" class="steps-item steps-1">
      <div class="form-item">
        <div class="item-title">{{ $t('create.enterUsername') }}</div>
        <input spellcheck="false" maxlength="16" v-model="username" :placeholder="$t('create.userNameTips')" class="item-input" />
        <div class="item-brief">{{ $t('create.userNameRule') }}</div>
      </div>
    </div>
    <div v-if="stepIndex == 1" class="steps-item steps-2">
      <div class="form-item">
        <div class="item-title">{{ $t('create.mnemonic') }}</div>
        <div class="item-textarea mnemonic-words">
          <span v-for="(item, index) in rightMnemonic" :key="index" class="word-item"><template v-if="index != 0">&nbsp;</template>{{ item }}</span>
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
        <a v-for="(item, index) in importTypes" :key="index" :class="`box-col switch-item${importTypeIndex == index ? ' selected' : ''}`" @click="importTypeIndex = index">{{
          item
        }}</a>
      </div>
      <div v-if="importTypeIndex == 0" class="form-item">
        <div class="item-title">{{ $t('create.reorderTips') }}</div>
        <div class="item-textarea mnemonic-words edit-mode">
          <span v-for="(item, index) in confirmMnemonic" :key="index" class="word-item">{{ item }}</span>
        </div>
        <div v-if="disorderMnemonic.length > 0" class="item-textarea mnemonic-words edit-mode reorder-mnemonic">
          <span @click="confirmWorkItem(index, item)" v-for="(item, index) in disorderMnemonic" :key="index" class="word-item">{{ item }}</span>
        </div>
      </div>
      <div v-else class="form-item">
        <div class="item-title">{{ $t('create.inputPrivateKey') }}</div>
        <textarea spellcheck="false" rows="2" :placeholder="$t('components.dontInputPublic')" class="item-textarea" v-model="confirmPrivateKey"></textarea>
      </div>
    </div>
    <div class="buttons">
      <vueTencentCaptcha v-if="stepIndex == 2" appid="2085519879" @callback="oncaptCaptchaCallback">
        <a :class="`common-button${operating ? ' disabled' : ''}`">{{ $t('create.verify') }}</a>
      </vueTencentCaptcha>
      <a v-else :class="`common-button${operating ? ' disabled' : ''}`" @click="goNext">{{ $t('common.next') }}</a>
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
      importTypes: [this.$t('create.verifyMnemonic'), this.$t('create.verifyPrivateKey')],
      importTypeIndex: 0,
      disorderMnemonic: [],
      confirmMnemonic: [],
      rightMnemonic: [],
      confirmPrivateKey: '',
      operating: false,
    };
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
        if (!this.username.match(/^[0-9a-z]+$/)) {
          this.toast(this.$t('create.usernameRuleCharsTips'));
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
        this.rightMnemonic = mnemonic.split(/\s+/);
        this.disorderMnemonic = [...this.rightMnemonic].sort(() => {
          return Math.random() > 0.5 ? -1 : 1;
        });
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
        if (this.confirmMnemonic.length <= 0) {
          this.toast(this.$t('create.enterMnemonic'));
          return;
        }
        if (this.confirmMnemonic.join(' ') !== this.mnemonic) {
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
    confirmWorkItem(index, keyword) {
      if (this.rightMnemonic[this.confirmMnemonic.length] !== keyword) {
        this.toast(this.$t('create.incorrentMnemonic'));
        return;
      }
      this.disorderMnemonic.splice(index, 1);
      this.confirmMnemonic.push(keyword);
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
    font-size: 0.68rem;
    padding: 0.8rem 0.3rem 0.4rem 0.8rem;
    color: @red-color;
    .word-item {
      letter-spacing: 0.4px;
      text-align: center;
      border: solid 1px @red-color;
      display: inline-block;
      border-radius: 0.28rem;
      background: rgba(255, 152, 0, 0.06);
      padding: 0;
      margin: 0 0.5rem 0.5rem 0;
      height: 1.3rem;
      line-height: 1.3rem;
      white-space: nowrap;
      box-sizing: border-box;
      width: calc(25% - 0.5rem);
    }
    &.edit-mode {
      min-height: 3.2rem;
    }
    &.reorder-mnemonic {
      .word-item {
        cursor: pointer;
        user-select: none;
        transition: background-color ease 0.2s;
        &:hover {
          background-color: rgba(255, 152, 0, 0.15);
        }
        &:active {
          background-color: rgba(255, 152, 0, 0.3);
        }
      }
      margin-top: 0.6rem;
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
