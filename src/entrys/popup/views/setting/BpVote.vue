<template>
  <div class="common-list bp-vote-page">
    <div class="vote-result">
      <template v-if="voted">
        {{ $t('bpvote.votedTips') }}<span>{{ voted }}</span>
      </template>
      <template v-else>
        {{ $t('bpvote.voteTips') }}
      </template>
    </div>
    <div v-for="(item, index) in bpList" :key="index" :class="`common-list-item bp-vote-item${voted == item.name ? ' selected' : ''}`">
      <div class="list-item-title">
        {{ index + 1 }}、{{ item.name }}
        <div class="space"></div>
        <a v-if="voted == item.name" @click="changeVote(item.name, 1)" class="icon icon-cancel" v-tooltip="$t('bpvote.cancelVote')"></a>
        <a v-else-if="!voted" @click="changeVote(item.name, 0)" class="icon icon-selection" v-tooltip="$t('bpvote.vote')"></a>
      </div>
      <div class="list-item-content bp-vote-content">
        <div class="balance-item layout-box">
          <div class="box-col">{{ $t('bpvote.voters') }}</div>
          <div class="box-col">{{ item.voters }}</div>
        </div>
        <div class="balance-item layout-box">
          <div class="box-col">{{ $t('bpvote.vestVotes') }}</div>
          <div class="box-col">{{ item.vestVotes }} VEST</div>
        </div>
        <div class="balance-item layout-box">
          <div class="box-col">{{ $t('bpvote.blocks') }}</div>
          <div class="box-col">{{ item.blocks }}</div>
        </div>
        <div v-if="item.website" class="balance-item layout-box">
          <div class="box-col">{{ $t('bpvote.website') }}</div>
          <div class="box-col">
            <a @click="openUrl(item.website)">{{ item.website }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { formatDecimal } from '../../../../util/Format';
import { blockProducerList, voteToBlockProducer } from '../../service/WalletApi';

export default {
  data() {
    return {
      bpList: [],
      start: null,
      limit: 50,
      lastBlockProducer: null,
      hasMore: true,
    };
  },
  created() {
    this.startLoading();
    this.eventBus.$emit('refreshAccountInfo');
    this.loadBpList();
  },
  components: {},
  mounted() {},
  computed: {
    voted() {
      return this.$root.userData.votedBlockProducer;
    },
  },
  methods: {
    async loadBpList() {
      const { blockProducerListList } = await blockProducerList(this.start, this.limit, this.lastBlockProducer);
      if (blockProducerListList) {
        const bpList = [];
        blockProducerListList.forEach(item => {
          bpList.push({
            name: item.owner.value,
            voters: item.voterCount,
            vestVotes: formatDecimal(item.bpVest.voteVest.value / 1e6, 6),
            blocks: item.genBlockCount,
            website: item.url,
          });
        });
        this.bpList = bpList;
        this.hasMore = blockProducerListList.length >= this.limit;
      }
      this.stopLoading();
    },
    async changeVote(name, cancelVote) {
      this.startLoading(true);
      const result = await voteToBlockProducer(this.currentAccount.account, name, !!cancelVote);
      if (result && result.invoice && result.invoice.status === 200) {
        this.eventBus.$emit('refreshAccountInfo');
      } else {
        this.showErrorDialog(this.$t('bpvote.voteFailed'), result);
      }
      await this.loadBpList();
      this.stopLoading();
    },
  },
};
</script>

<style lang="less" scoped>
.bp-vote-page {
  padding: 1rem;
  .vote-result {
    padding: 0 0 0.8rem;
    color: @black-color;
    span {
      color: @primary-color;
    }
  }
  .icon-selection {
    background-image: url('../../assets/images/icon/icon-selection.png');
  }
  .bp-vote-item {
    padding: 0.2rem 1rem 0.8rem;
    white-space: nowrap;
    a {
      color: @primary-color;
    }
    .bp-vote-content {
      font-size: 0.72rem;
      .balance-item {
        margin-top: 0.2rem;
      }
      .box-col:nth-child(1) {
        flex: 0.75;
      }
      .box-col:nth-child(2) {
        white-space: normal;
        word-break: break-all;
      }
    }
    &.selected {
      .icon-cancel {
        background-image: url('../../assets/images/icon/icon-cancel-white.png');
      }
      a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: underline;
      }
    }
  }
}
</style>
