import Cos from '@coschain/cosjs';
import { uuid } from 'uuidv4';
import { encrypt, decrypt } from 'browser-passworder';
import StorageApi from '../storage/StorageApi';
import UnPackedCosApi from './UnPackedCosApi';
import CustomError from '../../../error/CustomError';

const state = {
  cos: null,
  wallet: null,
  walletBlob: null,
  password: undefined,
  network: null,
  lockTime: undefined,
  lockedTimestamp: undefined,
};

async function decryptWallet(password, blob) {
  let wallet = null;
  try {
    wallet = await decrypt(password, blob);
  } catch (err) {
    throw err;
  }
  return wallet;
}

async function storeWallet(wallet, password) {
  if (!password) {
    throw new Error('password is empty!');
  }
  const blob = await encrypt(password, wallet);
  if (!blob) {
    throw new Error('Save account failed.');
  }
  await StorageApi.setWalletBlob(blob);
  state.wallet = wallet;
  state.password = password;
  state.walletBlob = blob;
  if (wallet.accounts && wallet.accounts.length > 0) {
    const { account, privateKey, network } = wallet.accounts[wallet.selected];
    // eslint-disable-next-line
    methods.addAccount({
      name: account,
      privateKey,
    });
    const { list, selected } = state.network;
    const currentNetwork = list[selected].key;
    if (network !== currentNetwork) {
      const filterNetwork = list.filter(item => item.key === network);
      const { id } = filterNetwork[0] || list[0];
      // eslint-disable-next-line
      await methods.changeNetworkSelected({ id });
    }
  } else {
    // eslint-disable-next-line
    methods.clearAccount();
  }
}

async function saveAccount(account, privateKey, publicKey, password) {
  const wallet = state.wallet || {
    accounts: [],
    selected: 0,
  };
  const network = state.network.list[state.network.selected].key;
  if (wallet.accounts.filter(item => item.account === account && item.network === network).length > 0) {
    throw new CustomError(10002, 'Duplication of account.');
  }
  const accounts = [
    ...wallet.accounts,
    {
      id: uuid(),
      account,
      privateKey,
      publicKey,
      network,
    },
  ];
  await storeWallet({ accounts, selected: accounts.length - 1 }, password);
}

function fixedCosInstanceNetwork({ key, url }) {
  const chainId = UnPackedCosApi.getCosInstanceChainId(key);
  state.cos.chainId = chainId;
  state.cos.provider = url;
}

