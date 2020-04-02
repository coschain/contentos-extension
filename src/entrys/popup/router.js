import Vue from 'vue';
import Router from 'vue-router';

import Welcome from './views/account/Welcome';
import Password from './views/account/Password';
import CreateAccount from './views/account/Create';
import ImportAccount from './views/account/Import';
import LockAccount from './views/account/Lock';

import WalletHome from './views/wallet/Home';
import WalletTransfer from './views/wallet/Transfer';
import WalletDelegate from './views/wallet/Delegate';
import WalletReceive from './views/wallet/Receive';
import WalletExchange from './views/wallet/Exchange';
import WalletHistory from './views/wallet/History';
import WalletList from './views/wallet/List';

import AuthTransfer from './views/auth/Transfer';
import AuthExchange from './views/auth/Exchange';
import AuthContract from './views/auth/Contract';
import AuthPost from './views/auth/Post';
import AuthReply from './views/auth/Reply';
import AuthVote from './views/auth/Vote';
import AuthVoteBp from './views/auth/VoteBp';
import AuthSign from './views/auth/Sign';

import Setting from './views/setting/Setting';
import Network from './views/setting/Network';
import DappWhiteList from './views/setting/DappWhiteList';
import BpVote from './views/setting/BpVote';
import Language from './views/setting/Language';
import ChangePassword from './views/setting/ChangePassword';
import LockTime from './views/setting/LockTime';
import AboutUs from './views/setting/AboutUs';

import * as HeaderTypes from './enums/HeaderType';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Welcome,
      meta: {
        title: 'nav.welcome',
        headerType: HeaderTypes.none,
        requireAuth: false,
      },
    },
    {
      name: 'password',
      path: '/account/password',
      component: Password,
      meta: {
        title: 'nav.setPassword',
        headerType: HeaderTypes.back,
        requireAuth: false,
      },
    },
    {
      name: 'createAccount',
      path: '/account/create',
      component: CreateAccount,
      meta: {
        title: 'nav.createAccount',
        headerType: HeaderTypes.back,
        requireAuth: false,
      },
    },
    {
      name: 'importAccount',
      path: '/account/import',
      component: ImportAccount,
      meta: {
        title: 'nav.importAccount',
        headerType: HeaderTypes.back,
        requireAuth: false,
      },
    },
    {
      path: '/account/lock',
      component: LockAccount,
      meta: {
        title: 'nav.lockAccount',
        headerType: HeaderTypes.none,
        requireAuth: false,
      },
    },
    {
      path: '/wallet/home',
      component: WalletHome,
      meta: {
        title: 'nav.home',
        keepAlive: true,
        headerType: HeaderTypes.account,
        requireAuth: true,
      },
    },
    {
      path: '/wallet/transfer',
      component: WalletTransfer,
      meta: {
        title: 'nav.transfer',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/wallet/delegate',
      component: WalletDelegate,
      meta: {
        title: 'nav.delegate',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/wallet/receive',
      component: WalletReceive,
      meta: {
        title: 'nav.receive',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/wallet/exchange',
      component: WalletExchange,
      meta: {
        title: 'nav.exchange',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/wallet/history',
      component: WalletHistory,
      meta: {
        title: 'nav.history',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/wallet/list',
      component: WalletList,
      meta: {
        title: 'nav.accountList',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/auth/transfer',
      component: AuthTransfer,
      meta: {
        title: 'nav.transferConfirm',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/auth/exchange',
      component: AuthExchange,
      meta: {
        title: 'nav.exchangeConfirm',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/auth/contract',
      component: AuthContract,
      meta: {
        title: 'nav.contractConfirm',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/auth/post',
      component: AuthPost,
      meta: {
        title: 'nav.postConfirm',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/auth/reply',
      component: AuthReply,
      meta: {
        title: 'nav.replyConfirm',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/auth/vote',
      component: AuthVote,
      meta: {
        title: 'nav.voteConfirm',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/auth/vote-bp',
      component: AuthVoteBp,
      meta: {
        title: 'nav.voteBpConfirm',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/auth/sign',
      component: AuthSign,
      meta: {
        title: 'nav.signMessage',
        headerType: HeaderTypes.title,
        requireAuth: true,
      },
    },
    {
      path: '/setting',
      component: Setting,
      meta: {
        title: 'nav.setting',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/setting/network',
      component: Network,
      meta: {
        title: 'nav.network',
        headerType: HeaderTypes.back,
        requireAuth: false,
      },
    },
    {
      path: '/setting/dapp-white-list',
      component: DappWhiteList,
      meta: {
        title: 'nav.dappWhiteList',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/setting/bp-vote',
      component: BpVote,
      meta: {
        title: 'nav.voteBp',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/setting/language',
      component: Language,
      meta: {
        title: 'nav.language',
        headerType: HeaderTypes.back,
        requireAuth: false,
      },
    },
    {
      path: '/setting/password',
      component: ChangePassword,
      meta: {
        title: 'nav.changePassword',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/setting/lock-time',
      component: LockTime,
      meta: {
        title: 'nav.lockTime',
        headerType: HeaderTypes.back,
        requireAuth: true,
      },
    },
    {
      path: '/setting/about-us',
      component: AboutUs,
      meta: {
        title: 'nav.aboutUs',
        headerType: HeaderTypes.back,
        requireAuth: false,
      },
    },
    { path: '*', redirect: '/' },
  ],
});
