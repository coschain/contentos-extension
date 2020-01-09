<template>
  <div class="history-page">
    <div class="top-view">
      <div class="layout-box common-switch">
        <a v-for="(item, index) in historyTypes" :key="index" :class="`box-col switch-item${typeIndex == index ? ' selected' : ''}`" @click="changeHistoryType(index)">{{
          item.name
        }}</a>
      </div>
    </div>
    <ul v-if="dataList" class="slide-list history-list">
      <li v-for="(item, index) in dataList" :key="index" class="slide-item sitem-hide-icon sitem-hide-arrow">
        <a @click="openTxInfo(item.hash)">
          {{ item.fmtHash }}
          <div class="sitem-tip">{{ item.amount }} COS</div>
          <div class="sitem-brief layout-box">
            <div class="box-col">{{ item.date }}</div>
            <div class="box-col">{{ item.actions }}</div>
            <div :class="`box-col status status-${item.status_type}`">{{ item.status }}</div>
          </div>
        </a>
        <div class="halfline"></div>
      </li>
    </ul>
    <a v-if="dataList" @click="openMoreTxs" class="more-view">{{ $t('history.seeMore') }}</a>
  </div>
</template>
<script>
import { formatLongDate2 } from '../../../../util/Date';
import { formatDecimal } from '../../../../util/Format';
import { userTrxList } from '../../service/WalletApi';

export default {
  data() {
    return {
      historyTypes: [
        {
          name: this.$t('history.all'),
          value: '',
        },
        {
          name: this.$t('history.transfer'),
          value: ['transfer'],
        },
        {
          name: this.$t('history.vote'),
          value: ['vote'],
        },
        {
          name: this.$t('history.postReply'),
          value: ['post', 'reply'],
        },
      ],
      typeIndex: 0,
      dataList: null,
      dataSource: [],
    };
  },
  created() {
    this.startLoading();
    this.loadData();
  },
  mounted() {},
  components: {},
  methods: {
    formatHash(hash) {
      return `${hash.slice(0, 9)}...${hash.slice(-9)}`;
    },
    openTxInfo(hash) {
      this.openUrl(`/#/tx/${hash}`);
    },
    openMoreTxs() {
      this.openUrl(`/#/user-trxs/${this.currentAccount.account}`);
    },
    changeHistoryType(index) {
      this.typeIndex = index;
      this.dataList = this.dataSource.filter(item => {
        if (this.typeIndex === 0) {
          return true;
        }
        const keys = this.historyTypes[this.typeIndex].value;
        return keys.some(key => item.actions.toLowerCase().indexOf(key) >= 0);
      });
      this.stopLoading();
    },
    async loadData() {
      let dataSource = null;
      try {
        dataSource = await userTrxList(this.currentAccount.account, 100);
      } catch (ex) {
        this.toast(ex.message);
      }
      if (!dataSource) {
        this.stopLoading();
        return;
      }
      dataSource.forEach(sItem => {
        const item = sItem;
        item.date = formatLongDate2(item.utc_seconds);
        item.fmtHash = this.formatHash(item.hash);
        if (item.status_type === 200) {
          item.status = this.$t('history.success');
        } else if (item.status_type === 201) {
          item.status = this.$t('history.failedDeducted');
        } else {
          item.status = this.$t('history.failed');
        }
        item.amount = formatDecimal((parseInt(item.amount, 10) || 0) / 1e6, 6);
      });
      this.dataSource = dataSource;
      this.changeHistoryType(this.typeIndex);
    },
  },
};
</script>

<style lang="less" scoped>
.history-page {
  padding: 3.5rem 0 0;
  .top-view {
    top: 2.6rem;
    left: 0;
    width: 100%;
    position: absolute;
    padding: 1rem 0.8rem;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.06);
    z-index: 2;
  }
  .empty-view,
  .more-view {
    color: @gray-color;
    text-align: center;
  }
  .empty-view {
    padding: 3rem 0;
  }
  .more-view {
    display: block;
    padding: 1.2rem 0;
    transition: color ease 0.2s;
    &:hover {
      color: @primary-color;
    }
  }
  .slide-list {
    .slide-item {
      transition: background-color ease 0.2s;
      &:hover {
        background-color: rgba(27, 70, 211, 0.04);
      }
      .sitem-tip {
        font-size: 0.72rem;
        color: @black-color;
      }
      .sitem-brief {
        margin-top: 0.3rem;
        font-size: 0.72rem;
        color: @gray-color;
        .box-col {
          &:nth-child(1) {
            flex: 2;
          }
          &:nth-last-child(1) {
            text-align: right;
          }
        }
        .status {
          color: @red-color;
        }
        .status-200 {
          color: @green-color;
        }
        .status-201 {
          color: @yellow-color;
        }
      }
      &:nth-last-child(1) {
        .halfline {
          display: block;
        }
      }
    }
  }
}
</style>
