/*
 * @Descripttion:
 * @version:
 * @Author: lilm
 * @Date: 2022-09-05 10:02:35
 * @LastEditors: lilm
 * @LastEditTime: 2022-09-06 14:36:11
 */
import { buildClassAttr, buildContainerWidget, buildFieldWidget } from '@/utils/sfc-generator';

export const cardTemplateGenerator = function (cw, formConfig) {
  const wop = cw.options;
  //const headerAttr = `header="${wop.label}"`
  const classAttr = buildClassAttr(cw);
  const styleAttr = !!wop.cardWidth ? `style="{width: ${wop.cardWidth} !important}"` : '';
  const shadowAttr = `shadow="${wop.shadow}"`;
  const vShowAttr = !!wop.hidden ? `v-show="false"` : '';

  const cardTemplate = `<div class="card-container">
  <el-card ${classAttr} ${styleAttr} ${shadowAttr} ${vShowAttr}>
    <div slot="header" class="clear-fix">
      <span>${wop.label}</span>
      ${!!wop.showFold ? `<i class="float-right el-icon-arrow-down"></i>` : ''}
    </div>
    ${cw.widgetList
      .map((wItem) => {
        if (wItem.category === 'container') {
          return buildContainerWidget(wItem, formConfig);
        } else {
          return buildFieldWidget(wItem, formConfig);
        }
      })
      .join('')}
  </el-card>
</div>`;

  return cardTemplate;
};

export const alertTemplateGenerator = function (fw, formConfig) {
  const wop = fw.options;
  const titleAttr = `title="${wop.title}"`;
  const typeAttr = `type=${wop.type}`;
  const descriptionAttr = !!wop.description ? `description="${wop.description}"` : '';
  const closableAttr = `:closable="${wop.closable}"`;
  const closeTextAttr = !!wop.closeText ? `close-text="${wop.closeText}"` : '';
  const centerAttr = `:center="${wop.center}"`;
  const showIconAttr = `:show-icon="${wop.showIcon}"`;
  const effectAttr = `effect="${wop.effect}"`;

  const alertTemplate = `<el-alert ${titleAttr} ${typeAttr} ${descriptionAttr} ${closableAttr} ${closeTextAttr} ${centerAttr} 
  ${showIconAttr} ${effectAttr}>
</el-alert>`;

  return alertTemplate;
};

export const linkTemplateGenerator = function (fw, formConfig) {
  const wop = fw.options;
  const typeAttr = `type=${wop.type}`;
  const underlineAttr = !!wop.underline ? `underline="${wop.underline}"` : '';
  const disabledAttr = `:disabled="${wop.disabled}"`;
  const hrefAttr = !!wop.href ? `href="${wop.href}"` : '';
  const iconAttr = `icon="${wop.icon}"`;
  const targetAttr = `target="${wop.target}"`;

  const linkTemplate = `<el-link ${typeAttr} ${underlineAttr} ${disabledAttr} ${hrefAttr} ${iconAttr} ${targetAttr}>${wop.title}
</el-link>`;

  return linkTemplate;
};
