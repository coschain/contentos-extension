import Vue from 'vue';
import VueClipboards from 'vue-clipboards';
import VTooltip from 'v-tooltip';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import vueTencentCaptcha from '@carpenter/vue-tencent-captcha';
import VueAnalytics from 'vue-analytics';

import App from './App';
import router from './router';
import createI18n from './i18n';

import Toast from './plugins/vue2-toast/toast';
import MixinPlugin from './plugins/MixinPlugin';

import { getLang, getState } from './service/WalletApi';

import './plugins/Rem';
import './assets/style/mixin.less';
import './plugins/vue2-toast/toast.css';

Vue.config.productionTip = false;

Vue.use(MixinPlugin);
Vue.use(VueClipboards);
Vue.use(Toast);
Vue.component(VueQrcode.name, VueQrcode);
Vue.use(VTooltip);
Vue.use(vueTencentCaptcha);

Vue.use(VueAnalytics, {
  id: 'UA-155294164-1',
  router,
  set: [{ field: 'checkProtocolTask', value: 'null' }],
});

function initApp(lang, state) {
  const { network, wallet, locked, walletCreated } = state;
  const app = new Vue({
    data() {
      return {
        locked,
        walletCreated,
        wallet,
        network,
        userData: {
          balance: '0.000000',
          vest: '0.000000',
          stake: '0.000000',
          stamina: 0,
          percent: '0.00',
          withdrawEachTime: '0.000000',
          withdrawRemains: '0.000000',
          nextWithdraw: '',
          votedBlockProducer: '',
        },
        dialogData: null,
      };
    },
    router,
    i18n: createI18n({ lang }),
    render: h => h(App),
    beforeCreate() {
      Vue.prototype.eventBus = this;
    },
  });
  router.beforeEach((to, from, next) => {
    // console.warn(`router from： ${from}`);
    if (!to.meta.requireAuth || app.currentAccount) {
      next();
    } else {
      let path = '/';
      if (!app.$root.walletCreated) {
        // default path
      } else if (app.$root.locked) {
        path = '/account/lock';
      } else if (!app.$root.network) {
        // default path
      }
      next({ path });
    }
  });
  app.$mount('#app');
}

Promise.all([getLang(), getState()]).then(datas => {
  initApp(...datas);
});
