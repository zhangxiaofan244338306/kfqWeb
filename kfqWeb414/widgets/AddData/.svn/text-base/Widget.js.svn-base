///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Esri. All Rights Reserved.
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
define(["dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/dom",
		"dojo/query",
		"dojo/aspect",
		"dojo/Deferred",
		"dojo/dom-class",
		"jimu/portalUrlUtils",
		"jimu/portalUtils",
		"jimu/tokenUtils",
		"jimu/BaseWidget",
		"jimu/dijit/TabContainer3",
		"dijit/_WidgetsInTemplateMixin",
		"./search/SearchContext",
		"./search/util",
		"./search/SearchPane",
		"./search/AddFromUrlPane",
		"./search/AddFromFilePane",
		"./search/LayerListPane",

		"esri/layers/GraphicsLayer",
		"esri/graphic",
		"esri/tasks/QueryTask",
		"esri/tasks/query",
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/symbols/PictureMarkerSymbol",
		"esri/InfoTemplate",
		"esri/geometry/Point"
	],
	function(declare, lang, on, dom, query, aspect, Deferred, domClass, portalUrlUtils, portalUtils,
		tokenUtils, BaseWidget, TabContainer3, _WidgetsInTemplateMixin, SearchContext,
		util, SearchPane, AddFromUrlPane, AddFromFilePane, LayerListPane, GraphicsLayer,
		Graphic, QueryTask, Query, SimpleLineSymbol, SimpleFillSymbol, PictureMarkerSymbol,
		InfoTemplate, Point) {
		var graphLayer = new GraphicsLayer();
		var self;
		return declare([BaseWidget, _WidgetsInTemplateMixin], {

			name: "AddData",
			baseClass: "jimu-widget-add-data",

			_isOpen: false,
			_searchOnOpen: false,

			tabContainer: null,
			searchPane: null,
			addFromUrlPane: null,
			addFromFilePane: null,

			postCreate: function() {
				this.inherited(arguments);
			},

			startup: function() {
				if(this._started) {
					return;
				}
				var args = arguments;
				self = this;

				var txt_shigong;
				var txt_jungong;

				on(dom.byId("btn_yujing"), "click", function() {

					txt_shigong = dojo.query("#shigong")[0].value;
					txt_jungong = dojo.query("#jungong")[0].value;
					var queryTask = new QueryTask("http://192.168.1.166:6080/arcgis/rest/services/KFQ/GYYD/MapServer/0");
					var query = new Query();
					query.where = "OBJECTID > 0";
					query.outFields = ["*"];
					query.returnGeometry = true;
					queryTask.execute(query, showQueryResult);
				});
                on(dom.byId("btn_clear"), "click", function() {
                    graphLayer.clear();
                    self.map.removeLayer(graphLayer);
				});
				function showQueryResult(queryResult) {
					//this.map.removeLayer(graphLayer);
                    graphLayer.clear();
                    self.map.removeLayer(graphLayer);
                    var numCount = 0;		//计数器，统计有多少符合
					var showExtent = null;
					var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 255, 0]), 1);
					var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new dojo.Color([25, 255, 200, 0.1]));
					var markerPicSymbol = new PictureMarkerSymbol("widgets/AddData/images/warn.gif", 60, 60);
					var dateNow = Date.now();
					var infoTemplate;
					var length = queryResult.features.length;
					if(length >=1 ) {
						for(var i = 0; i < length; i++) {
							var geo = queryResult.features[i];
							var companyName = geo.attributes["YDDW"];
							var startTime = geo.attributes["KGSJ"] - 3600000; //默认时间为上午8点,减去8小时回到0点
							var endTime = geo.attributes["JGSJ"] - 3600000;

							if(startTime == null && endTime == null)
								continue;
							//在此处判断时间间隔
							if((GetStandardTime(startTime) - GetStandardTime(dateNow) > 0 && GetStandardTime(startTime) - GetStandardTime(dateNow) < txt_shigong) ||
								(GetStandardTime(endTime) - GetStandardTime(dateNow) > 0 && GetStandardTime(endTime) - GetStandardTime(dateNow) < txt_jungong)) {
								var mixSTime = new Date(startTime);
								var commonSTime = mixSTime.toLocaleDateString()
								var mixETime = new Date(endTime);
								var commonETime = mixETime.toLocaleDateString();

//								infoTemplate = new InfoTemplate(companyName,
//									"开工时间：" + commonSTime + "</br>竣工时间：" + commonETime);
//
//								geo.setInfoTemplate(infoTemplate);

								var content ="<table>"+"<tr><td>开工时间："+commonSTime+"</td><td rowspan='2'><img src='widgets/AddData/images/remind.png' style='height:50px;width:50px;margin-left:10px;'/></td></tr>"+"<tr><td>竣工时间："+commonETime +"</td></tr>"+
								"</table>"
								;
								infoTemplate = new InfoTemplate(companyName,content);
								geo.setInfoTemplate(infoTemplate);

								//生成点
								var g = geo.geometry;
								var centroid = g.getCentroid();

								var ptGraphic = new Graphic(centroid, markerPicSymbol);
								ptGraphic.setInfoTemplate(infoTemplate); //点和面都设置infotemplate，移动到要素显示
								geo.setSymbol(fill);

								graphLayer.add(geo);
								graphLayer.add(ptGraphic);
								numCount++;

								//获取查询到的所有geometry的Extent用来设置查询后的地图显示
								if(i == 0 || showExtent == null) {
									showExtent = geo.geometry.getExtent();
								} else {
									showExtent = showExtent.union(geo.geometry.getExtent());
								}

							}
						}

					}
					if (numCount == 0) {
                        //设置根据施工、竣工时间提示用户是否存在预警
                        document.getElementById('box_promptbox').innerHTML = "查询不到该信息";
                        return;
                    }
                    else
                        document.getElementById('box_promptbox').innerHTML = "";
					self.map.addLayer(graphLayer);
					//设置地图的视图范围  
					self.map.setExtent(showExtent.expand(1));
				}

				dojo.connect(graphLayer, "onMouseMove", function(evt) {
					var g = evt.graphic;
					// if (typeof(g) =="undefined")
					//     return;
					self.map.infoWindow.setContent(g.getContent());
					self.map.infoWindow.setTitle(g.getTitle());
					self.map.infoWindow.show(evt.screenPoint, self.map.getInfoWindowAnchor(evt.screenPoint));

				});
				//注册鼠标离开监听事件
				dojo.connect(graphLayer, "onMouseOut", function() {
					self.map.infoWindow.hide();
				});

				function GetStandardTime(dateString) {

					var toSec = dateString / 1000;
					var toMin = toSec / 60;
					var toHour = toMin / 60;
					var toDay = toHour / 24;
					return toDay;
				}
			},

			_checkConfig: function() {
				if(!this.config) {
					this.config = {};
				}
				var initOption = function(options, name) {
					var opt = options[name];
					if(!opt) {
						opt = options[name] = {
							allow: true,
							label: null
						};
					}
					if(typeof opt.allow !== "boolean") {
						opt.allow = true;
					}
					if(name === "Curated") {
						if(typeof opt.filter !== "string" || lang.trim(opt.filter).length === 0) {
							opt.allow = false;
						}
					}
				};
				var config = this.config;
				if(!config.scopeOptions) {
					config.scopeOptions = {};
				}
				var options = config.scopeOptions;
				initOption(options, "MyContent");
				initOption(options, "MyOrganization");
				initOption(options, "Curated");
				initOption(options, "ArcGISOnline");
				initOption(config, "addFromUrl");
				initOption(config, "addFromFile");
			},

			getSharingUrl: function() {
				var p = portalUtils.getPortal(this.appConfig.portalUrl);
				return portalUrlUtils.getSharingUrl(p.portalUrl);
			},

			_getUser: function() {
				var dfd = new Deferred();
				var portalUrl = this.appConfig.portalUrl;
				if(tokenUtils.userHaveSignInPortal(portalUrl)) {
					portalUtils.getPortal(portalUrl).getUser().then(function(user) {
						dfd.resolve(user);
					}).otherwise(function(error) {
						console.warn("AddData._getUser error:", error);
						dfd.resolve(null);
					});
				} else {
					dfd.resolve(null);
				}
				return dfd;
			},

			_initContext: function(user) {
				var dfd = new Deferred(),
					bResolve = true;
				// TODO configure this?
				var arcgisOnlineUrl = util.checkMixedContent("http://www.arcgis.com");
				var scopeOptions = this.config.scopeOptions;
				var hasUsername = (user && typeof user.username === "string" && user.username.length > 0);
				var searchContext = new SearchContext();
				var portal = portalUtils.getPortal(this.appConfig.portalUrl);
				searchContext.portal = portal;
				if(user) {
					if(typeof user.orgId === "string" && user.orgId.length > 0) {
						searchContext.orgId = user.orgId;
					}
				}
				if(hasUsername) {
					searchContext.username = user.username;
				} else {
					scopeOptions.MyContent.allow = false;
				}
				if(this.searchPane) {
					this.searchPane.searchContext = searchContext;
					this.searchPane.portal = portal;
				}
				//console.warn("AddData.portal",portal);

				var msg = this.nls.search.loadError + arcgisOnlineUrl;
				var arcgisOnlineOption = scopeOptions.ArcGISOnline;
				searchContext.allowArcGISOnline = arcgisOnlineOption.allow;
				if(portal.isPortal && searchContext.allowArcGISOnline) {
					var arcgisOnlinePortal = portalUtils.getPortal(arcgisOnlineUrl);
					if(!arcgisOnlinePortal) {
						console.warn(msg);
						searchContext.allowArcGISOnline = false;
						arcgisOnlineOption.allow = false;
					} else {
						if(!arcgisOnlinePortal.helperServices) {
							bResolve = false;
							arcgisOnlinePortal.loadSelfInfo().then(function() {
								if(!arcgisOnlinePortal.helperServices) {
									console.warn(msg);
									searchContext.allowArcGISOnline = false;
									arcgisOnlineOption.allow = false;
								} else {
									searchContext.arcgisOnlinePortal = arcgisOnlinePortal;
									//console.warn("searchContext.arcgisOnlinePortal",arcgisOnlinePortal);
								}
								dfd.resolve();
							}).otherwise(function(error) {
								searchContext.allowArcGISOnline = false;
								arcgisOnlineOption.allow = false;
								console.warn(msg);
								console.warn(error);
								dfd.resolve();
							});
						}
					}
					//console.warn("arcgisOnlinePortal",arcgisOnlinePortal);
				} else {
					if(!hasUsername && !portal.isPortal) {
						// MyOrganization and ArcGISOnline are equivalent, - PUBLIC
						if(scopeOptions.MyOrganization.allow && scopeOptions.ArcGISOnline.allow) {
							scopeOptions.MyOrganization.allow = false;
						}
					}
				}
				if(bResolve) {
					dfd.resolve();
				}
				return dfd;
			},

			_initFooter: function(parentNode, widgets) {
				if(parentNode) {
					var searchWidget = widgets.searchWidget,
						hasSearchFooter = false;
					if(searchWidget &&
						searchWidget.footerNode &&
						searchWidget.footerNode.nodeName) {
						hasSearchFooter = true;
					}
					var footerContainer = this.footerContainer = document.createElement("DIV");
					footerContainer.className = this.baseClass + "-footer";
					if(hasSearchFooter) {
						footerContainer.appendChild(searchWidget.footerNode);
					}
					var layerListBtn = document.createElement("A");
					layerListBtn.className = "layerlist-button jimu-float-trailing";
					layerListBtn.href = "#";
					layerListBtn.innerHTML = "<span class='esri-icon-layers'></span>" + this.nls.layerList.caption;
					this.own(on(layerListBtn, "click", lang.hitch(this, function(evt) {
						evt.preventDefault();
						this.showLayers();
					})));
					footerContainer.appendChild(layerListBtn);
					var messageNode = this.messageNode = document.createElement("SPAN");
					messageNode.className = "message";
					footerContainer.appendChild(messageNode);
					var targetNode = parentNode.containerNode || parentNode.domNode || parentNode;
					if(targetNode.nodeName) {
						targetNode.appendChild(footerContainer);
					}
					this.own(on(this.tabContainer, "tabChanged", lang.hitch(this, function(title) {
						this._setStatus("");
						if(hasSearchFooter) {
							searchWidget.footerNode.style.display = title === this.nls.tabs.search ? "" : "none";
						}
						if(this.nls.tabs.search === title) {
							if(hasSearchFooter) {
								searchWidget.footerNode.style.display = "";
							}
							messageNode.style.display = "none";
						} else {
							if(hasSearchFooter) {
								searchWidget.footerNode.style.display = "none";
							}
							messageNode.style.display = "";
						}
					})));
				}
			},

			_initListeners: function() {
				var self = this;
				if(this.map) {
					this.own(this.map.on("extent-change", function() {
						try {
							if(self.searchPane && self.searchPane.bboxOption.bboxToggle.get("checked")) {
								if(self._isOpen) {
									self.searchPane.search();
								} else {
									self._searchOnOpen = true;
								}
							}
						} catch(ex) {
							console.warn(ex);
						}
					}));
				}
			},

			_initTabs: function() {
				var config = this.config,
					tabs = [];
				//console.warn("config",config);

				var supportsFile = !!(window.File && window.FileReader && window.FormData);
				var allowSearch = false,
					options = config.scopeOptions;
				var chkAllowSearch = function(name) {
					if(!allowSearch) {
						if(options && options[name] && options[name].allow) {
							allowSearch = true;
						}
					}
				};
				chkAllowSearch("MyContent");
				chkAllowSearch("MyOrganization");
				chkAllowSearch("Curated");
				chkAllowSearch("ArcGISOnline");

				if(allowSearch) {
					this.searchPane = new SearchPane({
						wabWidget: this
					}, this.searchNode);
					tabs.push({
						title: this.nls.tabs.search,
						content: this.searchPane.domNode
					});
				}
				if(config.addFromUrl && config.addFromUrl.allow) {
					this.addFromUrlPane = new AddFromUrlPane({
						wabWidget: this
					}, this.urlNode);
					tabs.push({
						title: this.nls.tabs.url,
						content: this.addFromUrlPane.domNode
					});
				}
				if(supportsFile && config.addFromFile && config.addFromFile.allow) {
					this.addFromFilePane = new AddFromFilePane({
						wabWidget: this
					}, this.fileNode);
					tabs.push({
						title: this.nls.tabs.file,
						content: this.addFromFilePane.domNode
					});
				}

				var self = this;
				if(tabs.length > 0) {
					this.tabContainer = new TabContainer3({
						average: true,
						tabs: tabs
					}, this.tabsNode);
					try {
						if(tabs.length === 1 && this.tabContainer.controlNode &&
							this.tabContainer.containerNode) {
							this.tabContainer.controlNode.style.display = "none";
							this.tabContainer.containerNode.style.top = "0px";
							//console.warn("this.tabContainer",this.tabContainer);
						}
					} catch(ex1) {}
					//this.tabContainer.hideShelter();
					this.own(aspect.after(this.tabContainer, "selectTab", function(title) {
						//console.warn("selectTab",title);
						if(self.searchPane && title === self.nls.tabs.search) {
							self.searchPane.resize();
						}
					}, true));
				} else if(tabs.length === 0) {
					this.tabsNode.appendChild(document.createTextNode(this.nls.noOptionsConfigured));
				}
			},

			_setStatus: function(msg) {
				if(!this.messageNode) {
					return;
				}
				util.setNodeText(this.messageNode, msg);
				this.messageNode.title = msg;
			},

			onClose: function() {
				this._isOpen = false;
                graphLayer.clear();
				this.map.removeLayer(graphLayer);

			},

			onOpen: function() {
				var bSearch = (this.searchPane && this._searchOnOpen);
				this._isOpen = true;
				this._searchOnOpen = false;
				this.resize();
				if(bSearch) {
					this.searchPane.search();
				}
			},

			resize: function() {
				var widgetWidth = this.domNode.clientWidth,
					widgetHeight = this.domNode.clientHeight;
				if(widgetWidth > 1000) {
					domClass.remove(this.domNode, "width-768");
					domClass.add(this.domNode, "width-1200");
				} else if(widgetWidth > 768) {
					domClass.remove(this.domNode, "width-1200");
					domClass.add(this.domNode, "width-768");
				} else {
					domClass.remove(this.domNode, ["width-768", "width-1200"]);
				}

				if(widgetWidth < 420) {
					domClass.remove(this.domNode, "width-medium");
					domClass.add(this.domNode, "width-small");
				} else if(widgetWidth < 750) {
					domClass.remove(this.domNode, "width-small");
					domClass.add(this.domNode, "width-medium");
				} else {
					domClass.remove(this.domNode, ["width-small", "width-medium"]);
				}

				//console.warn("widgetWidth",widgetWidth);
				if(widgetWidth < 340) {
					domClass.add(this.domNode, "filter-placeholder-on");
				} else {
					domClass.remove(this.domNode, "filter-placeholder-on");
				}

				if(widgetHeight < 400) {
					domClass.add(this.domNode, "height-small");
				} else {
					domClass.remove(this.domNode, "height-small");
				}

				if(this.searchPane) {
					this.searchPane.resize();
				}
			},

			showLayers: function() {
				if(!this.layerListPane) {
					this.layerListPane = new LayerListPane({
						wabWidget: this
					});
					this.layerListPane.placeAt(this.domNode);
				}
				this.layerListPane.show();
			}
		});

	});