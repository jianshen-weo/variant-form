<!--
 * @Descripttion: 
 * @version: 
 * @Author: lilm
 * @Date: 2022-09-06 19:24:33
 * @LastEditors: lilm
 * @LastEditTime: 2022-09-07 10:57:23
-->
<template>
  <div class="option-source-type-pane" v-if="selectedWidget.type !== 'cascader'">
    <el-radio-group size="small" v-model="val" @change="handleChange">
      <el-radio-button label="1">静态数据</el-radio-button>
      <el-radio-button label="2">数据字典</el-radio-button>
      <!-- todo -->
      <!-- <el-radio-button label="3">远端数据</el-radio-button> -->
    </el-radio-group>
  </div>
</template>
<script>
export default {
  name: 'OptionSourceTypeSetting',
  props: {
    designer: Object,
    selectedWidget: Object,
  },
  data() {
    return {
      val: undefined,
      defaultOption: {
        1: [
          { label: 'option 1', value: 1 },
          { label: 'option 2', value: 2 },
          { label: 'option 3', value: 3 },
        ],
        2: [],
        3: [],
      },
    };
  },
  computed: {
    optionModel() {
      return this.selectedWidget.options;
    },
  },
  watch: {
    'selectedWidget.options': {
      deep: true,
      handler(val) {
        //console.log('888888', 'Options change!')
      },
    },
  },
  created() {
    this.val = this.optionModel.optionSourceType;
  },
  methods: {
    handleChange(val) {
      console.log(val, '----');
      let { optionSourceType, optionItems } = this.optionModel;
      this.defaultOption[optionSourceType] = optionItems;
      this.optionModel.optionSourceType = val;
      this.optionModel.optionItems = [...this.defaultOption[val]];
    },
  },
};
</script>
<style lang="scss" scoped>
.option-source-type-pane {
  padding: 10px 0;
}
</style>
