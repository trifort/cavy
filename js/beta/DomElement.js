/**
 * @fileOverview DomElement
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasにテキストを配置するオブジェクトクラス
	 * @constructor
	 * @alias cavy.TextObject
	 * @augments cavy.DisplayObject
	 * @param text {Object} 表示する文字列
	 * @param param {Object} 初期パラメータ
	 * @example
	 *    var t = new Text("hoge");
	 **/
	var DomElement = function (element,param) {
        this.element = element;
        if (typeof element === "string") {
            this.element = document.createElement("div");
            this.element.innerHTML = element;
        }
        this.width = this.element.clientWidth;
        this.height = this.element.clientHeight;
        this.style = this.element.style;
        this.style.position = "absolute";
        this.style.top = this.style.left = 0;
        this.style.webkitBackfaceVisibility = "hidden";
        this.style.pointerEvents = "none";
        this.style.webkitTransform = "translate3d(0,0,0)";
		cavy.InteractiveObject.apply(this, [null, param]);
	};
    DomElement.prototype = Object.create(cavy.InteractiveObject.prototype);
    DomElement.prototype.constructor = DomElement;

    DomElement.prototype.addClass = function(className) {
        var names = className.split(" "),
            l = names.length,
            cls = this.element.getAttribute("class");
        cls = cls ? cls.split(" ") : [];
        while(l--) {
            var n = names[l];
            if (cls.indexOf(n) === -1) {
                cls.push(n);
            }
        }
        this.element.setAttribute("class",cls.join(" "));
    };
    DomElement.prototype.removeClass = function(className) {
        var names = className.split(" "),
            l = names.length,
            cls = this.element.getAttribute("class");
        if (!cls) {return;}
        cls = cls.split(" ");
        while(l--) {
            var n = names[l];
            var i = cls.indexOf(n);
            if (i !== -1) {
                cls.splice(i,1);
            }
        }
        this.element.setAttribute("class",cls.join(" "));
    };
    DomElement.prototype.hasClass = function() {};
    DomElement.prototype.attr = function() {};
    DomElement.prototype.removeAttr = function() {};
    DomElement.prototype.css = function() {};
    DomElement.prototype.html = function() {};
    DomElement.prototype.appendChild = function() {};
    DomElement.prototype.removeChild = function() {};
    DomElement.prototype.clone = function() {};
    DomElement.prototype.createCache = function () {};
    DomElement.prototype.deleteCache = function () {};
    DomElement.prototype.updateContext = function () {};

    DomElement.prototype._getBoundingRect = DomElement.prototype.getBoundingRect;

    DomElement.prototype.getBoundingRect = function() {
        return this._getBoundingRect();
    };
    DomElement.prototype.draw = function (ctx) {
        if (!this.parent) {return;}
        var s = this.getStage();
        if (!this.element.parentNode) {
            s.container.appendChild(this.element);
        }
        
        if (this.parent._visible && this._visible) {
			this.style.display = "block";
			var style = window.getComputedStyle(this.element);
			this.width = parseFloat(style.width.replace("px",""));
			this.height = parseFloat(style.height.replace("px",""));
		} else {
			this.style.display = "none";
		}
		
        this.update();
        this.style.webkitTransformOrigin = this.originX*100 + "% " + this.originY*100 + "%";
        this.style.webkitTransform = this.matrix.toString3D();
	};
	cavy.DomElement = DomElement;
})(window);