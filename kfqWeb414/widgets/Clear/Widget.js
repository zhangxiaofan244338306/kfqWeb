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
		'dojo/_base/declare',
		'jimu/BaseWidget',
		"esri/dijit/LocateButton",
		'dojo/_base/html',
		'dojo/on',
		'dojo/_base/lang',
		'jimu/utils',
		"esri/symbols/SimpleMarkerSymbol",
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/symbols/TextSymbol",
		"esri/toolbars/draw",
		"esri/geometry/Point",
		"esri/graphic",
		"esri/Color",
		"esri/symbols/Font",
		"esri/tasks/GeometryService",
		"esri/tasks/AreasAndLengthsParameters",
		"esri/tasks/LengthsParameters"
	],
	function(declare, BaseWidget, LocateButton, html, on, lang, jimuUtils, SimpleMarkerSymbol,
		SimpleLineSymbol,
		SimpleFillSymbol,
		TextSymbol,
		Draw,
		Point,
		Graphic,
		Color,
		Font,
		GeometryService,
		AreasAndLengthsParameters,
		LengthsParameters) {
		var clazz = declare([BaseWidget], {

			name: 'MyLocation',
			baseClass: 'jimu-widget-mylocation',

			startup: function() {
				this.inherited(arguments);
				this.placehoder = html.create('div', {
					'class': 'mersureClear',
					title: this.label
				}, this.domNode);
				
				var self = this;
				this.own(on(this.placehoder, 'click', lang.hitch(this, function() {
					self.map.graphics.clear();
				})));

				

			},

			//use current scale in Tracking
			_scaleChangeHandler: function() {
				var scale = this.map.getScale();
				if(scale && this.geoLocate && this.geoLocate.useTracking) {
					this.geoLocate.scale = scale;
				}
			},

			onLocate: function(parameters) {
				html.removeClass(this.placehoder, "locating");
				if(this.geoLocate.useTracking) {
					html.addClass(this.placehoder, "tracking");
				}

				if(parameters.error) {
					console.error(parameters.error);
					// new Message({
					//   message: this.nls.failureFinding
					// });
				} else {
					html.addClass(this.domNode, "onCenter");
					this.neverLocate = false;
				}
			}

		});
		clazz.inPanel = false;
		clazz.hasUIFile = false;
		return clazz;
	});

require(["esri/layers/LabelLayer"], function(ll) {
	if(typeof esri.layers.LabelLayer.prototype._addLabel == 'function') {
		esri.layers.LabelLayer.prototype._addLabel2 = esri.layers.LabelLayer.prototype._addLabel;
		esri.layers.LabelLayer.prototype._addLabel = function(a, b, c, e, g, k, m) {
			// replace \n by <br>
			a = a.replace(/\n/g, "<br />");
			this._addLabel2(a, b, c, e, g, k, m);
		}
	}
});

require(["esri/symbols/TextSymbol", "dojox/gfx/svg"], function(ts, svg) {
	if(typeof dojox.gfx.svg.Text.prototype.setShape == 'function') {
		dojox.gfx.svg.Text.prototype.setShape = function(p) {
			this.shape = dojox.gfx.makeParameters(this.shape, p);
			this.bbox = null;
			var r = this.rawNode,
				s = this.shape;
			r.setAttribute("x", s.x);
			r.setAttribute("y", s.y);
			r.setAttribute("text-anchor", s.align);
			r.setAttribute("text-decoration", s.decoration);
			r.setAttribute("rotate", s.rotated ? 90 : 0);
			r.setAttribute("kerning", s.kerning ? "auto" : 0);
			r.setAttribute("text-rendering", "optimizeLegibility");

			while(r.firstChild)
				r.removeChild(r.firstChild);

			if(s.text) {
				var texts = s.text.replace(/<br\s*\/?>/ig, "\n").split("\n");
				var lineHeight = 1.1 * parseInt(document.defaultView.getComputedStyle(r, "").getPropertyValue("font-size"), 10);
				if(isNaN(lineHeight) || !isFinite(lineHeight))
					lineHeight = 15;

				for(var i = 0, n = texts.length; i < n; i++) {
					var tspan = (document.createElementNS ? document.createElementNS(dojox.gfx.svg.xmlns.svg, "tspan") : document.createElement("tspan"));
					tspan.setAttribute("dy", i ? lineHeight : -(texts.length - 1) * lineHeight / 2);
					tspan.setAttribute("x", s.x);
					tspan.appendChild((dojox.gfx.useSvgWeb ? document.createTextNode(texts[i], true) : document.createTextNode(texts[i])));
					r.appendChild(tspan);
				}
			}

			return this;
		}
	}
});