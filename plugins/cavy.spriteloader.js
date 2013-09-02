/**
 * @fileOverview cavy.spriteloader.js
 * @author yuu@creatorish
 * @version 0.0.1
 **/
(function (window) {
	window.cavy = window.cavy || {};
	/**
	 *
	 * @param id
	 * @param callback
	 * @constructor
	 */
	var SpriteLoader = function (manifest,callback) {
		this.manifest;
		this.preloader;
		this.callback;

		this.store = {};
		var self = this;
		this._loadCompleteHandler = function () {
			self._ready();
		};
		this.initialize(manifest,callback);
	};
	SpriteLoader.prototype = {
		initialize: function (manifest,callback) {
			this.store = {};
			this.manifest = manifest;
			this.callback = callback || function() {}
			var resource = this.manifest.Resource;
			if (resource) {
				this.preloader = new cavy.Preload(resource);
				this.preloader.addEventListener("complete", this._loadCompleteHandler);
			} else {
				this._ready();
			}
		},
		_ready: function() {
			for (var key in this.manifest) {
				var attrs;
				switch(key) {
					case "Resource":
						continue;
						break;
					case "Valiable":
						attrs = this.manifest[key];
						for (var val in attrs) {
							this.store[val] = attrs[val];
						}
						break;
					default:
						attrs = this.manifest[key];
						for (var name in attrs) {
							var prop = attrs[name];
							var obj = new cavy[key]();
							obj.set(prop);
							if (prop.src) {
								obj.source = this.preloader.get(prop.src);
							}
							this.store[name] = obj;
						}
						break;
				}
				
			}
			if (this.callback) {
				this.callback.apply(this,[this.store,this.prealod]);
			}
		}
	};
	cavy.SpriteLoader = SpriteLoader;
})(window);