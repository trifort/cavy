/**
 * @fileOverview cavy.Ajax
 * @author yuu@creatorish
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	var Ajax = function(url,option) {
		this.url = url;
		this.xhr = new XMLHttpRequest();
		this.setting = {
			method: "GET",
			contentType: "application/x-www-form-urlencoded",
			encode: "UTF-8",
			header: {},
			cache: true,
			data: null,
			success: function() {},
			error: function() {}
		};
		this.setting = this.extend(this.setting,option);
	};
	Ajax.prototype = {
		request: function(url,option) {
			if (url) {
				if (typeof url === "string") {
					this.url = url;
				} else if(typeof url === "object") {
					option = url;
					url = this.url;
				} else {
					url = this.url;
				}
			} else {
				url = this.url;
			}
			var setting = this.setting;
			if (option) {
				setting = this.extend({},this.setting,option);
			}
			
			if (setting.method.toLowerCase() === "get" && setting.data) {
				if (url.indexOf("?") !== -1) {
					url += "&" + this.serialize(setting.data);
				} else {
					url += "?" + this.serialize(setting.data);
				}
			}
			
			this.xhr.open(setting.method,url);
			
			this.xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
			
			for (var key in setting.header) {
				this.xhr.setRequestHeader(key,setting.header[key]);
			}
			
			if (!setting.cache) {
				this.xhr.setRequestHeader("If-Modified-Since", "Tue, 01 Jun 1970 00:00:00 GMT");
			}
	
			this.xhr.setRequestHeader("Content-Type", setting.contentType + ";charset=" + setting.encode);
			this.xhr.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						setting.success(this);
					} else {
						setting.error(this);
					}
				}
			};
			this.xhr.send(this.serialize(setting.data));
		},
		abort: function() {
			this.xhr.abort();
		},
		extend: function(arg) {
			if (arguments.length < 2) {
				return arg;
			}
			if (!arg) {
				arg = {};
			}
			for (var i = 1; i < arguments.length; i++) {
				for (var key in arguments[i]) {
					if (arguments[i][key] !== null && typeof(arguments[i][key]) === "object") {
						arg[key] = this.extend(arg[key],arguments[i][key]);
					} else {
						arg[key] = arguments[i][key];
					}
				}
			}
			return arg;
		},
		serialize: function(value) {
			var sr = "";
			for (var key in value) {
				if (sr.length !== 0) {
					sr += "&";
				}
				sr += key + "=" + encodeURI(value[key]);
			}
			return sr;
		}
	};
	cavy.Ajax = Ajax;
})(window);