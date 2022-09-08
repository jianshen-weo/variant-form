<!--
 * @Descripttion: 选项字典属性编辑器
 * @version: 
 * @Author: lilm
 * @Date: 2022-09-06 20:14:26
 * @LastEditors: lilm
 * @LastEditTime: 2022-09-07 10:31:45
-->
<template>
  <div class="option-dict-setting-pane">
    <el-select v-model="value" filterable placeholder="请选择数据字典" style="width: 100%" @change="handleChange">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
    </el-select>
    <template v-if="value">
      <div>
        <span>默认值</span> <el-divider direction="vertical"></el-divider>
        <el-button type="text" @click="resetDefault">清空默认值</el-button>
      </div>
      <el-radio-group
        v-if="selectedWidget.type === 'radio'"
        v-model="optionModel.defaultValue"
        @change="emitDefaultValueChange"
      >
        <el-radio :label="option.value" v-for="(option, idx) in optionModel.optionItems" :key="idx">
          {{ option.label }}
        </el-radio>
      </el-radio-group>
      <el-checkbox-group
        v-else-if="selectedWidget.type === 'checkbox'"
        v-model="optionModel.defaultValue"
        @change="emitDefaultValueChange"
      >
        <el-checkbox :label="option.value" v-for="(option, idx) in optionModel.optionItems" :key="idx">
          {{ option.label }}
        </el-checkbox>
      </el-checkbox-group>
      <el-select
        v-else-if="selectedWidget.type === 'select'"
        v-model="optionModel.defaultValue"
        :multiple="selectedWidget.options.multiple"
        @change="emitDefaultValueChange"
        style="width: 100%"
      >
        <el-option
          :value="option.value"
          :label="option.label"
          v-for="(option, idx) in optionModel.optionItems"
          :key="idx"
        >
        </el-option>
      </el-select>
    </template>
  </div>
</template>
<script>
export default {
  name: 'OptionDictSetting',
  props: {
    designer: Object,
    selectedWidget: Object,
  },
  data() {
    return {
      options: [
        {
          value: 'wz_cc_type',
          label: '物资类型（wz_cc_type）',
        },
        {
          value: 'msg_category',
          label: '通告类型（msg_category）',
        },
      ],
      value: '',
    };
  },
  computed: {
    optionModel() {
      return this.selectedWidget.options;
    },
  },
  created() {
    this.value = this.optionModel.optionDict;
    this.setDictOptions(this.value);
  },
  methods: {
    emitDefaultValueChange() {
      if (!!this.designer && !!this.designer.formWidget) {
        let fieldWidget = this.designer.formWidget.getWidgetRef(this.selectedWidget.options.name);
        if (!!fieldWidget && !!fieldWidget.refreshDefaultValue) {
          fieldWidget.refreshDefaultValue();
        }
      }
    },
    resetDefault() {
      if (
        this.selectedWidget.type === 'checkbox' ||
        (this.selectedWidget.type === 'select' && this.selectedWidget.options.multiple)
      ) {
        this.optionModel.defaultValue = [];
      } else {
        this.optionModel.defaultValue = '';
      }

      this.emitDefaultValueChange();
    },
    setDictOptions(dictValue) {
      if (!dictValue) return;
      const dict = {
        wz_cc_type: [
          { label: '衣服', value: 'yf' },
          { label: '纸巾', value: 'zj' },
        ],
        msg_category: [
          { label: '通知公告', value: 'tz' },
          { label: '系统消息', value: 'xx' },
        ],
      };
      this.optionModel.optionItems = dict[dictValue];
    },
    handleChange(val) {
      this.setDictOptions(val);
      this.optionModel.optionDict = val;
    },
  },
};
</script>
<style lang="scss" scoped></style>
