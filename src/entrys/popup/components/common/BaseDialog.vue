<template>
  <div class="canvas">
    <div class="canvas-inner">
      <slot></slot>
    </div>
    <a v-if="!hideClose" @click="onClose" class="close"></a>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    hideClose: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClose() {
      this.$emit('onClose');
    },
  },
};
</script>

<style lang="less" scoped>
.canvas {
  min-height: 100%;
  min-width: 100%;
  top: 0;
  left: 0;
  z-index: 12;
  position: fixed;
  background: rgba(0, 0, 0, 0.7);
  .canvas-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-60%);
  }
  .close {
    position: absolute;
    left: 50%;
    bottom: 10vh;
    width: 2.6rem;
    height: 2.6rem;
    transform: translateX(-50%) translateY(0);
    background-image: url('../../assets/images/icon/icon-cancel-white.png');
    background-size: 72%;
    background-position: center;
    background-repeat: no-repeat;
  }
}
</style>
