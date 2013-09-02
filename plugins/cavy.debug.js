/**
 * @fileOverview Debugクラス
 * @author yuu@creatorish
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * Statsクラス
	 * @private
	 * @returns {{domElement: *, update: Function}}
	 * @constructor
	 */
	var SECOND = 1000;
	// stats.js - http://github.com/mrdoob/stats.js
	// @author mrdoob / http://mrdoob.com/
	var Stats = function () {
		var j = 0, u = 2, r, C = 0, E = new Date().getTime(), w = E, f = E, m = 0, e = SECOND, i = 0, F, q, c, d, B, k = 0, G = SECOND, a = 0, A, t, p, D, l, v = 0, o = SECOND, s = 0, h, n, z, g, b, y = {fps: {bg: {r: 16, g: 16, b: 48}, fg: {r: 0, g: 255, b: 255}}, ms: {bg: {r: 16, g: 48, b: 16}, fg: {r: 0, g: 255, b: 0}}, mem: {bg: {r: 48, g: 16, b: 26}, fg: {r: 255, g: 0, b: 128}}};
		r = document.createElement("div");
		r.style.fontFamily = "Helvetica, Arial, sans-serif";
		r.style.textAlign = "left";
		r.style.fontSize = "9px";
		r.style.opacity = "0.9";
		r.style.width = "80px";
		r.style.cursor = "pointer";
		r.addEventListener("click", H, false);
		F = document.createElement("div");
		F.style.backgroundColor = "rgb(" + Math.floor(y.fps.bg.r / 2) + "," + Math.floor(y.fps.bg.g / 2) + "," + Math.floor(y.fps.bg.b / 2) + ")";
		F.style.padding = "2px 0px 3px 0px";
		r.appendChild(F);
		q = document.createElement("div");
		q.innerHTML = "<strong>FPS</strong>";
		q.style.color = "rgb(" + y.fps.fg.r + "," + y.fps.fg.g + "," + y.fps.fg.b + ")";
		q.style.margin = "0px 0px 1px 3px";
		F.appendChild(q);
		c = document.createElement("canvas");
		c.width = 74;
		c.height = 30;
		c.style.display = "block";
		c.style.marginLeft = "3px";
		F.appendChild(c);
		d = c.getContext("2d");
		d.fillStyle = "rgb(" + y.fps.bg.r + "," + y.fps.bg.g + "," + y.fps.bg.b + ")";
		d.fillRect(0, 0, c.width, c.height);
		B = d.getImageData(0, 0, c.width, c.height);
		A = document.createElement("div");
		A.style.backgroundColor = "rgb(" + Math.floor(y.ms.bg.r / 2) + "," + Math.floor(y.ms.bg.g / 2) + "," + Math.floor(y.ms.bg.b / 2) + ")";
		A.style.padding = "2px 0px 3px 0px";
		A.style.display = "none";
		r.appendChild(A);
		t = document.createElement("div");
		t.innerHTML = "<strong>MS</strong>";
		t.style.color = "rgb(" + y.ms.fg.r + "," + y.ms.fg.g + "," + y.ms.fg.b + ")";
		t.style.margin = "0px 0px 1px 3px";
		A.appendChild(t);
		p = document.createElement("canvas");
		p.width = 74;
		p.height = 30;
		p.style.display = "block";
		p.style.marginLeft = "3px";
		A.appendChild(p);
		D = p.getContext("2d");
		D.fillStyle = "rgb(" + y.ms.bg.r + "," + y.ms.bg.g + "," + y.ms.bg.b + ")";
		D.fillRect(0, 0, p.width, p.height);
		l = D.getImageData(0, 0, p.width, p.height);
		try {
			if (webkitPerformance && webkitPerformance.memory.totalJSHeapSize) {
				u = 3
			}
		} catch (x) {
		}
		h = document.createElement("div");
		h.style.backgroundColor = "rgb(" + Math.floor(y.mem.bg.r / 2) + "," + Math.floor(y.mem.bg.g / 2) + "," + Math.floor(y.mem.bg.b / 2) + ")";
		h.style.padding = "2px 0px 3px 0px";
		h.style.display = "none";
		r.appendChild(h);
		n = document.createElement("div");
		n.innerHTML = "<strong>MEM</strong>";
		n.style.color = "rgb(" + y.mem.fg.r + "," + y.mem.fg.g + "," + y.mem.fg.b + ")";
		n.style.margin = "0px 0px 1px 3px";
		h.appendChild(n);
		z = document.createElement("canvas");
		z.width = 74;
		z.height = 30;
		z.style.display = "block";
		z.style.marginLeft = "3px";
		h.appendChild(z);
		g = z.getContext("2d");
		g.fillStyle = "#301010";
		g.fillRect(0, 0, z.width, z.height);
		b = g.getImageData(0, 0, z.width, z.height);
		function I(N, M, K) {
			var J, O, L;
			for (O = 0; O < 30; O++) {
				for (J = 0; J < 73; J++) {
					L = (J + O * 74) * 4;
					N[L] = N[L + 4];
					N[L + 1] = N[L + 5];
					N[L + 2] = N[L + 6]
				}
			}
			for (O = 0; O < 30; O++) {
				L = (73 + O * 74) * 4;
				if (O < M) {
					N[L] = y[K].bg.r;
					N[L + 1] = y[K].bg.g;
					N[L + 2] = y[K].bg.b
				} else {
					N[L] = y[K].fg.r;
					N[L + 1] = y[K].fg.g;
					N[L + 2] = y[K].fg.b
				}
			}
		}

		function H() {
			j++;
			j == u ? j = 0 : j = j;
			F.style.display = "none";
			A.style.display = "none";
			h.style.display = "none";
			switch (j) {
				case 0:
					F.style.display = "block";
					break;
				case 1:
					A.style.display = "block";
					break;
				case 2:
					h.style.display = "block";
					break
			}
		}
		return{domElement: r, update: function () {
			C++;
			E = new Date().getTime();
			k = E - w;
			G = Math.min(G, k);
			a = Math.max(a, k);
			I(l.data, Math.min(30, 30 - (k / 200) * 30), "ms");
			t.innerHTML = "<strong>" + k + " MS</strong> (" + G + "-" + a + ")";
			D.putImageData(l, 0, 0);
			w = E;
			if (E > f + SECOND) {
				m = Math.round((C * SECOND) / (E - f));
				e = Math.min(e, m);
				i = Math.max(i, m);
				I(B.data, Math.min(30, 30 - (m / 100) * 30), "fps");
				q.innerHTML = "<strong>" + m + " FPS</strong> (" + e + "-" + i + ")";
				d.putImageData(B, 0, 0);
				if (u == 3) {
					v = webkitPerformance.memory.usedJSHeapSize * 9.54e-7;
					o = Math.min(o, v);
					s = Math.max(s, v);
					I(b.data, Math.min(30, 30 - (v / 2)), "mem");
					n.innerHTML = "<strong>" + Math.round(v) + " MEM</strong> (" + Math.round(o) + "-" + Math.round(s) + ")";
					g.putImageData(b, 0, 0)
				}
				f = E;
				C = 0
			}
		}}
	};
	
	var Debugger = function() {
		this.statsTimer = null;
		this.grid = false;
		this.border = false;
		this.stats = true;
		this.borderColor = "#990000";//transparent 非表示
		this.borderWidth = 2;
		this.gridSize = 10;
		this.gridColor = "#eee";	//transparent 非表示
		this.gridWidth = 1;
		this.gridOpacity = 0.3;
		this.initialize();
	};
	Debugger.prototype = {
		initialize: function() {
			var self = this;
			if (this.grid) {
				cavy.Stage.prototype._initialize = function() {
					self._initialize.apply(this);
					self.drawGrid(this.container,this.width,this.height);
				};
			}
			if (this.border) {
				cavy.Stage.prototype.render = function(s) {
					self._render.apply(this,[s]);
					self.drawRect(this.context,s);
				};
			}
			if (this.stats) {
				this.startStats();
			}
		},
		_initialize: cavy.Stage.prototype._initialize,
		_render: cavy.Stage.prototype.render,
		startStats: function() {
			if (this.statsTimer) { return; }
			var stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.left = '0px';
			stats.domElement.style.top = '0px';
			stats.domElement.style.zIndex = 500;
			document.body.appendChild(stats.domElement);
			this.statsTimer = cavy.Timer.repeat(function () {
				stats.update();
			});
		},
		stopStats: function() {
			if (this.statsTimer) {
				this.statsTimer.stop();
				this.statsTimer = null;
			}
		},
		drawGrid: function(container, w, h) {
			var stepW = Math.round(w / this.gridSize);
			var stepH = Math.round(h / this.gridSize);
			var cs = window.getComputedStyle(container).position;
			if (cs !== "absolute" && cs !== "relative" && cs !== "fixed") {
				container.style.position = "relative";
			}
			container.style.overflow = "hidden";
			var df = document.createDocumentFragment();
			var Z_INDEX = 100;
			for (var i = 0; i < stepW; i++) {
				var grid = document.createElement("div");
				grid.style.position = "absolute";
				grid.style.top = 0;
				grid.style.left = i * this.gridSize + "px";
				grid.style.width = this.gridWidth + "px";
				grid.style.height = h + "px";
				grid.style.background = this.gridColor;
				grid.style.zIndex = Z_INDEX;
				grid.style.opacity = this.gridOpacity;
				grid.style.pointerEvents = "none";
				df.appendChild(grid);
			}
			for (i = 0; i < stepH; i++) {
				var grid = document.createElement("div");
				grid.style.position = "absolute";
				grid.style.left = 0;
				grid.style.top = i * this.gridSize + "px";
				grid.style.width = w + "px";
				grid.style.height = this.gridWidth + "px";
				grid.style.background = this.gridColor;
				grid.style.zIndex = Z_INDEX;
				grid.style.opacity = this.gridOpacity;
				grid.style.pointerEvents = "none";
				df.appendChild(grid);
			}
			container.appendChild(df);
		},
		drawRect: function(ctx,target) {
			var rect = target.getBoundingRect();
			ctx.beginPath();
			ctx.lineWidth = this.borderWidth;
			ctx.strokeStyle = this.borderColor;
			ctx.rect(rect.left, rect.top, rect.width, rect.height);
			ctx.stroke();
			ctx.closePath();
		}
	};
	cavy.Debugger = new Debugger();
})(window);
