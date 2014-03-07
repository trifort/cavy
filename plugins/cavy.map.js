/**
 * @fileOverview マッププラグイン
 * @version 0.0.2
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 *
	 * @param map
	 * @param option
	 * @constructor
	 */
	var MapStage = function(container, width, height, interactive, strictEvent,option) {
		cavy.outOfRendering = false;
		cavy.Stage.apply(this,[container,width,height,interactive,strictEvent]);
		this.setting = {
			inertiaTime: 512,
			inertia: 16,
			centerX: 0.5,
			centerY: 0.5
		};

		this.map = new cavy.Sprite();
		this.layer = new cavy.Sprite();
		this.bg = new cavy.Sprite();
		this.markers = [];
		this.lock = false;
		this.touchData = {
			x: 0,
			y: 0,
			dx: 0,
			dy: 0,
			tx0: 0,
			ty0: 0,
			tx1: 0,
			ty1: 0,
			tdx: 0,
			tdy: 0,
			timeStamp: 0,
			isMove: false,
			tween: null,
			scale: 1,
			count: 0
		};
		for (var key in option) {
			this.setting[key] = option[key];
		}

		var self = this;
		this._touchStartHandler = function(e) {
			self._touchStart(e);
		};
		this._touchMoveHandler = function(e) {
			self._touchMove(e);
		};
		this._touchEndHandler = function(e) {
			self._touchEnd(e);
		};
		this._unlockHandler = function(e) {
			self.lock = false;
		};
		this.initialize();
	};
	MapStage.prototype = Object.create(cavy.Stage.prototype);
	MapStage.prototype.initialize = function() {
		this.addEventListener("touchstart", this._touchStartHandler);
		this.addEventListener("touchmove", this._touchMoveHandler);
		this.addEventListener("touchend", this._touchEndHandler);
	};
	MapStage.prototype.registMap = function(width,height,resource) {
		var w = width * resource[0].length;
		var h = height * resource.length;
		this.map.set({
			width: w,
			height: h,
			x: this.width * this.setting.centerX - width * this.setting.centerX,
			y: this.height * this.setting.centerY - height * this.setting.centerY
		});
		this.bg.set({
			width: w,
			height: h
		});
		this.layer.set({
			width: w,
			height: h
		});

		for (var i = 0; i < resource.length; i++) {
			for (var j = 0; j < resource[i].length; j++) {
				var s = new MapGrid(resource[i][j]);
				s.set({
					x: j * width,
					y: i * height,
					width: width,
					height: height,
					fitImage: true
				});
				this.bg.addChild(s);
			}
		}
		this.map.addChild(this.bg);
		this.map.addChild(this.layer);
		this.addChild(this.map);
	};
	MapStage.prototype.addMarkers = function(arr) {
		var result = [];
		for (var i = 0, len = arr.length; i < len; i++) {
			this.addMarker(arr[i]);
		}
		return result;
	};
	MapStage.prototype.addMarker = function(marker) {
		this.layer.addChild(marker);
		this.markers.push(marker);
		return marker;
	};
	MapStage.prototype.removeMarker = function(marker) {
		var index = this.markers.indexOf(marker);
		if (index !== -1) {
			this.markers.splice(index,1);
		}
		this.layer.removeChild(marker);
		return marker;
	};
	MapStage.prototype.removeMarkers = function(arr) {
		var arr = [];
		for (var i = 0, len = arr.length; i < len; i++) {
			arr.push(this.removeMarker(arr[i]));
		}
		return arr;
	};
	MapStage.prototype.removeAllMarkers = function() {
		return this.removeMarkers(this.map.children);
	};
	MapStage.prototype._touchStart = function(e) {
		var t = e.touches[0];
		this.touchData.count = e.touches.length;
		this.touchData.x = t.pageX;
		this.touchData.y = t.pageY;
		this.touchData.tx0 = this.touchData.x;
		this.touchData.ty0 = this.touchData.y;
		if (e.touches[1]) {
			this.touchData.tx1 = e.touches[1].pageX;
			this.touchData.ty1 = e.touches[1].pageY;
		}
		this.touchData.dx = this.touchData.dy = 0;
		this.touchData.timeStamp = e.timeStamp;
		this.touchData.isMove = false;
	};
	MapStage.prototype._touchMove = function(e) {
		if (this.lock) {return;}
		if (this.touchData.tween) {
			this.touchData.tween.destroy();
		}
		var t = e.touches[0];
		var tx = t.pageX;
		var ty = t.pageY;
		var x = tx - this.touchData.x + this.map.x;
		var y = ty - this.touchData.y + this.map.y;

		this.touchData.dx = tx - this.touchData.x;
		this.touchData.dy = ty - this.touchData.y;
		this.touchData.x = tx;
		this.touchData.y = ty;

		this.touchData.tx0 = tx;
		this.touchData.ty0 = ty;
		if (e.touches[1]) {
			this.touchData.tx1 = e.touches[1].pageX;
			this.touchData.ty1 = e.touches[1].pageY;
		}

		this.touchData.timeStamp = e.timeStamp;
		this.touchData.isMove = true;
		this.move(x,y);
	};
	MapStage.prototype._touchEnd = function(e) {
		--this.touchData.count;
		if (this.lock) {return;}
		if (this.touchData.isMove && this.touchData.count === 0) {
			var interval = e.timeStamp - this.touchData.timeStamp;
			var pos = {x:0,y:0};
			var time = this.setting.inertiaTime;
			if (interval < this.setting.inertiaTime) {
				var it = (this.setting.inertiaTime - interval) / this.setting.inertiaTime;
				var x = this.map.x + Math.ceil(this.touchData.dx * it * this.setting.inertia);
				var y = this.map.y + Math.ceil(this.touchData.dy * it * this.setting.inertia);
				pos = this._checkLimit(x,y);
				time *= it;
			} else {
				pos = this._checkLimit(this.map.x,this.map.y);
			}
			this.touchData.tween = cavy.Tween(this.map).to({
				x: pos.x,
				y: pos.y
			}, "easeOutCirc", time);
		}
		this.touchData.isMove = false;
	};

	MapStage.prototype._checkLimit = function(x,y) {
		var rect = this.map.getBoundingRect();
		if (x > 0) {
			x = 0;
		} else if (x < this.width-rect.width) {
			x = this.width-rect.width;
		}
		if (y > 0) {
			y = 0;
		} else if (y < this.height-rect.height) {
			y = this.height-rect.height;
		}
		return {
			x: x,
			y: y
		};
	};

	MapStage.prototype.update = function (t) {
		this._checkGrid();
		cavy.Stage.prototype.update.call(this);
	};
	MapStage.prototype.connectMarkers = function(width,color) {
		if (!width) {
			width = 3;
		}
		if (!color) {
			color = "#000";
		}
		var pos = [0,0];
		for (var i = 0, len = this.markers.length; i < len; i++) {
			var m = this.markers[i];
			if (i === 0) {
				pos = [m.x, m.y];
			} else {
				var d = this._getDistance(m.x, m.y,pos[0],pos[1]);
				var angle = this._getAngle(m.x, m.y,pos[0],pos[1]);
				var border = new cavy.Rectangle(d,width);
				border.set({
					backgroundColor: color,
					x: pos[0],
					y: pos[1],
					originX: 0,
					originY: 0.5,
					rotation: angle
				});
				this.layer.addChildAt(border,0);
				pos = [m.x, m.y];
			}
		}
	};

	MapStage.prototype.connectMarker = function(a,b,width,color) {
		if (!width) {
			width = 3;
		}
		if (!color) {
			color = "#000";
		}
		var d = this._getDistance(b.x, b.y, a.x, a.y);
		var angle = this._getAngle(b.x, b.y, a.x, a.y);
		var border = new cavy.Rectangle(d,width);
		border.set({
			backgroundColor: color,
			x: a.x,
			y: a.y,
			originX: 0,
			originY: 0.5,
			rotation: angle
		});
		this.layer.addChildAt(border,0);
		return border;
	};

	MapStage.prototype._getDistance = function(x1,y1,x2,y2) {
		var a = x1 - x2;
		var b = y1 - y2;
		return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
	};
	MapStage.prototype._getAngle = function(x1,y1,x2,y2) {
		var a = x1 - x2;
		var b = y1 - y2;
		return  Math.atan2(b,a) * 180 / Math.PI;
	};
	MapStage.prototype.moveTo = function(x,y) {
		if (this.lock) {return;}
		var pos = this._checkLimit(x,y);
		this.move(pos.x,pos.y);
	};
	MapStage.prototype.moveBy = function(x,y) {
		if (this.lock) {return;}
		var pos = this._checkLimit(this.map.x+x,this.map.y+y);
		this.move(pos.x,pos.y);
	};
	MapStage.prototype.center = function(x,y,duration,easing) {
		var pos = this._checkLimit(this.width / 2 - x,this.height / 2 - y);
		if (duration) {
			this.lock = true;
			cavy.Tween(this.map).to({
				x: pos.x,
				y: pos.y
			},duration,easing).call(this._unlockHandler);
		} else {
			this.move(pos.x,pos.y);
		}
	};
	MapStage.prototype.getCenter = function(x,y,duration,easing) {
		return {
			x: this.width / 2 - this.map.x,
			y: this.height/ 2 - this.map.y
		};
	};
	MapStage.prototype.move = function(x,y) {
		if (this.lock) {return;}
		this.map.x = x;
		this.map.y = y;
	};
	MapStage.prototype._checkGrid = function() {
		var l = this.bg.children.length;
		while(l--) {
			var c = this.bg.children[l];
			if (c.isLoad) {continue;}
			var rect = c.getBoundingRect();
			if (rect.right >= 0 && rect.bottom >= 0 && rect.left <= this.width+rect.width/2 && rect.top <= this.height+rect.height/2) {
				c._visible = false;
				c.load();
			} else {
				c._visible = true;
			}
		}
	};

	var MapGrid = function(src) {
		this.src = src;
		this.isLoad = false;
		cavy.Sprite.apply(this);
	};
	MapGrid.prototype = Object.create(cavy.Sprite.prototype);
	MapGrid.prototype.load = function() {
		if (!this.isLoad) {
			var img = new Image();
			img.src = this.src;
			this.source = img;
			this.isLoad = true;
		}
	};

	cavy.MapStage = MapStage;
})(window);