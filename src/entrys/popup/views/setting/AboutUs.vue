<template>
  <div class="about-us-page">
    <div class="top-view">
      <div class="logo"></div>
      <div class="title">{{ $t('common.title') }}</div>
      <div class="version">{{ version }}</div>
    </div>
    <div class="infos">
      <div class="title">{{ $t('aboutus.links') }}</div>
      <div class="content">
        <a v-for="(item, index) in links" :key="index" @click="openUrl(item.url)">{{ item.title }}</a>
      </div>
      <div class="title">{{ $t('aboutus.followUs') }}</div>
      <div class="content">
        <a v-for="(item, index) in followUs" :key="index" @click="openUrl(item.url)">{{ item.title }}</a>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      links: [
        {
          title: this.$t('aboutus.offical'),
          url: 'https://www.contentos.io',
        },
        {
          title: this.$t('aboutus.explorer'),
          url: 'https://explorer.contentos.io',
        },
        {
          title: this.$t('aboutus.github'),
          url: 'https://github.com/coschain',
        },
      ],
      followUs: [
        {
          title: this.$t('aboutus.telegram'),
          url: 'https://t.me/ContentosGlobal',
        },
        {
          title: this.$t('aboutus.medium'),
          url: 'https://medium.com/contentos-io',
        },
        {
          title: this.$t('aboutus.facebook'),
          url: 'https://www.facebook.com/ContentosOfficial',
        },
        {
          title: this.$t('aboutus.twitter'),
          url: 'https://twitter.com/contentosio',
        },
      ],
    };
  },
  computed: {
    version() {
      return process.env.VERSION;
    },
  },
  created() {},
  components: {},
  mounted() {},
  methods: {},
};
</script>

<style lang="less" scoped>
.about-us-page {
  .top-view {
    background: #fff;
    text-align: center;
    box-sizing: border-box;
    padding-top: 1.6rem;
    height: 10rem;
    box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.03);
    .logo {
      height: 3.4rem;
      width: 3.4rem;
      background-repeat: no-repeat;
      background-image: url('../../assets/images/logo/logo-cos-hd.png');
      background-size: contain;
      background-position: center;
      display: inline-block;
    }
    .title {
      margin-top: 0.1rem;
      font-size: 1rem;
      font-weight: bold;
    }
    .version {
      margin-top: 0.4rem;
      color: @light-black-color;
    }
  }
  .infos {
    padding: 0.2rem 1.4rem;
    text-align: center;
    .title {
      font-weight: bold;
      margin-top: 2rem;
    }
    .content {
      word-break: break-all;
      font-size: 0.72rem;
      margin-top: 0.6rem;
      a {
        color: @primary-color;
        margin-right: 1rem;
        text-decoration: underline;
        display: inline-block;
      }
    }
  }
}
</style>
