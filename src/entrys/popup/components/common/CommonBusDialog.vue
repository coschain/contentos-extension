<template>
  <base-dialog @onClose="onClose">
    <div class="container">
      <div v-if="title" class="title">
        {{ title }}
      </div>
      <div class="container-inner">
        <div v-if="content" v-html="content" class="content"></div>
        <div v-if="inputFields && inputFields.length > 0" class="input-fields">
          <div v-for="(item, index) in inputFields" :key="index" class="form-item">
            <div v-if="item.type == 'privateKey'" class="item-textarea item-private-key">{{ item.value }}</div>
            <div v-else-if="item.type == 'radio'" class="item-radio">
              <label v-for="(sItem, sIndex) in item.values" :key="index + '_' + sIndex"
                ><input spellcheck="false" :type="item.type" v-model="inputDatas[item.name]" :value="sItem.value" :name="item.name" />{{ sItem.title || sItem.value }}</label
              >
            </div>
            <input spellcheck="false" v-else :type="item.type || 'text'" v-model="inputDatas[item.name]" :placeholder="item.placeholder" class="item-input" />
          </div>
        </div>
      </div>
      <div class="layout-box buttons">
        <a v-if="cancelText" @click="onCancel" class="box-col common-button" plain>{{ cancelText }}</a>
        <a v-if="clipboardData" v-clipboard="clipboardData" @success="onConfirm" class="box-col common-button">{{ confirmText || $t('common.copy') }}</a>
        <a v-else @click="onConfirm" class="box-col common-button">{{ confirmText || $t('common.ok') }}</a>
      </div>
    </div>
  </base-dialog>
</template>

<script>
import BaseDialog from './BaseDialog';

export default {
  data() {
    return {
      inputDatas: {},
    };
  },
  props: {
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    inputFields: {
      type: Array,
      default: null,
    },
    confirmText: {
      type: String,
      default: '',
    },
    cancelText: {
      type: String,
      default: '',
    },
    clipboardData: {
      type: String,
      default: '',
    },
  },
  components: {
    BaseDialog,
  },
  created() {
    this.changeInputDatas(this.inputFields);
    this.$watch('inputFields', this.changeInputDatas, {
      deep: true,
    });
  },
  methods: {
    changeInputDatas(fields) {
      const inputDatas = {};
      if (fields && fields.length > 0) {
        fields.forEach(item => {
          inputDatas[item.name] = item.value || '';
        });
      }
      this.inputDatas = inputDatas;
    },
    onClose() {
      this.$emit('onClose');
    },
    onCancel() {
      this.$emit('onCancel');
    },
    onConfirm() {
      this.$emit('onConfirm', this.inputDatas);
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  width: 86vw;
  max-width: 17.2rem;
  padding: 1.2rem 0.8rem;
  box-sizing: border-box;
  background: #fff;
  border-radius: 0.6rem;
  .title {
    font-size: 0.84rem;
    color: @black-color;
    text-align: center;
    font-weight: bold;
  }
  .container-inner {
    max-height: 50vh;
    overflow: auto;
  }
  .content {
    font-size: 0.74rem;
    margin: 0.8rem 0.2rem 0.6rem;
    word-break: break-word;
    color: @light-black-color;
    text-align: center;
  }
  .input-fields {
    margin: 0.8rem 0.4rem 0.6rem;
    .form-item {
      margin-bottom: 0.6rem;
      .item-input,
      .item-textarea {
        margin-top: 0.2rem;
        padding-right: 0.8rem;
      }
      .item-private-key {
        color: @red-color;
        border-color: #ddd;
        word-break: break-all;
      }
      .item-radio {
        height: 1.8rem;
        line-height: 1.8rem;
        label {
          margin-right: 1rem;
        }
        input {
          margin-right: 0.4rem;
        }
      }
    }
  }
  .buttons {
    padding-top: 0.6rem;
    .common-button {
      margin: 0 0.4rem;
    }
  }
}
</style>
