///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  "dojo/dom",
  "dojo/query",
  'dojo/promise/all',
  'dijit/_WidgetsInTemplateMixin',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/jsonUtils',
  'esri/Color',
  "esri/InfoTemplate",
  "esri/dijit/FeatureTable",
  "esri/graphicsUtils",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/layers/FeatureLayer",
  "esri/toolbars/draw",
   "esri/geometry/Point",
  'jimu/BaseWidget',
  'jimu/WidgetManager',
  'jimu/dijit/ViewStack',
  'jimu/dijit/FeatureSetChooserForMultipleLayers',
  'jimu/LayerInfos/LayerInfos',
  'jimu/SelectionManager',
  './layerUtil',
  './SelectableLayerItem',
  './FeatureItem',
  'jimu/dijit/LoadingShelter'
],
function(declare, lang, html, array, on, dom, query, all, _WidgetsInTemplateMixin, SimpleMarkerSymbol,
         SimpleLineSymbol, SimpleFillSymbol, SymbolJsonUtils, Color, InfoTemplate, FeatureTable, graphicsUtils, Query,
         QueryTask, FeatureLayer, Draw, Point, BaseWidget, WidgetManager, ViewStack, FeatureSetChooserForMultipleLayers,
         LayerInfos, SelectionManager, layerUtil, SelectableLayerItem, FeatureItem) {
  var fLayer;
  var bottomDiv = document.getElementById("tableDiv");
  var toolbar;
  var myFeatureTable;
  return declare([BaseWidget, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-select',

    postMixInProperties: function() {
      this.inherited(arguments);
      lang.mixin(this.nls, window.jimuNls.common);
    },
    onOpen: function() {
      WidgetManager.getInstance().activateWidget(this);
        if (!this.map.getLayer("featureLayer2")) {
            fLayer = new FeatureLayer(this.appConfig.featureLayer, {
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields: ["*"]
            });
            this.map.addLayer(fLayer);
        }

        if (this.map.getLayer("baseFeaLayer") ){
            this.map.getLayer("baseFeaLayer").setVisibility(false);     //不让加载的用地图层影像空间查询
        }
    },

    onDestroy: function() {
      // if (this.selectDijit.isActive()) {
      //   this.selectDijit.deactivate();
      // }
      this._clearAllSelections();

    },
    onClose:function () {
      this._isOpen = false;
      bottomDiv.style.zIndex = -1;
      toolbar.deactivate();
      this.map.graphics.clear();
      this.map.removeLayer(fLayer);
      this.map.infoWindow.hide();       //隐藏弹框
        if (this.map.getLayer("baseFeaLayer"))
            this.map.getLayer("baseFeaLayer").setVisibility(true);
        //myFeatureTable.destroy();
    },

    startup:function () {
        var self = this;
        var objectIds;      //存储OBJECTID,用于导出excel
        var infoTemplate;
        var selectedGeoArray;
        toolbar = new Draw(this.map, {showTooltip: true});


        //设置空间查询框选时框的样式
        // var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        //     new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 3), new dojo.Color([255, 255, 0, 0.15]));
        //显示要素单击选中或者与table交互的样式
        var fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 238]), 2), new dojo.Color([238, 99, 99, 0.55]));
        //查询结果的样式
        var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 2), new dojo.Color([255,250,250,0.25]));

        fLayer =  new FeatureLayer(self.appConfig.featureLayer,{
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields:["*"],
            id:"featureLayer2"
        });
        this.map.addLayer(fLayer);

        if (this.map.getLayer("baseFeaLayer"))
            this.map.getLayer("baseFeaLayer").setVisibility(false);     //不让加载的用地图层影像空间查询

        myFeatureTable = new FeatureTable({
            featureLayer : fLayer,
            outFields: ["YDDW","SFGSQY", "JYDJ","CZJY", "JYLX", "YDLX", "QSXZ", "SZXZ", "SZC", "CYLB",
                "HYLB", "TDZL", "JSZK", "CLSJ","CLMJ", "JZMJ", "JZJD", "RJL", "JZMD", "GDZCTZ",
                "DJGDZCTZ", "ZCZ", "DJCZ", "ZXSSL", "DJXSSL", "LKSS", "MJSS", "KGSJ", "JGSJ", "YDL", "YSL",
                "YQL", "WRPFL", "SZYQ"],
            map : self.map,
            editable: false,
            showAttachments:false,
            syncSelection: true,            //map与table是否交互
            showFeatureCount: true,        //显示多少要素选中
            dateOptions: {
                datePattern: 'MMM/d/y',
                timeEnabled: false,       //是否显示时间
                //timePattern: 'H:mm',      //显示的时间格式
            },
            menuFunctions:[
                {
                    label:"导出到EXcel",
                    callback:function () {
                        objectIds = objectIds.substring(0, objectIds.length - 1);
                        window.location.href="http://zj081:8015/ExportExcel.ashx?OBJIDS="+objectIds;
                    }
                }
            ],
        }, 'myTableNode');

        //fLayer.setSelectionSymbol(fillSymbol);        //startup有用，后面没用
        //单击表中数据，定位到该图形,弹出框
        myFeatureTable.on("row-select", function (evt) {
                //myFeatureTable.centerOnSelection();
                var row = myFeatureTable.selectedRows
                 var row0 = row[0];
                 var id = row0.OBJECTID;

                var len = selectedGeoArray.length;
                for (var i = 0; i < len; i++) {
                    var geo = selectedGeoArray[i];
                    if (geo.attributes["OBJECTID"] == id)
                    {
                        self.map.infoWindow.setContent(geo.getContent());
                        self.map.infoWindow.setTitle(geo.getTitle());
                        self.map.infoWindow.anchor = "ANCHOR_LOWERRIGHT ";       //固定在右上角
                        self.map.infoWindow.show(geo.geometry.getCentroid(), self.map.getInfoWindowAnchor(geo.geometry.getCentroid() ));
                        //重新设置定位位置，位置较重心上移250，使图形和弹窗均显示在地图正中央
                        var pt = new Point(geo.geometry.getCentroid().x, geo.geometry.getCentroid().y - 250, self.map.spatialReference);
                        self.map.centerAndZoom(pt, 4);
                    }
                }
        });
        myFeatureTable.startup();

        query("button").on("click", function (evt) {
            var value = this.innerHTML;
            switch (value){
                case "按矩形选择":
                    toolbar.activate(Draw.RECTANGLE,{showTooltip:true})
                    break;
                case "按多边形选择":
                    toolbar.activate(Draw.POLYGON, {showTooltip:true})
                    break;
                case "按圆选择":
                    toolbar.activate(Draw.CIRCLE, {showTooltip:true});
                    break;
                case "自定义选择":
                    toolbar.activate(Draw.FREEHAND_POLYGON, {showTooltip:true});
                    break;
                case  "清除选择":
                    self.map.graphics.clear();
                    fLayer.clearSelection();
                    objectIds = '';
                    bottomDiv.style.zIndex = -1;
                    toolbar.deactivate();           //释放绘图工具
                    self.map.infoWindow.hide();
                    break;
                case  "导出到Excel":
                    if (objectIds == '') {
                        alert("没有选中要素");
                        break;
                    }
                    objectIds = objectIds.substring(0, objectIds.length - 1);
                    window.location.href="http://zj081:8015/ExportExcel.ashx?OBJIDS="+objectIds;
                    break;
            }
        });
        on(toolbar, "draw-end", function (result) {
            self.map.graphics.clear();
            var geometry = result.geometry;

            //var grap  = new esri.Graphic(geometry, symbol);
            //self.map.graphics.add(grap);      //只高亮显示，不显示框
            toolbar.deactivate();       //注销工具
            queryGraphic(geometry)
        });
        function queryGraphic(geometry) {
            var queryTask = new QueryTask(self.appConfig.featureLayer);
            var query = new Query();
            query.geometry = geometry;
            query.outFields = ["*"];
            query.outSpatialReference = self.map.spatialReference;
            query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
            query.returnGeometry = true;
            fLayer.selectFeatures(query, FeatureLayer.MODE_ONDEMAND);
            queryTask.execute(query, showQueryResult);
        }

        function showQueryResult(queryResult) {
            var arr= new Array();           //存OBJECTID
            selectedGeoArray = new Array();
            objectIds = '';     //每次查询都需要置空
            var kaigongTime = "";
            var jungongTime = "";
            var churangTime = "";

            if (queryResult.features.length >= 1) {
                for (var i = 0; i < queryResult.features.length; i++) {
                    //得到graphic
                    var graphic = queryResult.features[i];
                    selectedGeoArray[i] = graphic;
                    var attr = graphic.attributes["OBJECTID"];
                    var kg = graphic.attributes["KGSJ"];
                    var jg = graphic.attributes["JGSJ"];
                    var cr = graphic.attributes["CLSJ"];
                    if (kg != null)
                        kaigongTime = new Date(kg).toLocaleDateString();
                    if (jg != null)
                        jungongTime = new Date(jg).toLocaleDateString();
                    if (cr != null)
                        churangTime = new Date(cr).toLocaleDateString();

                    arr[i] = attr;
                    objectIds += attr;
                    objectIds += ',';
                    graphic.setSymbol(fill);
                    
                    var content ="<table style='line-height:25px;font-size:14px;'>"+
												"<tr><td>地块索引号:</td><td>${DKSYH}</td></tr>"+
												"<tr><td>节约等级:</td><td>${JYDJ}</td></tr>"+
                                                "<tr><td>处置建议:</td><td>${CZJY}</td></tr>"+
 												"<tr><td>所在园区:</td><td>${SZYQ}</td></tr>"+
 												"<tr><td>所在乡镇:</td><td>${SZXZ}</td></tr>"+
 												"<tr><td>是否规上企业:</td><td>${SFGSQY}</td></tr>"+
 												"<tr><td>节约类型:</td><td>${JYLX}</td></tr>"+ 			
 												"<tr><td>供地方式:</td><td>${GDFS}</td></tr>"+			
 												"<tr><td>权属性质:</td><td>${QSXZ}</td></tr>"+
 												"<tr><td>产业类别:</td><td>${CYLB}</td></tr>"+
 												"<tr><td>行业类别:</td><td>${HYLB}</td></tr>"+
 												"<tr><td>建设状况:</td><td>${JSZK}</td></tr>"+
 												"<tr><td>出让面积:</td><td>${CLMJ}</td></tr>"+			
 												"<tr><td>建筑面积:</td><td>${JZMJ}</td></tr>"+
 												"<tr><td>建筑基底面积:</td><td>${JZJD}</td></tr>"+
 												"<tr><td>容积率:</td><td>${RJL}</td></tr>"+
 												"<tr><td>建筑密度:</td><td>${JZMD}</td></tr>"+
 												"<tr><td>固定资产投资:</td><td>${GDZCTZ}</td></tr>"+
 												"<tr><td>地均固定资产投资:</td><td>${DJGDZCTZ}</td></tr>"+
 												"<tr><td>总产值:</td><td>${ZCZ}</td></tr>"+
 												"<tr><td>地均产值:</td><td>${DJCZ}</td></tr>"+
 												"<tr><td>总销售收入:</td><td>${ZXSSL}</td></tr>"+
 												"<tr><td>地均销售收入:</td><td>${DJXSSL}</td></tr>"+
 												"<tr><td>入库税收:</td><td>${LKSS}</td></tr>"+
 												"<tr><td>亩均税收:</td><td>${MJSS}</td></tr>"+
 												"<tr><td>出让时间:</td><td>" + churangTime +"</td></tr>"+
 												"<tr><td>开工时间:</td><td>" + kaigongTime + "</td></tr>"+
 												"<tr><td>竣工时间:</td><td>" + jungongTime+ "</td></tr>"+
 												"<tr><td>用电量:</td><td>${YDL}</td></tr>"+
 												"<tr><td>用水量:</td><td>${YSL}</td></tr>"+
 												"<tr><td>用气量:</td><td>${YQL}</td></tr>"+
 												"<tr><td>污染排放量:</td><td>${WRPFL}</td></tr>"+
 												"<tr><td>照片号:</td><td>${PHOTO}</td></tr>"+ 			
 												"</table>";
                    
                    infoTemplate = new InfoTemplate("${YDDW}", content);
                    graphic.setInfoTemplate(infoTemplate);
                    self.map.graphics.add(graphic);
                }
                myFeatureTable.filterRecordsByIds(arr);     //根据选中的id显示featureTable的内容
            }
            else {
                return;         //没有选中则不做操作
            }
            bottomDiv.style.zIndex = 500;

        }
    },

    _initLayers: function(layerInfoArray) {
      this.layerObjectArray = [];
      this.layerItems = [];
      this.selectionSymbols = {};

      html.empty(this.layerItemsNode);
      this.shelter.show();

      all(this._obtainLayerObjects(layerInfoArray)).then(lang.hitch(this, function(layerObjects) {
        array.forEach(layerObjects, lang.hitch(this, function(layerObject, index) {
          // hide from the layer list if layerobject is undefined or there is no objectIdField
          if(layerObject && layerObject.objectIdField && layerObject.geometryType) {
            var layerInfo = layerInfoArray[index];
            var visible = layerInfo.isShowInMap() && layerInfo.isInScale();

            var item = new SelectableLayerItem({
              layerInfo: layerInfo,
              checked: visible,
              layerVisible: visible,
              folderUrl: this.folderUrl,
              allowExport: this.config ? this.config.allowExport : false,
              map: this.map,
              nls: this.nls
            });
            this.own(on(item, 'switchToDetails', lang.hitch(this, this._switchToDetails)));
            this.own(on(item, 'stateChange', lang.hitch(this, function() {
              this.shelter.show();
              this.selectDijit.setFeatureLayers(this._getSelectableLayers());
              this.shelter.hide();
            })));
            item.init(layerObject);
            html.place(item.domNode, this.layerItemsNode);
            item.startup();

            this.layerItems.push(item);
            this.layerObjectArray.push(layerObject);

            if(!layerObject.getSelectionSymbol()){
              this._setDefaultSymbol(layerObject);
            }

            var symbol = layerObject.getSelectionSymbol();
            this.selectionSymbols[layerObject.id] = symbol.toJson();
          }
        }));
        this.selectDijit.setFeatureLayers(this._getSelectableLayers());
        this._setSelectionSymbol();
        this.shelter.hide();
      }));
    },

    _setSelectionSymbol: function(){
      array.forEach(this.layerObjectArray, function(layerObject) {
        this._setDefaultSymbol(layerObject);
      }, this);
    },

    _setDefaultSymbol: function(layerObject) {
      if(layerObject.geometryType === 'esriGeometryPoint' ||
          layerObject.geometryType === 'esriGeometryMultipoint') {
        layerObject.setSelectionSymbol(this.defaultPointSymbol);
      } else if(layerObject.geometryType === 'esriGeometryPolyline') {
        layerObject.setSelectionSymbol(this.defaultLineSymbol);
      } else if(layerObject.geometryType === 'esriGeometryPolygon') {
        layerObject.setSelectionSymbol(this.defaultFillSymbol);
      } else {
        console.warn('unknown geometryType: ' + layerObject.geometryType);
      }
    },

    _restoreSelectionSymbol: function() {
      array.forEach(this.layerObjectArray, function(layerObject) {
        var symbolJson = this.selectionSymbols[layerObject.id];
        if(symbolJson) {
          layerObject.setSelectionSymbol(SymbolJsonUtils.fromJson(symbolJson));
        }
      }, this);
    },

    _layerVisibilityChanged: function() {
      array.forEach(this.layerItems, function(layerItem) {
        layerItem.updateLayerVisibility();
      }, this);
    },

    _getSelectableLayers: function() {
      var layers = [];
      array.forEach(this.layerItems, function(layerItem) {
        if(layerItem.isLayerVisible() && layerItem.isChecked()) {
          layers.push(layerItem.featureLayer);
        }
      }, this);

      return layers;
    },

    _clearAllSelections: function() {
      var selectionMgr = SelectionManager.getInstance();
      array.forEach(this.layerObjectArray, function(layerObject) {
        selectionMgr.clearSelection(layerObject);
      });
    },

    _obtainLayerObjects: function(layerInfoArray) {
      return array.map(layerInfoArray, function(layerInfo) {
        return layerInfo.getLayerObject();
      });
    },

    _switchToDetails: function(layerItem) {
      html.empty(this.featureContent);
      this.viewStack.switchView(1);
      this.selectedLayerName.innerHTML = layerItem.layerName;
      this.selectedLayerName.title = layerItem.layerName;

      layerItem.layerInfo.getLayerObject().then(lang.hitch(this, function(layerObject) {
        var selectedFeatures = layerObject.getSelectedFeatures();
        if(selectedFeatures.length > 0) {
          array.forEach(selectedFeatures, lang.hitch(this, function(feature) {
            var item = new FeatureItem({
              graphic: feature,
              map: this.map,
              featureLayer: layerObject,
              displayField: layerObject.displayField,
              objectIdField: layerObject.objectIdField,
              allowExport: this.config ? this.config.allowExport : false,
              nls: this.nls
            });
            html.place(item.domNode, this.featureContent);
            item.startup();
          }));
        }
      }));
    },

    _switchToLayerList: function() {
      this.viewStack.switchView(0);
    }
  });
});
