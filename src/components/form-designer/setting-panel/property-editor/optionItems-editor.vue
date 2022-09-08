<!--
 * @Descripttion: 
 * @version: 
 * @Author: lilm
 * @Date: 2022-09-05 10:02:35
 * @LastEditors: lilm
 * @LastEditTime: 2022-09-07 10:11:51
-->
<template>
  <el-form-item label-width="0" class="optionItems-editor">
    <el-divider class="custom-divider-margin-top">{{ i18nt('designer.setting.optionsSetting') }}</el-divider>
    <option-source-type-setting :designer="designer" :selected-widget="selectedWidget"></option-source-type-setting>
    <option-items-setting
      :designer="designer"
      :selected-widget="selectedWidget"
      v-if="optionModel.optionSourceType === '1'"
    ></option-items-setting>
    <option-dict-setting
      :designer="designer"
      :selected-widget="selectedWidget"
      v-else-if="optionModel.optionSourceType === '2'"
    ></option-dict-setting>
  </el-form-item>
</template>

<script>
import i18n from '@/utils/i18n';
import OptionSourceTypeSetting from '@/components/form-designer/setting-panel/option-source-type-setting';
import OptionItemsSetting from '@/components/form-designer/setting-panel/option-items-setting';
import OptionDictSetting from '@/components/form-designer/setting-panel/option-dict-setting';

export default {
  name: 'optionItems-editor',
  mixins: [i18n],
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  components: {
    OptionSourceTypeSetting,
    OptionItemsSetting,
    OptionDictSetting,
  },
};
</script>

<style scoped>
.optionItems-editor {
  margin-bottom: 15px !important;
}
</style>