const methods = {
  async initState() {
    state.walletBlob = await StorageApi.getWalletBlob();
    state.network = await StorageApi.getNetwork();
    state.lockTime = await StorageApi.getLockTime();
    state.lockedTimestamp = await StorageApi.getLockedTimestamp();
    const { list, selected } = state.network;
    const { key, url } = list[selected];
    state.cos = new Cos(key, url);
  },
  async getState() {
    if (!state.network) {
      await this.initState();
    }
    await this.operateAutoLocked();

    const { network, wallet, walletBlob } = state;
    let accounts = null;
    if (wallet) {
      accounts = wallet.accounts.map(item => {
        const filterNetwork = network.list.filter(networkItem => networkItem.key === item.network);
        const { title, key } = filterNetwork[0] || network.list[0];
        return {
          id: item.id,
          account: item.account,
          publicKey: item.publicKey,
          networkTitle: title,
          network: key,
        };
      });
    }
    return {
      walletCreated: !!walletBlob,
      locked: typeof state.password === 'undefined',
      network,
      wallet:
        accounts && accounts.length > 0
          ? {
              accounts,
              selected: wallet.selected,
            }
          : null,
    };
  },
  async getDefaultAccount() {
    const { network, wallet, walletCreated, locked } = await this.getState();
    return {
      locked,
      walletCreated,
      network: network.list[network.selected].key,
      account: wallet ? wallet.accounts[wallet.selected].account : '',
      publicKey: wallet ? wallet.accounts[wallet.selected].publicKey : '',
    };
  },
  async importNewAccount({ name, privateKey, mnemonic, password }) {
    if (!name) {
      throw new Error('name is required.');
    }
    if (name.length < 6 || name.length > 16) {
      throw new Error('name between 6 and 16 characters.');
    }
    if (!privateKey && !mnemonic) {
      throw new Error('privateKey or mnemonic is required.');
    }
    const { walletCreated } = await this.getState();
    if (!walletCreated) {
      if (!password) {
        throw new Error('password is required.');
      }
      if (password.length < 6 || password.length > 20) {
        throw new Error('password is invalid, between 6 and 20 characters.');
      }
    } else if (!state.password) {
      throw new Error('Wallet is locked.');
    }
    let publicKeyFromRpc = '';
    let publicKey = '';
    let generatePrivateKey = '';
    if (!privateKey) {
      try {
        [publicKey, generatePrivateKey] = state.cos.wallet.generateKeysFromMnemonic(mnemonic);
      } catch (ex) {
        throw ex;
      }
    } else {
      generatePrivateKey = privateKey;
      const priv = UnPackedCosApi.privKeyFromWIF(generatePrivateKey);
      if (priv) {
        publicKey = priv.pubKey().toWIF();
      }
      if (!publicKey) {
        throw new Error('Parse private key failed.');
      }
    }
    const accountInfo = await this.accountInfo({ name });
    if (accountInfo && accountInfo.info && accountInfo.info.publicKey) {
      publicKeyFromRpc = accountInfo.info.publicKey;
    }
    if (!publicKeyFromRpc || publicKey !== publicKeyFromRpc) {
      throw new Error('Account does not match with the mnemonic or privateKey.');
    }
    await saveAccount(name, generatePrivateKey, publicKey, !walletCreated ? password : state.password);
  },
  async createNewAccount({ name, privateKey, publicKey, password }) {
    if (!name) {
      throw new Error('name is required.');
    }
    if (name.length < 6 || name.length > 16) {
      throw new Error('name between 6 and 16 characters.');
    }
    if (!privateKey) {
      throw new Error('privateKey is required.');
    }
    if (!publicKey) {
      throw new Error('publicKey is required.');
    }
    const { walletCreated } = await this.getState();
    if (!walletCreated) {
      if (!password) {
        throw new Error('password is required.');
      }
      if (password.length < 6 || password.length > 20) {
        throw new Error('password is invalid, between 6 and 20 characters.');
      }
    } else if (!state.password) {
      throw new Error('Wallet is locked.');
    }
    await saveAccount(name, privateKey, publicKey, !walletCreated ? password : state.password);
  },
  async changeAccountSelected({ id }) {
    if (!id) {
      throw new Error('id is required.');
    }
    const { accounts } = state.wallet;
    const index = accounts.findIndex(item => item.id === id);
    if (index < 0) {
      throw new Error('No wallet found.');
    }
    await storeWallet({ accounts, selected: index }, state.password);
  },
  async removeAccountById({ id }) {
    if (!id) {
      throw new Error('id is required.');
    }
    const accounts = [...state.wallet.accounts];
    const selectedId = accounts[state.wallet.selected].id;
    const index = accounts.findIndex(item => item.id === id);
    if (index < 0) {
      throw new Error('No wallet found.');
    }
    accounts.splice(index, 1);
    await storeWallet(
      {
        accounts,
        selected: Math.max(
          accounts.findIndex(item => item.id === selectedId),
          0
        ),
      },
      state.password
    );
  },
  async getPrivateKeyById({ id, password }) {
    if (!id) {
      throw new Error('id is required.');
    }
    if (!password) {
      throw new Error('password is required.');
    }
    const valid = await this.validatePassword({ password });
    if (!valid) {
      throw new Error('password is invalid.');
    }
    const items = state.wallet.accounts.filter(item => item.id === id);
    if (items.length <= 0) {
      throw new Error('No wallet found.');
    }
    return items[0].privateKey;
  },
  setLang({ lang }) {
    return StorageApi.setLang(lang);
  },
  getLang() {
    return StorageApi.getLang();
  },

  /**
   * Operate lock time
   */
  async setLockTime({ time }) {
    await StorageApi.setLockTime(time);
    state.lockTime = time;
  },
  getLockTime() {
    return StorageApi.getLockTime();
  },
  async operateAutoLocked() {
    const { lockTime, lockedTimestamp } = state;
    if (!lockTime) {
      return false;
    }
    const timestamp = Math.floor(new Date().getTime() / 1000);
    if (!lockedTimestamp || lockTime + lockedTimestamp > timestamp) {
      await StorageApi.setLockedTimestamp(timestamp);
      state.lockedTimestamp = timestamp;
      return false;
    }
    // eslint-disable-next-line
    this.logout();
    return true;
  },
  /**
   * Operate wallet
   */
  async unlock({ password }) {
    if (!password) {
      throw new Error('password is required.');
    }
    const { walletBlob } = state;
    if (!walletBlob) {
      throw new Error('Wallet is not created yet.');
    }
    const wallet = await decryptWallet(password, walletBlob);
    state.password = password;
    state.wallet = wallet;
    const timestamp = Math.floor(new Date().getTime() / 1000);
    await StorageApi.setLockedTimestamp(timestamp);
    state.lockedTimestamp = timestamp;
    if (wallet.accounts && wallet.accounts.length > 0) {
      const { account, privateKey } = wallet.accounts[wallet.selected];
      this.addAccount({
        name: account,
        privateKey,
      });
    }
  },
  async validatePassword({ password }) {
    if (!password) {
      throw new Error('password is required.');
    }
    const { walletBlob } = state;
    if (!walletBlob) {
      throw new Error('Wallet is not created yet.');
    }
    const wallet = await decryptWallet(password, walletBlob);
    return !!wallet;
  },
  async changePassword({ password, newPassword }) {
    if (!password || !newPassword) {
      throw new Error('password and newPassword is required.');
    }
    const valid = await this.validatePassword({ password });
    if (!valid) {
      throw new Error('password is invalid.');
    }

    await storeWallet(state.wallet, newPassword);
    this.logout();
  },
  logout() {
    state.password = undefined;
    state.wallet = null;
    this.clearAccount();
  },

  /**
   * Operate network
   */
  async removeNetworkById({ id }) {
    if (!id) {
      throw new Error('Network id is required.');
    }
    const { list, selected } = state.network;
    const index = list.findIndex(item => item.id === id);
    if (index < 0) {
      throw new Error('No network found.');
    }
    const { canModify } = list[index];
    if (!canModify) {
      throw new Error('Default network cannot be deleted.');
    }
    const selectedId = list[selected].id;
    list.splice(index, 1);
    state.network = {
      list,
      selected: Math.max(
        list.findIndex(item => item.id === selectedId),
        0
      ),
    };
    await StorageApi.setNetwork(state.network);
    fixedCosInstanceNetwork(list[state.network.selected]);
  },
  async modifyNetwork({ network }) {
    if (!network || !network.title || !network.url) {
      throw new Error('Network title and url is required.');
    }

    const { list, selected } = state.network;
    const index = list.findIndex(item => item.id === network.id);
    if (index < 0) {
      throw new Error('No network found.');
    }

    const { canModify } = list[index];
    if (!canModify) {
      throw new Error('Default network cannot be deleted.');
    }

    const { id, title, url, key } = network;
    if (list.filter((item, sIndex) => item.title === title && sIndex !== index).length >= 1) {
      throw new Error('Duplication of network title.');
    }
    const { explorer, createAccountUrl } = list[key === 'test' ? 1 : 0];
    list[index] = { title, url, key, id, explorer, createAccountUrl, canModify: true };
    state.network = {
      list,
      selected,
    };
    await StorageApi.setNetwork(state.network);
    fixedCosInstanceNetwork(list[selected]);
  },
  async changeNetworkSelected({ id }) {
    if (!id) {
      throw new Error('Network id is required.');
    }
    const { list } = state.network;
    const index = list.findIndex(item => item.id === id);
    if (index < 0) {
      throw new Error('No network found.');
    }
    state.network.selected = index;
    await StorageApi.setNetwork(state.network);
    fixedCosInstanceNetwork(list[index]);
  },
  async addNetwork({ network }) {
    if (!network || !network.title || !network.url) {
      throw new Error('Network title and url is required.');
    }
    const { title, url, key } = network;
    const { list } = state.network;
    if (list.findIndex(item => item.title === title) >= 0) {
      throw new Error('Duplication of network title.');
    }
    const { explorer, createAccountUrl } = list[key === 'test' ? 1 : 0];
    list.push({ id: uuid(), title, url, key: key || 'main', explorer, createAccountUrl, canModify: true });
    await StorageApi.setNetwork(state.network);
  },

  /**
   * Operate Dapp white list
   */
  getDappWhiteList() {
    return StorageApi.getDappWhiteList();
  },
  async isInDappWhiteList({ domain, contract }) {
    const { network, account } = await this.getDefaultAccount();
    const list = await this.getDappWhiteList();
    const filterList = list.filter(item => domain === item.domain && contract === item.contract && network === item.network && account === item.account);
    return filterList.length > 0;
  },
  async addDappWhiteList({ domain, contract, method }) {
    if (!domain || !contract) {
      return;
    }
    const { network, account } = await this.getDefaultAccount();
    const list = await this.getDappWhiteList();
    list.unshift({
      account,
      domain,
      contract,
      method,
      network,
      id: uuid(),
    });
    await StorageApi.setDappWhiteList(list);
  },
  async removeDappWhiteListById({ id }) {
    if (!id) {
      throw new Error('id is required.');
    }
    const list = await this.getDappWhiteList();
    await StorageApi.setDappWhiteList(list.filter(item => item.id !== id));
  },

  /**
   * Some API method in Cosjs SDK
   */
  addAccount({ name, privateKey }) {
    this.clearAccount();
    return state.cos.wallet.addAccount(name, privateKey);
  },
  clearAccount() {
    if (state.cos && state.cos.wallet) {
      state.cos.wallet.accounts = new Map();
    }
  },
  generateKeysFromMnemonic({ words }) {
    return state.cos.wallet.generateKeysFromMnemonic(words);
  },
  generateKeysWithMonemonic() {
    return state.cos.wallet.generateKeysWithMonemonic();
  },
  accountInfo({ name }) {
    return state.cos.wallet.accountInfo(name);
  },
  bpInfo({ bp }) {
    return state.cos.wallet.bpInfo(bp);
  },
  transactionInfo({ trxId }) {
    return state.cos.wallet.transactionInfo(trxId);
  },
  chainInfo() {
    return state.cos.wallet.chainInfo();
  },
  blockProducerList({ start, limit, lastBlockProducer }) {
    return state.cos.wallet.blockProducerList(start, limit, lastBlockProducer);
  },
  createAccount({ creator, newAccount, pubkey }) {
    return state.cos.wallet.createAccount(creator, newAccount, pubkey);
  },
  async transfer({ sender, receiver, amount, memo }) {
    return state.cos.wallet.transfer(sender, receiver, amount, memo);
  },
  cosToVest({ account, amount }) {
    return state.cos.wallet.cosToVest(account, amount);
  },
  vestToCos({ account, amount }) {
    return state.cos.wallet.vestToCos(account, amount);
  },
  cosToStake({ account, amount, toAccount }) {
    return state.cos.wallet.cosToStake(account, amount, toAccount);
  },
  stakeToCos({ account, amount, toAccount }) {
    return state.cos.wallet.stakeToCos(account, amount, toAccount);
  },
  post({ sender, title, content, tagsStr }) {
    return state.cos.wallet.post(sender, title, content, tagsStr);
  },
  // eslint-disable-next-line
  reply({ sender, parent_uuid, content }) {
    // eslint-disable-next-line
    return state.cos.wallet.reply(sender, parent_uuid, content);
  },
  vote({ sender, idx }) {
    return state.cos.wallet.vote(sender, idx);
  },
  contractCall({ caller, owner, contract, method, args, payment }) {
    return state.cos.wallet.contractCall(caller, owner, contract, method, args, payment);
  },
  voteToBlockProducer({ voterValue, bpValue, cancel }) {
    return state.cos.wallet.voteToBlockProducer(voterValue, bpValue, cancel);
  },
  queryTable({ owner, contract, table, field, begin, limit, reverse }) {
    return state.cos.wallet.queryTable(owner, contract, table, field, begin, limit, reverse);
  },
  userTrxList({ name, limit }) {
    return UnPackedCosApi.userTrxList({
      name,
      limit,
      provider: state.cos.provider,
      cosInstance: state.cos,
    });
  },
  signMessage({ account, message }) {
    const privateKey = state.cos.wallet.accounts[account];
    if (!privateKey) {
      throw new Error(`Unknown account ${account}`);
    }
    const signature = UnPackedCosApi.signMessage(message, privateKey);
    return { signature, message };
  },
  delegateVest({ sender, receiver, amount, duration }) {
    return state.cos.wallet.delegateVest(sender, receiver, amount, duration);
  },
  unDelegateVest({ sender, orderId }) {
    return state.cos.wallet.unDelegateVest(sender, orderId);
  },
  vestDelegationOrders({ name, isLender }) {
    return state.cos.wallet.vestDelegationOrderList(name, 100, isLender);
  },
};

// init state
methods.initState();

export default {
  handleMessage(action, data) {
    if (typeof methods[action] !== 'function') {
      return Promise.reject(new Error(`Unknown action ${action}`));
    }
    let result = null;
    try {
      result = methods[action](data);
      if (result && typeof result.then === 'function') {
        return result;
      }
      return Promise.resolve(result);
    } catch (ex) {
      return Promise.reject(ex);
    }
  },
};
