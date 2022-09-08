<!--
 * @Descripttion: 
 * @version: 
 * @Author: lilm
 * @Date: 2022-09-07 15:36:18
 * @LastEditors: lilm
 * @LastEditTime: 2022-09-08 16:07:59
-->
<template>
  <container-wrapper
    :designer="designer"
    :widget="widget"
    :parent-widget="parentWidget"
    :parent-list="parentList"
    :index-of-parent-list="indexOfParentList"
  >
    <div
      class="sub-form-container"
      :key="widget.id"
      @click.stop="selectWidget(widget)"
      :class="[selected ? 'selected' : '']"
    >
      <div class="clear-fix">
        <span>{{ widget.options.label }}</span>
      </div>
      <draggable
        :list="widget.widgetList"
        v-bind="{ group: 'dragGroup', ghostClass: 'ghost', animation: 200 }"
        handle=".drag-handler"
        @add="(evt) => onContainerDragAdd(evt, widget.widgetList)"
        @update="onContainerDragUpdate"
        :move="checkContainerMove"
      >
        <transition-group name="fade" tag="div" class="form-widget-list">
          <template v-for="(subWidget, swIdx) in widget.widgetList">
            <component
              :is="subWidget.type + '-widget'"
              :field="subWidget"
              :designer="designer"
              :key="subWidget.id"
              :parent-list="widget.widgetList"
              :index-of-parent-list="swIdx"
              :parent-widget="widget"
              :design-state="true"
            ></component>
          </template>
        </transition-group>
      </draggable>
    </div>
  </container-wrapper>
</template>

<script>
import i18n from '@/utils/i18n';
import containerMixin from '@/components/form-designer/form-widget/container-widget/containerMixin';
import Draggable from 'vuedraggable';
import ContainerWrapper from '@/components/form-designer/form-widget/container-widget/container-wrapper';
import FieldComponents from '@/components/form-designer/form-widget/field-widget/index';
import refMixinDesign from '@/components/form-designer/refMixinDesign';

export default {
  name: 'sub-form-widget',
  componentName: 'ContainerWidget',
  mixins: [i18n, containerMixin, refMixinDesign],
  inject: ['refList'],
  components: {
    Draggable,
    ContainerWrapper,
    ...FieldComponents,
  },
  props: {
    widget: Object,
    parentWidget: Object,
    parentList: Array,
    indexOfParentList: Number,
    designer: Object,
  },
  computed: {
    selected() {
      return this.widget.id === this.designer.selectedId;
    },

    customClass() {
      return this.widget.options.customClass || '';
    },
  },
  created() {
    this.initRefList();
  },
  methods: {
    /**
     * 检查接收哪些组件拖放，如不接受某些组件拖放，则根据组件类型判断后返回false
     * @param evt
     * @returns {boolean}
     */
    checkContainerMove(evt) {
      console.log('🚀 ~ file: sub-form-widget.vue ~ line 97 ~ checkContainerMove ~ evt', evt);
      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
.sub-form-container.selected {
  outline: 2px solid $--color-primary !important;
}

.sub-form-container {
  padding: 8px;
  border: 1px dashed #369;

  .form-widget-list {
    min-height: 80px;
  }
}

.clear-fix:before,
.clear-fix:after {
  display: table;
  content: '';
}

.clear-fix:after {
  clear: both;
}

.float-right {
  float: right;
}
</style>
