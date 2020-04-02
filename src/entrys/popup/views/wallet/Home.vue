<template>
  <div class="home-page">
    <div class="top-view">
      <div class="logo"></div>
      <div class="balance">{{ $root.userData.balance }} COS</div>
      <div class="layout-box wallet-operate">
        <div class="box-col">
          <router-link class="operate-item" to="/wallet/transfer">
            <span class="icon icon-transfer"></span>
            {{ $t('home.transfer') }}
          </router-link>
        </div>
        <div class="box-col">
          <router-link class="operate-item" to="/wallet/delegate">
            <span class="icon icon-receive"></span>
            {{ $t('home.delegate') }}
          </router-link>
        </div>
        <div class="box-col">
          <router-link class="operate-item" to="/wallet/history">
            <span class="icon icon-history"></span>
            {{ $t('home.history') }}
          </router-link>
        </div>
      </div>
    </div>
    <div class="token-list">
      <div @click="goExchange('cosToVest')" class="token-item token-stamina">
        <div class="token-title">
          <div>
            Stamina：<span class="primary">{{ $root.userData.stamina }}</span>
          </div>
          <div>{{ $root.userData.percent }}% {{ $t('home.left') }}</div>
        </div>
        <div class="progress">
          <div :style="`width:${$root.userData.percent}%`" class="progress-inner"></div>
        </div>
      </div>
      <div v-for="(item, index) in tokenList" :key="index" @click="goExchange(item.type)" :class="`token-item token-normal token-item-${item.icon}`">
        <div class="token-info">
          <span class="token-icon"></span>
          <span class="token-name">{{ item.name }}</span>
        </div>
        <div class="token-balance">
          <span class="primary">{{ item.value }}</span> {{ item.unit }}
        </div>
      </div>
    </div>
    <wallet-footer-plugin :networkOk="networkOk" @reloadData="reloadData"></wallet-footer-plugin>
  </div>
</template>
<script>
import WalletFooterPlugin from '../../components/wallet/WalletFooterPlugin';
import MixinAccount from '../../plugins/MixinAccount';

export default {
  data() {
    return {
      networkOk: false,
      tokenList: [
        {
          name: 'Vest',
          unit: 'VEST',
          value: '0.000000',
          icon: 'vest',
          type: 'vestToCos',
        },
        {
          name: 'Chicken',
          unit: 'COS',
          value: '0.000000',
          icon: 'chicken',
          type: 'cosToStake',
        },
      ],
    };
  },
  created() {
    this.startLoading();
    this.eventBus.$on('refreshAccountInfo', () => {
      this.getAccountData();
    });
  },
  components: {
    WalletFooterPlugin,
  },
  activated() {
    this.getAccountData();
  },
  mixins: [MixinAccount],
  methods: {
    reloadData() {
      this.startLoading();
      this.getAccountData();
    },
    async getAccountData() {
      if (!this.currentAccount) {
        this.stopLoading();
        this.networkOk = false;
        return;
      }
      const res = await this.getCurrentAccountInfo();
      if (res) {
        const [vestItem, chickenItem] = this.tokenList;
        vestItem.value = this.$root.userData.vest;
        chickenItem.value = this.$root.userData.stake;
        this.tokenList = [vestItem, chickenItem];
        this.networkOk = true;
      } else {
        this.toast(this.$t('home.networkError'));
        this.networkOk = false;
      }
      this.stopLoading();
    },
    goExchange(type) {
      this.$router.push({
        path: '/wallet/exchange',
        query: { type },
      });
    },
    watchDataChanged() {
      if (this.$route.path !== '/wallet/home') {
        return;
      }
      this.reloadData();
    },
  },
};
</script>

<style lang="less" scoped>
.home-page {
  padding-top: 14rem;
  padding-bottom: 2rem;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  .icon {
    display: inline-block;
    width: 1.2rem;
    height: 1.2rem;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    margin-right: 0.3rem;
    vertical-align: middle;
  }
  .top-view {
    padding: 4rem 0 0;
    box-sizing: border-box;
    background-color: @primary-color;
    background-repeat: repeat-x;
    background-size: auto 100%;
    background-image: url('../../assets/images/header/header-background.png');
    position: absolute;
    top: 0;
    width: 100%;
    left: 0;
    background-position: left center;
    text-align: center;
    z-index: 2;
    box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.15);
    .logo {
      height: 3.6rem;
      width: 3.6rem;
      background-repeat: no-repeat;
      background-image: url('../../assets/images/logo/logo-cos-shadow.png');
      background-size: contain;
      background-position: center;
      display: inline-block;
    }
    .balance {
      font-size: 1.3rem;
      margin-top: 0.5rem;
      color: #fff;
      text-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.2);
    }
    .wallet-operate {
      margin-top: 1rem;
      border-top: solid 1px rgba(255, 255, 255, 0.14);
      .box-col {
        position: relative;
        &::before {
          content: ' ';
          height: 44%;
          width: 1px;
          position: absolute;
          display: block;
          right: 0;
          top: 28%;
          background-color: rgba(255, 255, 255, 0.14);
        }
        &:nth-last-child(1) {
          &::before {
            display: none;
          }
        }
      }
      .operate-item {
        height: 2.5rem;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon-transfer {
          background-image: url('../../assets/images/icon/icon-transfer-white.png');
        }
        .icon-receive {
          background-image: url('../../assets/images/icon/icon-receive-white.png');
        }
        .icon-history {
          background-image: url('../../assets/images/icon/icon-history-white.png');
        }
      }
    }
  }
  .token-list {
    padding: 1rem 1rem 0.2rem;
    .primary {
      font-weight: bold;
    }
    .token-item {
      position: relative;
      padding: 1.2rem 1rem;
      background: #fff;
      margin-bottom: 0.8rem;
      border-radius: 0.4rem;
      box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform ease 0.2s, box-shadow ease 0.2s;
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0.2rem 0.2rem 0.4rem rgba(0, 0, 0, 0.15);
      }
    }
    .token-normal,
    .token-stamina .token-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .token-normal {
      .token-info {
        padding-left: 2.6rem;
        box-sizing: border-box;
      }
      .token-icon {
        width: 2.1rem;
        height: 2.1rem;
        background-repeat: no-repeat;
        background-size: cover;
        display: inline-block;
        margin-right: 0.4rem;
        vertical-align: middle;
        border-radius: 2rem;
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-52%);
      }
    }
    .token-item-vest {
      .token-icon {
        background-image: url('../../assets/images/logo/icon-vest.png');
      }
    }
    .token-item-chicken {
      .token-icon {
        background-image: url('../../assets/images/logo/icon-chicken.png');
      }
    }
    .token-stamina {
      .progress {
        background-color: rgba(27, 70, 211, 0.15);
        position: relative;
        height: 0.6rem;
        border-radius: 1rem;
        overflow: hidden;
        margin-top: 0.5rem;
        .progress-inner {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, #2263e6, #1b46d3);
          transition: width ease 0.4s 0.2s;
        }
      }
    }
  }
}
</style>
