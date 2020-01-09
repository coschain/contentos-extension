<template>
  <div class="lock-time-page">
    <ul class="slide-list slide-small-list">
      <li v-for="(item, index) in dataList" :key="index" class="slide-item sitem-hide-icon sitem-hide-arrow">
        <a @click="changeDefault(item.value)">{{ $t(item.title) }}</a>
        <span v-if="item.value == lockTime" class="icon icon-selection">Select</span>
        <div class="halfline"></div>
      </li>
    </ul>
  </div>
</template>
<script>
import { getLockTime, setLockTime } from '../../service/WalletApi';

export default {
  data() {
    return {
      lockTime: 0,
      dataList: [
        {
          title: 'locktime.1min',
          value: 60,
        },
        {
          title: 'locktime.5min',
          value: 300,
        },
        {
          title: 'locktime.10min',
          value: 600,
        },
        {
          title: 'locktime.30min',
          value: 1800,
        },
        {
          title: 'locktime.1hour',
          value: 3600,
        },
        {
          title: 'locktime.never',
          value: 0,
        },
      ],
    };
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.lockTime = await getLockTime();
    },
    async changeDefault(lockTime) {
      await setLockTime(lockTime);
      this.lockTime = parseInt(lockTime, 10);
    },
  },
};
</script>

<style lang="less" scoped>
.lock-time-page {
  .slide-list .slide-item a {
    padding-left: 1rem !important;
  }
  .icon {
    left: auto !important;
    right: 1rem !important;
    width: 1.2rem !important;
    height: 1.2rem !important;
  }
  .icon-selection {
    text-indent: -999em;
    background-image: url('../../assets/images/icon/icon-selection-green.png');
  }
}
</style>
