<template>
  <div class="language-page">
    <ul class="slide-list slide-small-list">
      <li v-for="(item, index) in dataList" :key="index" class="slide-item sitem-hide-icon sitem-hide-arrow">
        <a @click="changeDefault(index)">{{ item.title }}</a>
        <span v-if="languageIndex == index" class="icon icon-selection">Select</span>
        <div class="halfline"></div>
      </li>
    </ul>
  </div>
</template>
<script>
import { LANG_LIST } from '../../service/LangData';
import { setLang } from '../../service/WalletApi';

export default {
  data() {
    return {
      languageIndex: 0,
    };
  },
  computed: {
    dataList() {
      return LANG_LIST;
    },
  },
  created() {
    this.languageIndex = Math.max(
      LANG_LIST.findIndex(item => item.locale === this.$i18n.locale),
      0
    );
  },
  mounted() {},
  methods: {
    async changeDefault(index) {
      const lang = this.dataList[index].locale;
      await setLang(lang);
      this.languageIndex = index;
      this.$i18n.locale = lang;
    },
  },
};
</script>

<style lang="less" scoped>
.language-page {
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
