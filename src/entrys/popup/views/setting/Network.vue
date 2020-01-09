<template>
  <div class="network-page">
    <div class="common-list">
      <div v-for="(item, index) in $root.network.list" :key="index" :class="`common-list-item${index == $root.network.selected ? ' selected' : ''}`">
        <div class="list-item-title">
          {{ item.title }}
          <div class="space"></div>
          <a v-if="index != $root.network.selected" @click="changeNetwork(item.id)" class="icon icon-selection" v-tooltip="$t('common.setDefault')"></a>
          <a v-if="!item.canModify" class="icon icon-safety" v-tooltip="$t('network.secure')"></a>
          <a v-if="item.canModify" @click="modifyNetwork(item.id)" class="icon icon-modify" v-tooltip="$t('common.modify')"></a>
          <a v-if="item.canModify" @click="deleteNetwork(item.id)" class="icon icon-delete" v-tooltip="$t('common.delete')"></a>
        </div>
        <div class="list-item-content">Chain：{{ item.key }}</div>
        <div class="list-item-content">RPC：{{ item.url }}</div>
      </div>
      <div @click="addNetwork" class="common-list-item item-add">{{ $t('components.addNetwork') }}</div>
    </div>
  </div>
</template>
<script>
import { removeNetworkById, modifyNetwork, changeNetworkSelected, addNetwork } from '../../service/WalletApi';

export default {
  data() {
    return {
      flagAdd: false,
    };
  },
  methods: {
    async changeNetwork(id) {
      try {
        await changeNetworkSelected(id);
      } catch (ex) {
        this.toast(ex.message);
        return;
      }
      await this.getState();
    },
    showDialog(id) {
      let networkData = null;
      if (id) {
        const filterList = this.$root.network.list.filter(item => item.id === id);
        if (filterList.length > 0) {
          [networkData] = filterList;
        }
      }
      this.flagAdd = !networkData;
      networkData = networkData || {};
      this.$root.dialogData = {
        title: this.$t(this.flagAdd ? 'components.addNetwork' : 'components.modifyNetwork'),
        cancelText: this.$t('common.cancel'),
        confirmText: this.$t('common.confirm'),
        inputFields: [
          {
            type: 'input',
            placeholder: this.$t('network.type'),
            name: 'key',
            value: networkData.key || '',
          },
          {
            type: 'input',
            placeholder: this.$t('network.title'),
            name: 'title',
            value: networkData.title || '',
          },
          {
            type: 'input',
            placeholder: this.$t('network.rpcAddress'),
            name: 'url',
            value: networkData.url || '',
          },
        ],
        onConfirm: data => this.onConfirm(data, id),
      };
    },
    onConfirm(submitData, id) {
      const { key } = submitData;
      const title = (submitData.title || '').trim();
      const url = (submitData.url || '').trim();
      let result = true;
      if (!title) {
        this.toast(this.$t('network.titleTips'));
        result = false;
      } else if (!url) {
        this.toast(this.$t('network.rpcTips'));
        result = false;
      } else if (
        (this.flagAdd && this.$root.network.list.findIndex(item => item.title === title) >= 0) ||
        (!this.flagAdd && this.$root.network.list.filter(item => item.title === title && item.id !== id).length >= 1)
      ) {
        this.toast(this.$t('network.duplication'));
        result = false;
      }
      return new Promise(async resolve => {
        if (!result) {
          resolve(result);
        } else {
          if (this.flagAdd) {
            try {
              await addNetwork({ title, key, url });
            } catch (ex) {
              result = false;
              this.toast(ex.message);
            }
          } else {
            try {
              await modifyNetwork({ id, title, key, url });
            } catch (ex) {
              result = false;
              this.toast(ex.message);
            }
          }
          if (result) {
            this.getState();
          }
          resolve(result);
        }
      });
    },
    modifyNetwork(id) {
      this.showDialog(id);
    },
    addNetwork() {
      this.showDialog();
    },
    async deleteNetwork(id) {
      try {
        await removeNetworkById(id);
      } catch (ex) {
        this.toast(ex.message);
        return;
      }
      this.getState();
    },
  },
};
</script>

<style lang="less" scoped>
.network-page {
  padding: 0.8rem;
  .icon-selection {
    background-image: url('../../assets/images/icon/icon-selection.png');
  }
  .icon-modify {
    background-image: url('../../assets/images/icon/icon-modify.png');
  }
  .icon-delete {
    background-image: url('../../assets/images/icon/icon-delete.png');
  }
  .icon-safety {
    background-image: url('../../assets/images/icon/icon-safety-green.png');
    cursor: default;
  }
  .common-list-item {
    padding: 0.2rem 1rem 0.8rem;
    .list-item-content {
      word-break: break-all;
    }
    &.selected {
      .icon-selection {
        background-image: url('../../assets/images/icon/icon-selection.png');
      }
      .icon-safety {
        background-image: url('../../assets/images/icon/icon-safety-white.png');
      }
      .icon-modify {
        background-image: url('../../assets/images/icon/icon-modify-white.png');
      }
      .icon-delete {
        background-image: url('../../assets/images/icon/icon-delete-white.png');
      }
    }
  }
  .item-add {
    padding: 0.65rem 0;
    text-align: center;
    color: @primary-color;
    cursor: pointer;
    &:hover {
      box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
