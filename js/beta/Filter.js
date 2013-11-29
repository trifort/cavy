/**
 * @fileOverview Filter
 */
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * フィルター処理関数群
	 * @type object
	 **/
	var Filter = {
		_data: {
			canvas: null,
			context: null
		},
		/**
		 * フィルターを反映
		 * @param canvas キャンバス
		 * @param list フィルターを含む配列
		 * @example Filter.apply(canvas,[
		 * 	["blur",10],	//ぼかしを10の強さでかける
		 * 	["grayScale"]	//グレースケール
		 * ]);
		 */
		apply: function (canvas, list) {
			var canvas = canvas;
			var context = canvas.getContext("2d");
			var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			var data = imageData.data;
			this._clear(this.context);
			for (var i = 0 , len = list.length; i < len; i++) {
				var v = list[i];
				if (typeof v[1] === "undefined") {
					continue;
				}
				this[v[0]](canvas, data, v[1]);
			}
			context.putImageData(imageData, 0, 0);
		},
		/**
		 * ぼかし処理
		 * @param canvas
		 * @param data
		 * @param strength
		 */
		blur: function (canvas, data, strength) {
			var m = strength - 1;
			for (var row = 0; row < canvas.height; row++) {  // For each row
				var i = row * canvas.width * 4 + 4;  // The offset of the second pixel of the row
				for (var col = 1; col < canvas.width; col++, i += 4) { // For each column
					data[i] = (data[i] + data[i - 4] * m) / strength;     // Red pixel component
					data[i + 1] = (data[i + 1] + data[i - 3] * m) / strength;   // Green
					data[i + 2] = (data[i + 2] + data[i - 2] * m) / strength;   // Blue
					data[i + 3] = (data[i + 3] + data[i - 1] * m) / strength;   // Alpha component
				}
			}
		},
		/**
		 * グレースケール処理
		 * @param canvas
		 * @param data
		 * @param strength
		 */
		grayScale: function (canvas, data, strength) {
			for (var i = 0; i < data.length; i += 4) {
				var r = data[i];
				var g = data[i + 1];
				var b = data[i + 2];
				// CIE luminance for the RGB
				// The human eye is bad at seeing red and blue, so we de-emphasize them.
				var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
				data[i] = data[i + 1] = data[i + 2] = v
			}
		},
		/**
		 * 明度処理
		 * @param canvas
		 * @param data
		 * @param strength
		 */
		brightness: function (canvas, data, strength) {
			for (var i = 0; i < data.length; i += 4) {
				data[i] += strength;
				data[i + 1] += strength;
				data[i + 2] += strength;
			}
		},
		/**
		 * 二分化
		 * @param canvas
		 * @param data
		 * @param strength
		 */
		threshold: function (canvas, data, strength) {
			for (var i = 0; i < data.length; i += 4) {
				var r = data[i];
				var g = data[i + 1];
				var b = data[i + 2];
				var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= strength) ? 255 : 0;
				data[i] = data[i + 1] = data[i + 2] = v
			}
		},
		/**
		 * セピア処理
		 * @param canvas
		 * @param data
		 * @param strength
		 */
		sepia: function (canvas, data, strength) {
			for (var i = 0; i < data.length; i += 4) {//loop through all data
				data[i] = 0.393 * data[i] + 0.769 * data[i + 1] + 0.189 * data[i + 2];
				data[i + 1] = 0.349 * data[i] + 0.686 * data[i + 1] + 0.168 * data[i + 2];
				data[i + 2] = 0.272 * data[i] + 0.534 * data[i + 1] + 0.131 * data[i + 2];
			}
		},
		/**
		 * コントラスト
		 * @param canvas
		 * @param data
		 * @param strength
		 */
		contrast: function (canvas, data, strength) {
			for (var i = 0; i < data.length; i += 4) {//loop through all data
				var brightness = (data[i] + data[i + 1] + data[i + 2]) / 3; //get the brightness
				data[i] += brightness > 127 ? strength : -strength;
				data[i + 1] += brightness > 127 ? strength : -strength;
				data[i + 2] += brightness > 127 ? strength : -strength;
			}
		},
		/**
		 * contextをクリアする
		 * @param ctx
		 * @param width
		 * @param height
		 * @private
		 */
		_clear: function (ctx, width, height) {
			var m = (width + 255) >> 8,
				n = (height + 255) >> 8;
			while (m--) {
				var i = 0;
				for (; i < n; i++) {
					ctx.clearRect(m << 8, i << 8, 256, 256);
				}
			}
		}
	};
	cavy.Filter = Filter;
})(window);
