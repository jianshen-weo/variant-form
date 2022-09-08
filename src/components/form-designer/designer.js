/**
 * author: vformAdmin
 * email: vdpadmin@163.com
 * website: https://www.vform666.com
 * date: 2021.08.18
 * remark: 如果要分发VForm源码，需在本文件顶部保留此文件头信息！！
 */

import { deepClone, generateId, getDefaultFormConfig, overwriteObj } from '@/utils/util';
import {
  containers,
  advancedFields,
  basicFields,
  customFields,
} from '@/components/form-designer/widget-panel/widgetsConfig.js';
import { VARIANT_FORM_VERSION } from '@/utils/config';

export function createDesigner(vueInstance) {
  let defaultFormConfig = deepClone(getDefaultFormConfig());

  return {
    widgetList: [],
    formConfig: { cssCode: '' },

    selectedId: null,
    selectedWidget: null,
    selectedWidgetName: null, //选中组件名称（唯一）
    vueInstance: vueInstance,

    formWidget: null, //表单设计容器

    cssClassList: [], //自定义样式列表

    historyData: {
      index: -1, //index: 0,
      maxStep: 20,
      steps: [],
    },

    initDesigner(resetFormJson) {
      this.widgetList = [];
      this.formConfig = deepClone(defaultFormConfig);

      //输出版本信息和语雀链接
      console.info(
        `%cVariantForm %cVer${VARIANT_FORM_VERSION} %chttps://www.yuque.com/visualdev/vform`,
        'color:#409EFF;font-size: 22px;font-weight:bolder',
        'color:#999;font-size: 12px',
        'color:#333'
      );

      if (!resetFormJson) {
        this.initHistoryData();
      }
    },

    clearDesigner(skipHistoryChange) {
      let emptyWidgetListFlag = this.widgetList.length === 0;
      this.widgetList = [];
      this.selectedId = null;
      this.selectedWidgetName = null;
      this.selectedWidget = {}; //this.selectedWidget = null
      overwriteObj(this.formConfig, defaultFormConfig); //

      if (!!skipHistoryChange) {
        //什么也不做！！
      } else if (!emptyWidgetListFlag) {
        this.emitHistoryChange();
      } else {
        this.saveCurrentHistoryStep();
      }
    },

    loadPresetCssCode(preCssCode) {
      if (this.formConfig.cssCode === '' && !!preCssCode) {
        this.formConfig.cssCode = preCssCode;
      }
    },

    getLayoutType() {
      return this.formConfig.layoutType || 'PC';
    },

    changeLayoutType(newType) {
      this.formConfig.layoutType = newType;
    },

    getImportTemplate() {
      return {
        widgetList: [],
        // formConfig: deepClone(this.formConfig)
        formConfig: deepClone(defaultFormConfig),
      };
    },

    loadFormJson(formJson) {
      let modifiedFlag = false;

      if (!!formJson && !!formJson.widgetList) {
        this.widgetList = formJson.widgetList;
        modifiedFlag = true;
      }
      if (!!formJson && !!formJson.formConfig) {
        //this.formConfig = importObj.formConfig
        overwriteObj(
          this.formConfig,
          formJson.formConfig
        ); /* 用=赋值，会导致inject依赖注入的formConfig属性变成非响应式 */
        modifiedFlag = true;
      }

      if (modifiedFlag) {
        this.emitEvent('form-json-imported', []); // 通知其他组件
      }

      return modifiedFlag;
    },

    setSelected(selected) {
      console.log('🚀 ~ file: designer.js ~ line 111 ~ setSelected ~ selected', selected);

      if (!selected) {
        this.clearSelected();
        return;
      }

      this.selectedWidget = selected;
      if (!!selected.id) {
        this.selectedId = selected.id;
        this.selectedWidgetName = selected.options.name;
      }
    },

    updateSelectedWidgetNameAndLabel(selectedWidget, newName, newLabel) {
      this.selectedWidgetName = newName;
      //selectedWidget.options.name = newName  //此行多余
      if (!!newLabel && Object.keys(selectedWidget.options).indexOf('label') > -1) {
        selectedWidget.options.label = newLabel;
      }
    },

    clearSelected() {
      this.selectedId = null;
      this.selectedWidgetName = null;
      this.selectedWidget = {}; //this.selectedWidget = null
    },

    checkWidgetMove(evt) {
      /* Only field widget can be dragged into sub-form */
      if (!!evt.draggedContext && !!evt.draggedContext.element) {
        let wgCategory = evt.draggedContext.element.category;
        let wgType = evt.draggedContext.element.type;
        if (!!evt.to) {
          if (evt.to.className === 'sub-form-table' && wgCategory === 'container') {
            //this.$message.info(this.vueInstance.i18nt('designer.hint.onlyFieldWidgetAcceptable'))
            return false;
          }
        }
      }

      return true;
    },

    checkFieldMove(evt) {
      if (!!evt.draggedContext && !!evt.draggedContext.element) {
        let wgCategory = evt.draggedContext.element.category;
        let wgType = evt.draggedContext.element.type + '';
        //console.log('wgType======', wgType)
        if (!!evt.to) {
          if (evt.to.className === 'sub-form-table' && wgType === 'slot') {
            //this.$message.info(this.vueInstance.i18nt('designer.hint.onlyFieldWidgetAcceptable'))
            return false;
          }
        }
      }

      return true;
    },

    /**
     * 追加表格新行
     * @param widget
     */
    appendTableRow(widget) {
      let rowIdx = widget.rows.length; //确定插入行位置
      let newRow = deepClone(widget.rows[widget.rows.length - 1]);
      newRow.id = 'table-row-' + generateId();
      newRow.merged = false;
      newRow.cols.forEach((col) => {
        col.id = 'table-cell-' + generateId();
        col.options.name = col.id;
        col.merged = false;
        col.options.colspan = 1;
        col.options.rowspan = 1;
        col.widgetList.length = 0;
      });
      widget.rows.splice(rowIdx, 0, newRow);

      this.emitHistoryChange();
    },

    /**
     * 追加表格新列
     * @param widget
     */
    appendTableCol(widget) {
      let colIdx = widget.rows[0].cols.length; //确定插入列位置
      widget.rows.forEach((row) => {
        let newCol = deepClone(this.getContainerByType('table-cell'));
        newCol.id = 'table-cell-' + generateId();
        newCol.options.name = newCol.id;
        newCol.merged = false;
        newCol.options.colspan = 1;
        newCol.options.rowspan = 1;
        newCol.widgetList.length = 0;
        row.cols.splice(colIdx, 0, newCol);
      });

      this.emitHistoryChange();
    },

    insertTableRow(widget, insertPos, cloneRowIdx, curCol, aboveFlag) {
      let newRowIdx = !!aboveFlag ? insertPos : insertPos + 1; //初步确定插入行位置
      if (!aboveFlag) {
        //继续向下寻找同列第一个未被合并的单元格
        let tmpRowIdx = newRowIdx;
        let rowFoundFlag = false;
        while (tmpRowIdx < widget.rows.length) {
          if (!widget.rows[tmpRowIdx].cols[curCol].merged) {
            newRowIdx = tmpRowIdx;
            rowFoundFlag = true;
            break;
          } else {
            tmpRowIdx++;
          }
        }

        if (!rowFoundFlag) {
          newRowIdx = widget.rows.length;
        }
      }

      let newRow = deepClone(widget.rows[cloneRowIdx]);
      newRow.id = 'table-row-' + generateId();
      newRow.merged = false;
      newRow.cols.forEach((col) => {
        col.id = 'table-cell-' + generateId();
        col.options.name = col.id;
        col.merged = false;
        col.options.colspan = 1;
        col.options.rowspan = 1;
        col.widgetList.length = 0;
      });
      widget.rows.splice(newRowIdx, 0, newRow);

      let colNo = 0;
      while (newRowIdx < widget.rows.length - 1 && colNo < widget.rows[0].cols.length) {
        //越界判断
        const cellOfNextRow = widget.rows[newRowIdx + 1].cols[colNo];
        const rowMerged = cellOfNextRow.merged; //确定插入位置下一行的单元格是否为合并单元格
        if (!!rowMerged) {
          let rowArray = widget.rows;
          let unMergedCell = {};
          let startRowIndex = null;
          for (let i = newRowIdx; i >= 0; i--) {
            //查找该行已合并的主单元格
            if (!rowArray[i].cols[colNo].merged && rowArray[i].cols[colNo].options.rowspan > 1) {
              startRowIndex = i;
              unMergedCell = rowArray[i].cols[colNo];
              break;
            }
          }

          if (!!unMergedCell.options) {
            //如果有符合条件的unMergedCell
            let newRowspan = unMergedCell.options.rowspan + 1;
            this.setPropsOfMergedRows(widget.rows, startRowIndex, colNo, unMergedCell.options.colspan, newRowspan);
            colNo += unMergedCell.options.colspan;
          } else {
            colNo += 1;
          }
        } else {
          //colNo += 1
          colNo += cellOfNextRow.options.colspan || 1;
        }
      }

      this.emitHistoryChange();
    },

    insertTableCol(widget, insertPos, curRow, leftFlag) {
      let newColIdx = !!leftFlag ? insertPos : insertPos + 1; //初步确定插入列位置
      if (!leftFlag) {
        //继续向右寻找同行第一个未被合并的单元格
        let tmpColIdx = newColIdx;
        let colFoundFlag = false;
        while (tmpColIdx < widget.rows[curRow].cols.length) {
          if (!widget.rows[curRow].cols[tmpColIdx].merged) {
            newColIdx = tmpColIdx;
            colFoundFlag = true;
            break;
          } else {
            tmpColIdx++;
          }

          if (!colFoundFlag) {
            newColIdx = widget.rows[curRow].cols.length;
          }
        }
      }

      widget.rows.forEach((row) => {
        let newCol = deepClone(this.getContainerByType('table-cell'));
        newCol.id = 'table-cell-' + generateId();
        newCol.options.name = newCol.id;
        newCol.merged = false;
        newCol.options.colspan = 1;
        newCol.options.rowspan = 1;
        newCol.widgetList.length = 0;
        row.cols.splice(newColIdx, 0, newCol);
      });

      let rowNo = 0;
      while (newColIdx < widget.rows[0].cols.length - 1 && rowNo < widget.rows.length) {
        //越界判断
        const cellOfNextCol = widget.rows[rowNo].cols[newColIdx + 1];
        const colMerged = cellOfNextCol.merged; //确定插入位置右侧列的单元格是否为合并单元格
        if (!!colMerged) {
          let colArray = widget.rows[rowNo].cols;
          let unMergedCell = {};
          let startColIndex = null;
          for (let i = newColIdx; i >= 0; i--) {
            //查找该行已合并的主单元格
            if (!colArray[i].merged && colArray[i].options.colspan > 1) {
              startColIndex = i;
              unMergedCell = colArray[i];
              break;
            }
          }

          if (!!unMergedCell.options) {
            //如果有符合条件的unMergedCell
            let newColspan = unMergedCell.options.colspan + 1;
            this.setPropsOfMergedCols(widget.rows, rowNo, startColIndex, newColspan, unMergedCell.options.rowspan);
            rowNo += unMergedCell.options.rowspan;
          } else {
            rowNo += 1;
          }
        } else {
          //rowNo += 1
          rowNo += cellOfNextCol.options.rowspan || 1;
        }
      }

      this.emitHistoryChange();
    },

    setPropsOfMergedCols(rowArray, startRowIndex, startColIndex, newColspan, rowspan) {
      for (let i = startRowIndex; i < startRowIndex + rowspan; i++) {
        for (let j = startColIndex; j < startColIndex + newColspan; j++) {
          if (i === startRowIndex && j === startColIndex) {
            rowArray[i].cols[j].options.colspan = newColspan; //合并后的主单元格
            continue;
          }

          rowArray[i].cols[j].merged = true;
          rowArray[i].cols[j].options.colspan = newColspan;
          rowArray[i].cols[j].widgetList = [];
        }
      }
    },

    setPropsOfMergedRows(rowArray, startRowIndex, startColIndex, colspan, newRowspan) {
      for (let i = startRowIndex; i < startRowIndex + newRowspan; i++) {
        for (let j = startColIndex; j < startColIndex + colspan; j++) {
          if (i === startRowIndex && j === startColIndex) {
            rowArray[i].cols[j].options.rowspan = newRowspan;
            continue;
          }

          rowArray[i].cols[j].merged = true;
          rowArray[i].cols[j].options.rowspan = newRowspan;
          rowArray[i].cols[j].widgetList = [];
        }
      }
    },

    setPropsOfSplitCol(rowArray, startRowIndex, startColIndex, colspan, rowspan) {
      for (let i = startRowIndex; i < startRowIndex + rowspan; i++) {
        for (let j = startColIndex; j < startColIndex + colspan; j++) {
          rowArray[i].cols[j].merged = false;
          rowArray[i].cols[j].options.rowspan = 1;
          rowArray[i].cols[j].options.colspan = 1;
        }
      }
    },

    setPropsOfSplitRow(rowArray, startRowIndex, startColIndex, colspan, rowspan) {
      for (let i = startRowIndex; i < startRowIndex + rowspan; i++) {
        for (let j = startColIndex; j < startColIndex + colspan; j++) {
          rowArray[i].cols[j].merged = false;
          rowArray[i].cols[j].options.rowspan = 1;
          rowArray[i].cols[j].options.colspan = 1;
        }
      }
    },

    mergeTableCol(rowArray, colArray, curRow, curCol, leftFlag, cellWidget) {
      let mergedColIdx = !!leftFlag ? curCol : curCol + colArray[curCol].options.colspan;

      // let remainedColIdx = !!leftFlag ? curCol - colArray[curCol - 1].options.colspan : curCol
      let remainedColIdx = !!leftFlag ? curCol - 1 : curCol;
      if (!!leftFlag) {
        //继续向左寻找同行未被合并的第一个单元格
        let tmpColIdx = remainedColIdx;
        while (tmpColIdx >= 0) {
          if (!rowArray[curRow].cols[tmpColIdx].merged) {
            remainedColIdx = tmpColIdx;
            break;
          } else {
            tmpColIdx--;
          }
        }
      }

      if (!!colArray[mergedColIdx].widgetList && colArray[mergedColIdx].widgetList.length > 0) {
        //保留widgetList
        if (!colArray[remainedColIdx].widgetList || colArray[remainedColIdx].widgetList.length === 0) {
          colArray[remainedColIdx].widgetList = deepClone(colArray[mergedColIdx].widgetList);
        }
      }

      let newColspan = colArray[mergedColIdx].options.colspan * 1 + colArray[remainedColIdx].options.colspan * 1;
      this.setPropsOfMergedCols(rowArray, curRow, remainedColIdx, newColspan, cellWidget.options.rowspan);

      this.emitHistoryChange();
    },

    mergeTableWholeRow(rowArray, colArray, rowIndex, colIndex) {
      //需要考虑操作的行存在已合并的单元格！！
      //整行所有单元格行高不一致不可合并！！
      let startRowspan = rowArray[rowIndex].cols[0].options.rowspan;
      let unmatchedFlag = false;
      for (let i = 1; i < rowArray[rowIndex].cols.length; i++) {
        if (rowArray[rowIndex].cols[i].options.rowspan !== startRowspan) {
          unmatchedFlag = true;
          break;
        }
      }
      if (unmatchedFlag) {
        this.vueInstance.$message.info(this.vueInstance.i18nt('designer.hint.rowspanNotConsistentForMergeEntireRow'));
        return;
      }

      let widgetListCols = colArray.filter((colItem) => {
        return !colItem.merged && !!colItem.widgetList && colItem.widgetList.length > 0;
      });
      if (!!widgetListCols && widgetListCols.length > 0) {
        //保留widgetList
        if (
          widgetListCols[0].id !== colArray[0].id &&
          (!colArray[0].widgetList || colArray[0].widgetList.length <= 0)
        ) {
          colArray[0].widgetList = deepClone(widgetListCols[0].widgetList);
        }
      }

      this.setPropsOfMergedCols(rowArray, rowIndex, 0, colArray.length, colArray[colIndex].options.rowspan);

      this.emitHistoryChange();
    },

    mergeTableRow(rowArray, curRow, curCol, aboveFlag, cellWidget) {
      let mergedRowIdx = !!aboveFlag ? curRow : curRow + cellWidget.options.rowspan;

      //let remainedRowIdx = !!aboveFlag ? curRow - cellWidget.options.rowspan : curRow
      let remainedRowIdx = !!aboveFlag ? curRow - 1 : curRow;
      if (!!aboveFlag) {
        //继续向上寻找同列未被合并的第一个单元格
        let tmpRowIdx = remainedRowIdx;
        while (tmpRowIdx >= 0) {
          if (!rowArray[tmpRowIdx].cols[curCol].merged) {
            remainedRowIdx = tmpRowIdx;
            break;
          } else {
            tmpRowIdx--;
          }
        }
      }

      if (
        !!rowArray[mergedRowIdx].cols[curCol].widgetList &&
        rowArray[mergedRowIdx].cols[curCol].widgetList.length > 0
      ) {
        //保留widgetList
        if (
          !rowArray[remainedRowIdx].cols[curCol].widgetList ||
          rowArray[remainedRowIdx].cols[curCol].widgetList.length === 0
        ) {
          rowArray[remainedRowIdx].cols[curCol].widgetList = deepClone(rowArray[mergedRowIdx].cols[curCol].widgetList);
        }
      }

      let newRowspan =
        rowArray[mergedRowIdx].cols[curCol].options.rowspan * 1 +
        rowArray[remainedRowIdx].cols[curCol].options.rowspan * 1;
      this.setPropsOfMergedRows(rowArray, remainedRowIdx, curCol, cellWidget.options.colspan, newRowspan);

      this.emitHistoryChange();
    },

    mergeTableWholeCol(rowArray, colArray, rowIndex, colIndex) {
      //需要考虑操作的列存在已合并的单元格！！
      //整列所有单元格列宽不一致不可合并！！
      let startColspan = rowArray[0].cols[colIndex].options.colspan;
      let unmatchedFlag = false;
      for (let i = 1; i < rowArray.length; i++) {
        if (rowArray[i].cols[colIndex].options.colspan !== startColspan) {
          unmatchedFlag = true;
          break;
        }
      }
      if (unmatchedFlag) {
        this.vueInstance.$message.info(
          this.vueInstance.i18nt('designer.hint.colspanNotConsistentForMergeEntireColumn')
        );
        return;
      }

      let widgetListCols = [];
      rowArray.forEach((rowItem) => {
        let tempCell = rowItem.cols[colIndex];
        if (!tempCell.merged && !!tempCell.widgetList && tempCell.widgetList.length > 0) {
          widgetListCols.push(tempCell);
        }
      });

      let firstCellOfCol = rowArray[0].cols[colIndex];
      if (!!widgetListCols && widgetListCols.length > 0) {
        //保留widgetList
        if (
          widgetListCols[0].id !== firstCellOfCol.id &&
          (!firstCellOfCol.widgetList || firstCellOfCol.widgetList.length <= 0)
        ) {
          firstCellOfCol.widgetList = deepClone(widgetListCols[0].widgetList);
        }
      }

      this.setPropsOfMergedRows(rowArray, 0, colIndex, firstCellOfCol.options.colspan, rowArray.length);

      this.emitHistoryChange();
    },

    undoMergeTableCol(rowArray, rowIndex, colIndex, colspan, rowspan) {
      this.setPropsOfSplitCol(rowArray, rowIndex, colIndex, colspan, rowspan);

      this.emitHistoryChange();
    },

    undoMergeTableRow(rowArray, rowIndex, colIndex, colspan, rowspan) {
      this.setPropsOfSplitRow(rowArray, rowIndex, colIndex, colspan, rowspan);

      this.emitHistoryChange();
    },

    deleteTableWholeCol(rowArray, colIndex) {
      //需考虑删除的是合并列！！
      let onlyOneColFlag = true;
      rowArray.forEach((ri) => {
        if (ri.cols[0].options.colspan !== rowArray[0].cols.length) {
          onlyOneColFlag = false;
        }
      });
      //仅剩一列则不可删除！！
      if (onlyOneColFlag) {
        this.vueInstance.$message.info(this.vueInstance.i18nt('designer.hint.lastColCannotBeDeleted'));
        return;
      }

      //整列所有单元格列宽不一致不可删除！！
      let startColspan = rowArray[0].cols[colIndex].options.colspan;
      let unmatchedFlag = false;
      for (let i = 1; i < rowArray.length; i++) {
        if (rowArray[i].cols[colIndex].options.colspan !== startColspan) {
          unmatchedFlag = true;
          break;
        }
      }
      if (unmatchedFlag) {
        this.vueInstance.$message.info(
          this.vueInstance.i18nt('designer.hint.colspanNotConsistentForDeleteEntireColumn')
        );
        return;
      }

      rowArray.forEach((rItem) => {
        rItem.cols.splice(colIndex, startColspan);
      });

      this.emitHistoryChange();
    },

    deleteTableWholeRow(rowArray, rowIndex) {
      //需考虑删除的是合并行！！
      let onlyOneRowFlag = true;
      rowArray[0].cols.forEach((ci) => {
        if (ci.options.rowspan !== rowArray.length) {
          onlyOneRowFlag = false;
        }
      });
      //仅剩一行则不可删除！！
      if (onlyOneRowFlag) {
        this.vueInstance.$message.info(this.vueInstance.i18nt('designer.hint.lastRowCannotBeDeleted'));
        return;
      }

      //整行所有单元格行高不一致不可删除！！
      let startRowspan = rowArray[rowIndex].cols[0].options.rowspan;
      let unmatchedFlag = false;
      for (let i = 1; i < rowArray[rowIndex].cols.length; i++) {
        if (rowArray[rowIndex].cols[i].options.rowspan !== startRowspan) {
          unmatchedFlag = true;
          break;
        }
      }
      if (unmatchedFlag) {
        this.vueInstance.$message.info(this.vueInstance.i18nt('designer.hint.rowspanNotConsistentForDeleteEntireRow'));
        return;
      }

      rowArray.splice(rowIndex, startRowspan);

      this.emitHistoryChange();
    },

    getContainerByType(typeName) {
      let allWidgets = [...containers, ...basicFields, ...advancedFields, ...customFields];
      let foundCon = null;
      allWidgets.forEach((con) => {
        if (!!con.category && !!con.type && con.type === typeName) {
          foundCon = con;
        }
      });

      return foundCon;
    },

    getFieldWidgetByType(typeName) {
      let allWidgets = [...containers, ...basicFields, ...advancedFields, ...customFields];
      let foundWidget = null;
      allWidgets.forEach((widget) => {
        if (!!!widget.category && !!widget.type && widget.type === typeName) {
          foundWidget = widget;
        }
      });

      return foundWidget;
    },

    hasConfig(widget, configName) {
      let originalWidget = null;
      if (!!widget.category) {
        originalWidget = this.getContainerByType(widget.type);
      } else {
        originalWidget = this.getFieldWidgetByType(widget.type);
      }

      if (!originalWidget || !originalWidget.options) {
        return false;
      }

      return Object.keys(originalWidget.options).indexOf(configName) > -1;
    },

    upgradeWidgetConfig(oldWidget) {
      let newWidget = null;
      if (!!oldWidget.category) {
        newWidget = this.getContainerByType(oldWidget.type);
      } else {
        newWidget = this.getFieldWidgetByType(oldWidget.type);
      }

      if (!newWidget || !newWidget.options) {
        return;
      }

      Object.keys(newWidget.options).forEach((ck) => {
        if (!oldWidget.hasOwnProperty(ck)) {
          oldWidget.options[ck] = deepClone(newWidget.options[ck]);
        }
      });
    },

    upgradeFormConfig(oldFormConfig) {
      Object.keys(this.formConfig).forEach((fc) => {
        if (!oldFormConfig.hasOwnProperty(fc)) {
          oldFormConfig[fc] = deepClone(this.formConfig[fc]);
        }
      });
    },

    cloneGridCol(widget, parentWidget) {
      let newGridCol = deepClone(this.getContainerByType('grid-col'));
      newGridCol.options.span = widget.options.span;
      let tmpId = generateId();
      newGridCol.id = 'grid-col-' + tmpId;
      newGridCol.options.name = 'gridCol' + tmpId;

      parentWidget.cols.push(newGridCol);
    },

    cloneContainer(containWidget) {
      if (containWidget.type === 'grid') {
        let newGrid = deepClone(this.getContainerByType('grid'));
        newGrid.id = newGrid.type + generateId();
        newGrid.options.name = newGrid.id;
        containWidget.cols.forEach((gridCol) => {
          let newGridCol = deepClone(this.getContainerByType('grid-col'));
          let tmpId = generateId();
          newGridCol.id = 'grid-col-' + tmpId;
          newGridCol.options.name = 'gridCol' + tmpId;
          newGridCol.options.span = gridCol.options.span;
          newGrid.cols.push(newGridCol);
        });

        return newGrid;
      } else if (containWidget.type === 'table') {
        let newTable = deepClone(this.getContainerByType('table'));
        newTable.id = newTable.type + generateId();
        newTable.options.name = newTable.id;
        containWidget.rows.forEach((tRow) => {
          let newRow = deepClone(tRow);
          newRow.id = 'table-row-' + generateId();
          newRow.cols.forEach((col) => {
            col.id = 'table-cell-' + generateId();
            col.options.name = col.id;
            col.widgetList = []; //清空组件列表
          });
          newTable.rows.push(newRow);
        });

        return newTable;
      } else {
        //其他容器组件不支持clone操作
        return null;
      }
    },

    moveUpWidget(parentList, indexOfParentList) {
      if (!!parentList) {
        if (indexOfParentList === 0) {
          this.vueInstance.$message(this.vueInstance.i18nt('designer.hint.moveUpFirstChildHint'));
          return;
        }

        let tempWidget = parentList[indexOfParentList];
        parentList.splice(indexOfParentList, 1);
        parentList.splice(indexOfParentList - 1, 0, tempWidget);
      }
    },

    moveDownWidget(parentList, indexOfParentList) {
      if (!!parentList) {
        if (indexOfParentList === parentList.length - 1) {
          this.vueInstance.$message(this.vueInstance.i18nt('designer.hint.moveDownLastChildHint'));
          return;
        }

        let tempWidget = parentList[indexOfParentList];
        parentList.splice(indexOfParentList, 1);
        parentList.splice(indexOfParentList + 1, 0, tempWidget);
      }
    },

    copyNewFieldWidget(origin) {
      let newWidget = deepClone(origin);
      let tempId = generateId();
      newWidget.id = newWidget.type.replace(/-/g, '') + tempId;
      newWidget.options.name = newWidget.id;
      newWidget.options.label = newWidget.options.label || newWidget.type.toLowerCase();

      delete newWidget.displayName;
      return newWidget;
    },

    copyNewContainerWidget(origin) {
      let newCon = deepClone(origin);
      newCon.id = newCon.type.replace(/-/g, '') + generateId();
      newCon.options.name = newCon.id;
      if (newCon.type === 'grid') {
        let newCol = deepClone(this.getContainerByType('grid-col'));
        let tmpId = generateId();
        newCol.id = 'grid-col-' + tmpId;
        newCol.options.name = 'gridCol' + tmpId;
        newCon.cols.push(newCol);
        //
        newCol = deepClone(newCol);
        tmpId = generateId();
        newCol.id = 'grid-col-' + tmpId;
        newCol.options.name = 'gridCol' + tmpId;
        newCon.cols.push(newCol);
      } else if (newCon.type === 'table') {
        let newRow = { cols: [] };
        newRow.id = 'table-row-' + generateId();
        newRow.merged = false;
        let newCell = deepClone(this.getContainerByType('table-cell'));
        newCell.id = 'table-cell-' + generateId();
        newCell.options.name = newCell.id;
        newCell.merged = false;
        newCell.options.colspan = 1;
        newCell.options.rowspan = 1;
        newRow.cols.push(newCell);
        newCon.rows.push(newRow);
      } else if (newCon.type === 'tab') {
        let newTabPane = deepClone(this.getContainerByType('tab-pane'));
        newTabPane.id = 'tab-pane-' + generateId();
        newTabPane.options.name = 'tab1';
        newTabPane.options.label = 'tab 1';
        newCon.tabs.push(newTabPane);
      }
      //newCon.options.customClass = []

      delete newCon.displayName;
      return newCon;
    },

    addContainerByDbClick(container) {
      let newCon = this.copyNewContainerWidget(container);
      this.widgetList.push(newCon);
      this.setSelected(newCon);
    },

    addFieldByDbClick(widget) {
      let newWidget = this.copyNewFieldWidget(widget);
      if (!!this.selectedWidget && this.selectedWidget.type === 'tab') {
        //获取当前激活的tabPane
        let activeTab = this.selectedWidget.tabs[0];
        this.selectedWidget.tabs.forEach((tabPane) => {
          if (!!tabPane.options.active) {
            activeTab = tabPane;
          }
        });

        !!activeTab && activeTab.widgetList.push(newWidget);
      } else if (!!this.selectedWidget && !!this.selectedWidget.widgetList) {
        this.selectedWidget.widgetList.push(newWidget);
      } else {
        this.widgetList.push(newWidget);
      }

      this.setSelected(newWidget);
      this.emitHistoryChange();
    },

    deleteColOfGrid(gridWidget, colIdx) {
      if (!!gridWidget && !!gridWidget.cols) {
        gridWidget.cols.splice(colIdx, 1);
      }
    },

    addNewColOfGrid(gridWidget) {
      const cols = gridWidget.cols;
      let newGridCol = deepClone(this.getContainerByType('grid-col'));
      let tmpId = generateId();
      newGridCol.id = 'grid-col-' + tmpId;
      newGridCol.options.name = 'gridCol' + tmpId;
      if (!!cols && cols.length > 0) {
        let spanSum = 0;
        cols.forEach((col) => {
          spanSum += col.options.span;
        });

        if (spanSum >= 24) {
          //this.$message.info('列栅格之和超出24')
          console.log('列栅格之和超出24');
          gridWidget.cols.push(newGridCol);
        } else {
          newGridCol.options.span = 24 - spanSum > 12 ? 12 : 24 - spanSum;
          gridWidget.cols.push(newGridCol);
        }
      } else {
        gridWidget.cols = [newGridCol];
      }
    },

    addTabPaneOfTabs(tabsWidget) {
      const tabPanes = tabsWidget.tabs;
      let newTabPane = deepClone(this.getContainerByType('tab-pane'));
      newTabPane.id = 'tab-pane-' + generateId();
      newTabPane.options.name = newTabPane.id;
      newTabPane.options.label = 'tab ' + (tabPanes.length + 1);
      tabPanes.push(newTabPane);
    },

    deleteTabPaneOfTabs(tabsWidget, tpIdx) {
      tabsWidget.tabs.splice(tpIdx, 1);
    },

    emitEvent(evtName, evtData) {
      //用于兄弟组件发射事件
      this.vueInstance.$emit(evtName, evtData);
    },

    handleEvent(evtName, callback) {
      //用于兄弟组件接收事件
      this.vueInstance.$on(evtName, (data) => callback(data));
    },

    setCssClassList(cssClassList) {
      this.cssClassList = cssClassList;
    },

    getCssClassList() {
      return this.cssClassList;
    },

    registerFormWidget(formWidget) {
      this.formWidget = formWidget;
    },

    initHistoryData() {
      this.loadFormContentFromStorage();
      this.historyData.index++;
      this.historyData.steps[this.historyData.index] = {
        widgetList: deepClone(this.widgetList),
        formConfig: deepClone(this.formConfig),
      };
    },

    emitHistoryChange() {
      //console.log('------------', 'Form history changed!')

      if (this.historyData.index === this.historyData.maxStep - 1) {
        this.historyData.steps.shift();
      } else {
        this.historyData.index++;
      }

      this.historyData.steps[this.historyData.index] = {
        widgetList: deepClone(this.widgetList),
        formConfig: deepClone(this.formConfig),
      };

      this.saveFormContentToStorage();

      if (this.historyData.index < this.historyData.steps.length - 1) {
        this.historyData.steps = this.historyData.steps.slice(0, this.historyData.index + 1);
      }

      //console.log('history', this.historyData.index)
    },

    saveCurrentHistoryStep() {
      this.historyData.steps[this.historyData.index] = deepClone({
        widgetList: this.widgetList,
        formConfig: this.formConfig,
      });

      this.saveFormContentToStorage();
    },

    undoHistoryStep() {
      if (this.historyData.index !== 0) {
        this.historyData.index--;
      }
      //console.log('undo', this.historyData.index)

      this.widgetList = deepClone(this.historyData.steps[this.historyData.index].widgetList);
      this.formConfig = deepClone(this.historyData.steps[this.historyData.index].formConfig);
    },

    redoHistoryStep() {
      if (this.historyData.index !== this.historyData.steps.length - 1) {
        this.historyData.index++;
      }
      //console.log('redo', this.historyData.index)

      this.widgetList = deepClone(this.historyData.steps[this.historyData.index].widgetList);
      this.formConfig = deepClone(this.historyData.steps[this.historyData.index].formConfig);
    },

    undoEnabled() {
      return this.historyData.index > 0 && this.historyData.steps.length > 0;
    },

    redoEnabled() {
      return this.historyData.index < this.historyData.steps.length - 1;
    },

    saveFormContentToStorage() {
      window.localStorage.setItem('widget__list__backup', JSON.stringify(this.widgetList));
      window.localStorage.setItem('form__config__backup', JSON.stringify(this.formConfig));
    },

    loadFormContentFromStorage() {
      let widgetListBackup = window.localStorage.getItem('widget__list__backup');
      if (!!widgetListBackup) {
        this.widgetList = JSON.parse(widgetListBackup);
      }

      let formConfigBackup = window.localStorage.getItem('form__config__backup');
      if (!!formConfigBackup) {
        //this.formConfig = JSON.parse(formConfigBackup)
        overwriteObj(
          this.formConfig,
          JSON.parse(formConfigBackup)
        ); /* 用=赋值，会导致inject依赖注入的formConfig属性变成非响应式 */
      }
    },
  };
}
