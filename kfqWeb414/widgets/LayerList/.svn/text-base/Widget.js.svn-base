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

define([
		'jimu/BaseWidget',
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/_base/array',
		'dojo/_base/html',
		'dojo/dom',
		'dojo/on',
		'dojo/query',
		'dijit/registry',
		'esri/InfoTemplate',
		'esri/layers/FeatureLayer',
		"esri/layers/GraphicsLayer",
		"esri/layers/LOD",
		"esri/graphic",
		"esri/tasks/QueryTask",
		"esri/tasks/query",
		"esri/symbols/PictureMarkerSymbol",
		'./LayerListView',
		'./NlsStrings',
		'jimu/LayerInfos/LayerInfos'
	],
	function(BaseWidget, declare, lang, array, html, dom, on,
		query, registry, InfoTemplate, FeatureLayer, GraphicsLayer, LOD, Graphic,
		QueryTask, Query, PictureMarkerSymbol, LayerListView, NlsStrings, LayerInfos) {

		var clazz = declare([BaseWidget], {
			//these two properties is defined in the BaseWiget
			baseClass: 'jimu-widget-layerList',
			name: 'layerList',
			_denyLayerInfosReorderResponseOneTime: null,
			//layerListView: Object{}
			//  A module is responsible for show layers list
			layerListView: null,

			//operLayerInfos: Object{}
			//  operational layer infos
			operLayerInfos: null,

			startup: function() {
				var ck1 = document.getElementById("checkeBoxGYYD");
				var self = this;
				var content = "<table class='Bombox-table' style='line-height:25px;font-size:14px;text-align:right;'>" +
					"<tr><td>节约等级:</td><td>${JYDJ:compare}</td></tr>" +
					"<tr><td>所在园区:</td><td>${SZYQ}</td></tr>" +
					"<tr><td>所在村镇:</td><td>${SZXZ}${SZC}</td></tr>" +
					"<tr><td>是否规上企业:</td><td>${SFGSQY}</td></tr>" +
					//"<tr><td>节约类型:</td><td>${JYLX}</td></tr>"+ 			
					"<tr><td>供地方式:</td><td>${GDFS}</td></tr>" +
					//"<tr><td>权属性质:</td><td>${QSXZ}</td></tr>"+
					"<tr><td>产业类别:</td><td>${CYLB}</td></tr>" +
					//"<tr><td>行业类别:</td><td>${HYLB}</td></tr>"+
					"<tr><td>建设状况:</td><td>${JSZK}</td></tr>" +
					"<tr><td>地块面积:</td><td>${DKMJ:compare}亩</td></tr>" +
					"<tr><td>出让面积:</td><td>${CLMJ}</td></tr>" +
					"<tr><td>建筑面积:</td><td>${JZMJ}</td></tr>" +
					"<tr><td>建筑基底面积:</td><td>${JZJD}</td></tr>" +
					"<tr><td>容积率:</td><td>${RJL}</td></tr>" +
					"<tr><td>建筑密度:</td><td>${JZMD}</td></tr>" +
					"<tr><td>固定资产投资:</td><td>${GDZCTZ}</td></tr>" +
					"<tr><td>地均固定资产投资:</td><td>${DJGDZCTZ}</td></tr>" +
					"<tr><td>总产值:</td><td>${ZCZ}</td></tr>" +
					"<tr><td>地均产值:</td><td>${DJCZ}</td></tr>" +
					"<tr><td>总销售收入:</td><td>${ZXSSL}</td></tr>" +
					"<tr><td>地均销售收入:</td><td>${DJXSSL}</td></tr>" +
					"<tr><td>入库税收:</td><td>${LKSS}</td></tr>" +
					"<tr><td>亩均税收:</td><td>${MJSS}</td></tr>" +
					"<tr><td>出让时间:</td><td>${CLSJ}</td></tr>" +
					"<tr><td>开工时间:</td><td>${KGSJ}</td></tr>" +
					"<tr><td>竣工时间:</td><td>${JGSJ}</td></tr>" +
					"<tr><td>处置建议 :</td><td>${CZJY}</td></tr>" +
					"</table>";

				var infoTemplate = new InfoTemplate("${YDDW}", content);
				var feature = new FeatureLayer("http://112.4.212.98:6080/arcgis/rest/services/KFQ/GYYD/FeatureServer/0", {
					mode: FeatureLayer.MODE_SNAPSHOT,
					outFields: ["YDDW", "JYDJ", "DKSYH", "JZMJ", "JZJD", "SZXZ", "SFGSQY", "DKMJ", "GDFS", "PHOTO", "CYLB", "JSZK", "CLSJ", "SZC",
						"CLMJ", "RJL", "JZMD", "GDZCTZ", "DJGDZCTZ", "ZCZ", "DJCZ", "ZXSSL", "DJXSSL", "LKSS", "MJSS", "KGSJ", "JGSJ", "YDL", "YSL", "YQL", "WRPFL", "SZYQ", "JYDJ"
					],
					infoTemplate: infoTemplate,
					id: "baseFeaLayer"

				});
				var layer1 = new esri.layers.ArcGISDynamicMapServiceLayer("http://112.4.212.98:6080/arcgis/rest/services/KFQ/GYYD/MapServer", {
					outFields: ["YDDW", "JYDJ", "DKSYH", "JZMJ", "JZJD", "SZXZ", "SFGSQY", "DKMJ", "GDFS", "PHOTO", "CYLB", "JSZK", "CLSJ", "SZC",
						"CLMJ", "RJL", "JZMD", "GDZCTZ", "DJGDZCTZ", "ZCZ", "DJCZ", "ZXSSL", "DJXSSL", "LKSS", "MJSS", "KGSJ", "JGSJ", "YDL", "YSL", "YQL", "WRPFL", "SZYQ", "JYDJ"
					],
					infoTemplate: infoTemplate
				});

				//根据节约等级的不同，动态显示不同的节约等级图片
				compare = function(value, key) {
					var result = "";

					switch(key) {
						case "JYDJ":
							if(result = value == "A级" || value == null) {
								result = "<img src='widgets/LayerList/images/GradeA.png'/>";
							} else if(result = value == "B级") {
								result = "<img src='widgets/LayerList/images/GradeB.png'/>";
							} else if(result = value == "C级") {
								result = "<img src='widgets/LayerList/images/GradeC.png'/>";
							} else if(result = value == "D级") {
								result = "<img src='widgets/LayerList/images/GradeD.png'/>";
							}
							break;
						case "DKMJ":
							result = value.toFixed(2);
							break;
					}
					return(result);
				};

				//控制工业用地图层显示
				var gyyd = document.getElementById("checkeBoxGYYD");
				if(gyyd.checked)
					self.map.addLayer(feature);
				on(dom.byId("checkeBoxGYYD"), "click", function() {
					if(gyyd.checked)
						self.map.addLayer(feature);
					else
						self.map.removeLayer(feature);
				});
				//用地单位图层
				var yddw = document.getElementById("checkeBoxYDDW");
				var yddwLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.appConfig.labelLayer);
				if(yddw.checked)
					self.map.addLayer(yddwLayer);
				on(dom.byId("checkeBoxYDDW"), "click", function() {
					if(yddw.checked)
						self.map.addLayer(yddwLayer);
					else
						self.map.removeLayer(yddwLayer);
				});

				//控制道路图层
				var dl = document.getElementById("checkeBoxDL");
				var dlLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.appConfig.roadLayer);
				if(dl.checked)
					self.map.addLayer(dlLayer);
				on(dom.byId("checkeBoxDL"), "click", function() {
					if(dl.checked)
						self.map.addLayer(dlLayer);
					else
						self.map.removeLayer(dlLayer);
				});
				//控制行政界线图层
				var xzjx = document.getElementById("checkeBoxXZJX");
				var xzjxLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.appConfig.XZJXLayer);
				if(xzjx.checked)
					self.map.addLayer(xzjxLayer);
				on(dom.byId("checkeBoxXZJX"), "click", function() {
					if(xzjx.checked)
						self.map.addLayer(xzjxLayer);
					else
						self.map.removeLayer(xzjxLayer);
				});

				//控制节约等级图层
				var jydj = document.getElementById("checkeBoxJYDJ");
				var jydjLayer;
				var queryTask = new QueryTask(self.appConfig.dynamicQueryLayer);
				var query = new Query();
				query.where = "OBJECTID > 0";
				query.outFields = ["*"];
				query.returnGeometry = true;

				queryTask.execute(query, showQueryResult);
				on(dom.byId("checkeBoxJYDJ"), "click", function() {
					if(jydj.checked && self.map.getLevel() >= 2)
						self.map.addLayer(jydjLayer);
					else
						self.map.removeLayer(jydjLayer);
				});
				//缩放到三级以上才显示
				self.map.on("extent-change", function() {
					if(self.map.getLevel() >= 2 && jydj.checked) {
						self.map.addLayer(jydjLayer);
					} else {
						self.map.removeLayer(jydjLayer);
					}
				})

				function showQueryResult(queryResult) {

					var markerSymbolA = new PictureMarkerSymbol("widgets/LayerList/images/A.png", 27, 27);
					var markerSymbolB = new PictureMarkerSymbol("widgets/LayerList/images/B.png", 27, 27);
					var markerSymbolC = new PictureMarkerSymbol("widgets/LayerList/images/C.png", 27, 27);
					var markerSymbolD = new PictureMarkerSymbol("widgets/LayerList/images/D.png", 27, 27);
					var length = queryResult.features.length;
					jydjLayer = new GraphicsLayer();
					var gr;
					var centroid;
					var ptGraphic;

					if(length >= 1) {
						for(var i = 0; i < length; i++) {
							var geo = queryResult.features[i];
							var jydjAttr = geo.attributes["JYDJ"];
							gr = geo.geometry;
							centroid = gr.getCentroid();
							switch(jydjAttr) {
								case "A级":
									ptGraphic = new Graphic(centroid, markerSymbolA);
									break;
								case "B级":
									ptGraphic = new Graphic(centroid, markerSymbolB);
									break;
								case "C级":
									ptGraphic = new Graphic(centroid, markerSymbolC);
									break;
								case "D级":
									ptGraphic = new Graphic(centroid, markerSymbolD);
									break;
								default:
									break;
							}
							jydjLayer.add(ptGraphic);
						}
					}
				}

			},

			destroy: function() {
				this._clearLayers();
				this.inherited(arguments);
			}

		});
		return clazz;
	});