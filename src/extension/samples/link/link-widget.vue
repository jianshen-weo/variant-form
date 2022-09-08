<!--
 * @Descripttion: 
 * @version: 
 * @Author: lilm
 * @Date: 2022-09-06 10:41:31
 * @LastEditors: lilm
 * @LastEditTime: 2022-09-06 14:36:37
-->
<template>
  <static-content-wrapper
    :designer="designer"
    :field="field"
    :design-state="designState"
    :parent-widget="parentWidget"
    :parent-list="parentList"
    :index-of-parent-list="indexOfParentList"
    :sub-form-row-index="subFormRowIndex"
    :sub-form-col-index="subFormColIndex"
    :sub-form-row-id="subFormRowId"
  >
    <el-link
      ref="fieldEditor"
      :type="field.options.type"
      :underline="field.options.underline"
      :disabled="field.options.disabled"
      :href="field.options.href"
      :icon="field.options.icon"
      :target="field.options.target"
      @click="handleClickCustomEvent"
    >
      {{ field.options.title }}
    </el-link>
  </static-content-wrapper>
</template>

<script>
import StaticContentWrapper from '@/components/form-designer/form-widget/field-widget/static-content-wrapper';
import emitter from '@/utils/emitter';
import i18n from '@/utils/i18n';
import fieldMixin from '@/components/form-designer/form-widget/field-widget/fieldMixin';

export default {
  name: 'link-widget',
  componentName: 'FieldWidget', //必须固定为FieldWidget，用于接收父级组件的broadcast事件
  mixins: [emitter, fieldMixin, i18n],
  props: {
    field: Object,
    parentWidget: Object,
    parentList: Array,
    indexOfParentList: Number,
    designer: Object,

    designState: {
      type: Boolean,
      default: false,
    },

    subFormRowIndex: {
      /* 子表单组件行索引，从0开始计数 */ type: Number,
      default: -1,
    },
    subFormColIndex: {
      /* 子表单组件列索引，从0开始计数 */ type: Number,
      default: -1,
    },
    subFormRowId: {
      /* 子表单组件行Id，唯一id且不可变 */ type: String,
      default: '',
    },
  },
  components: {
    StaticContentWrapper,
  },
  created() {
    this.registerToRefList();
    this.initEventHandler();
  },
  beforeDestroy() {
    this.unregisterFromRefList();
  },
  methods: {
    handleClickCustomEvent() {
      if (!!this.field.options.onClick) {
        let changeFn = new Function(this.field.options.onClick);
        changeFn.call(this);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
