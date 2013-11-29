/**
 * @fileOverview カルーセルUIプラグイン
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * カルーセルステージ
	 * @param container
	 * @param width
	 * @param height
	 * @param interactive
	 * @param strictEvent
	 * @param option
	 * @constructor
	 */
	var CarouselStage = function(container, width, height, interactive, strictEvent,option) {
		cavy.ScrollStage.apply(this,[container, width, height, interactive, strictEvent,option]);
	};
	CarouselStage.prototype = Object.create(cavy.ScrollStage.prototype);

	/**
	 * ScrollContainerのタッチエンド処理をオーバーライト
	 * @param e
	 * @private
	 */
	CarouselStage.prototype._touchEnd = function(e) {
		if (this.isMove) {
			var interval = e.timeStamp - this.touch.timeStamp;
			var page = 0;
			if (interval < 400) {
				var it = (this.setting.inertiaTime - interval) / this.setting.inertiaTime;
				var x = this.wrap.x + Math.ceil(this.touch.dx * it * this.setting.inertia/10);
				var y = this.wrap.y + Math.ceil(this.touch.dy * it * this.setting.inertia/10);
				var pos = this._checkLimit(x,y);
				page = Math.floor((pos.x+this.width/2) / this.width) * -1;
			} else {
				page = Math.floor((this.wrap.x+this.width/2) / this.width);
			}
			this.goTo(page);
			this.isMove = false;
		}
	};
	CarouselStage.prototype.getPage = function() {
		return -Math.floor((this.wrap.x+this.width/2) / this.width);
	};
	/**
	 * 次ページへ
	 * @param easing {boolean} イージングアニメーションの有無
	 */
	CarouselStage.prototype.next = function(easing) {
		this.goTo(this.getPage()+1,easing)
	};
	/**
	 * 前ページへ
	 * @param easing {boolean} イージングアニメーションの有無
	 */
	CarouselStage.prototype.prev = function(easing) {
		this.goTo(this.getPage()-1,easing);
	};
	/**
	 * 指定ページへ
	 * @param page {Int} ページインデックス
	 * @param easing {boolean} イージングアニメーションの有無
	 */
	CarouselStage.prototype.goTo = function(page,easing) {
		var self = this;
		var x = page * -this.width;
		var pos = this._checkLimit(x,0);
		if (this.tween) {
			this.tween.destroy();
			this.tween = null;
		}
		if (easing !== false) {
			this.tween = cavy.Tween(this.wrap).to({
				x: pos.x,
				y: pos.y
			}, "easeOutCirc", this.setting.inertiaTime).step(this._stepHandler).call(this._compHandler).call(function(){
				self.trigger("change");
			});
		} else {
			this.wrap.x = pos.x;
			this._stepHandler();
			this.trigger("change");
		}
	};

	cavy.CarouselStage = CarouselStage;
})(window);