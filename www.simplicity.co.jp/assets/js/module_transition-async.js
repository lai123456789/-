
/*
 * Copyright (C) 2013-2018 GLIDE ARTS STUDIO.
 */

var TransitionAsync = function () {
	
	"use strict";
	
	return {
		
		_t: "",
		contentID: "",
		containerID: "",
		content: "",
		container: "",
		
		stateObj: new Object(),
		onloadCallbackFunc: "",
		DOMCallbackFunc: "",
		onloadAjaxContentCallbackFunc: "",
		popstateCallbackFunc: "",
		cancelCallbackFunc: "",
		httpReq: "",
		
		ismoved: false,
		isloading: false,
		isquit: false,
		
		init: function (container, target, onloadCallback, DOMcontentLoadedCallback, onloadAjaxContentCallback, popstateCallback, cancelCallback) {
			
			var _t = this;
			
			_t.contentID = target;
			_t.containerID = container;
			_t.onloadCallbackFunc = onloadCallback;
			_t.DOMCallbackFunc = DOMcontentLoadedCallback;
			_t.onloadAjaxContentCallbackFunc = onloadAjaxContentCallback;
			_t.popstateCallbackFunc = popstateCallback;
			_t.cancelCallbackFunc = cancelCallback;
			_t.content = document.getElementById(_t.contentID);
			_t.container = document.getElementById(_t.containerID);
			
			function popStateHandler(e) {
				if (!e || !e.state) return;
				
				var path = e.state ? e.state.path : "";
				
				if (_t.popstateCallbackFunc) {
					_t.popstateCallbackFunc(path, e);
				} else {
					_t.update(window.location, 0);
				}
			}
			window.addEventListener("popstate", popStateHandler, false);
			
		},
		
		move: function (title, url, pushstate, count) {
			var _t = this;
			_t.ismoved = true;
			this.update(url, 0, {t: title, u: url, p: pushstate, c: count});
		},
		
		push: function (arg) {
			
			var _t = this;
			var title = arg.t;
			var url = arg.u;
			var pushstate = arg.p;
			var count = arg.c;
			
			if (pushstate && !_t.isquit) {
				
				/*
				// Google Analytics (old)
				if (_gaq) {
					_gaq.push(["_trackPageview", url]); 
				}*/
				
				// Google Analytics
				if (typeof ga === "function") {
					ga('send', 'pageview', url);
				}
				
				_t.stateObj = {path: url, count:count};
				history.pushState(_t.stateObj, title, url);
				location.reload();
			}
		},
		
		update: function (url, retry, pushstateArguments) {
			
			var _t = this;
			
			_t.isquit = false;
			_t.isloading = true;
			
			// ページ固有のscriptを初期化
			if (typeof GAS_pjaxDestroyJS === "function") {
				GAS_pjaxDestroyJS();
			}
			
			
			if (window.XMLHttpRequest) {
				_t.httpReq = new XMLHttpRequest();
				if (_t.httpReq.overrideMimeType) {
					_t.httpReq.overrideMimeType("text/xml");
				}
			}
			
			_t.httpReq.open("GET.html", url, true);
			_t.httpReq.responseType = "text";
			_t.httpReq.send(null);
			_t.httpReq.onreadystatechange = function () {
				var status = _t.httpReq.status;
				var state = _t.httpReq.readyState;
				
				if (_t.isquit) {
					if (_t.cancelCallbackFunc) {
						_t.cancelCallbackFunc();
					}
					return false;
				}
				if (state === 4) {
					// OK
					if (status === 200) {
						_t.push(pushstateArguments);
						if (document.getElementById(_t.contentID) && document.getElementById(_t.containerID)) {
							var c = document.getElementById(_t.contentID);
							if (c) {
								document.getElementById(_t.containerID).removeChild(c);
							} else {
								// console.log("error 'c' is undefined");
								return ;
							}
						}
						onloadAjaxContent(_t.httpReq.responseText);
						
					// ERROR
					} else {
						
						if (status === 403 || status === 404 || status === 500) {
							onError(status)
							return false;
						}
						
						_t.httpReq.abort();
						
						if (retry < 5) { // retry;
							retry += 1
							setTimeout(function() {
								_t.update(url, retry, pushstateArguments);
							}, 100);
						} else {
							location.reload();
						}
					}
				}
			}
			
			function onError(status) {
				var msg;
				
				_t.cancel();
				
				if (_t.cancelCallbackFunc) {
					if (status === 403) {
						msg = "403 Forbidden.";
						
					} else if (status === 404) {
						msg = "404 Not found.";
						
					} else if (status === 500) {
						msg = "500 Internal Server error.";
						
					} else {
						msg = "[Error] THHP Status code: " + status;
					}
					_t.cancelCallbackFunc(msg);
				}
				console.error(msg);
				return false;
			}
			
			function onloadAjaxContent(data) {
				
				var container = document.getElementById(_t.containerID);
				var clone;
				var doc = data.replaceAll(/[\n\r]/," ").replaceAll(/\t/,"");
				var head = new String(doc.match(/<head.+?<\/head>/));
				var title = doc.replace(/<!DOCTYPE(.+)((<title+?>)|(<title.+?>))/, "").replace(/<\/title>.*<\/html>/, "");
				var body = doc.replace(/<!DOCTYPE(.+)((<body+?>)|(<body.+?>))/, "").replace(/<\/body><\/html>/, "");
				var newCSSElements = new Array();
				var newCSSLoadedElements = new Array();
				var newScriptElements = new Array();
				var newScriptLoadedElements = new Array();
				var query = "";
				
				if (_t.onloadAjaxContentCallbackFunc) {
					_t.onloadAjaxContentCallbackFunc(_t.httpReq.responseText);
				}
				
				if (_t.isquit) {
					if (_t.cancelCallbackFunc) {
						_t.cancelCallbackFunc();
					}
					return false;
				}
				
				function deleteElement(tagName) {
					if (_t.isquit) {
						if (_t.cancelCallbackFunc) {
							_t.cancelCallbackFunc();
						}
						return false;
					}
					
					var elements = document.getElementsByTagName(tagName);
					var l = elements.length;
					for (var i = l; i > 0; i--) {
						var e = elements[i-1];
						var parent = e.parentNode;
						var data = e.getAttribute("data-type");
						
						if(data === "unique") {
							parent.removeChild(e);
						}
					}
					
				}
				
				deleteElement("link");
				deleteElement("script");
				
				(function() {
					if (_t.isquit) {
						_t.cancel();
						if (_t.cancelCallbackFunc) {
							_t.cancelCallbackFunc();
						}
						return false;
					}
					
					while (head.match(/<link.+?>/)) {
						var c = getPathString(/<link.+?>/ , /href=".+?"/);
						var e = new String(head.match(/<link.+?>/));
						var q = "";
						if (navigator.userAgent.toLowerCase().indexOf("msie") > 0 === "msie") {
							q = "?date=" + new Date().getTime();
						}
						try {
							
							if (e.indexOf("stylesheet") > -1) {
								var es = document.getElementsByTagName("link");
								var l = es.length;
								var f = false;
								for (var i = 0; i < l; i++) {
									if (es[i].getAttribute("href") === c) {
										f = true;
										break;
									}
								}
								if (!f) {
									var elm = document.createElement("link");
									elm.setAttribute("rel", "stylesheet");
									elm.setAttribute("type", "text/css");
									elm.setAttribute("media", "all");
									elm.setAttribute("href", c + q);
									elm.setAttribute("data-type", "unique");
									document.getElementsByTagName("head")[0].appendChild(elm)
									newCSSElements[newCSSElements.length] = elm;
									var dummy = document.createElement("img");
									dummy.onerror = function (e) {
										CSSElementOnloadComplete(e);
									}
									dummy.src = c + q;
								}
							}
						} catch (e) {
							alert(e);
						}
						
						// ソースから削除
						head = head.replace(/<link.+?>/,"");
					}
					
					// Next
					if (newCSSElements.length === 0) {
						addScriptElements();
					}
					
					function CSSElementOnloadComplete(e) {
						newCSSLoadedElements.push(e);
						if (newCSSElements.length === newCSSLoadedElements.length) {
							addScriptElements();
						}
					}
				})();
				
				function addScriptElements() {
					
					if (_t.isquit) {
						if (_t.cancelCallbackFunc) {
							_t.cancelCallbackFunc();
						}
						return false;
					}
					
					while (head.match(/<script.+?>/)) {
						
						if (navigator.userAgent.toLowerCase().indexOf("msie") > 0 === "msie") {
							q = "?date=" + new Date().getTime();
						}
						
						var script = head.match(/<script.+?>/);
						var c = getPathString(/<script.+?>/ , /src=".+?"/);
						var q = "";
						
						if (new String(script).indexOf("unique") > -1) {
							var elm = document.createElement("script");
							elm.setAttribute("src", c + q);
							elm.setAttribute("data-type", "unique");
							elm.addEventListener("load", onloadScriptElement, false);
							elm.addEventListener("error", onErrorScriptElement, false);
							document.getElementsByTagName("head")[0].appendChild(elm)
							newScriptElements[newScriptElements.length] = elm;
						}
						
						head = head.replace(/<script.+?>/,"");
					}
					
					// Next
					if (newScriptElements.length === 0) {
						end();
					}
					
					function onloadScriptElement(e) {
						ScriptElementOnloadComplete(e);
					}
					
					function onErrorScriptElement(e) {
						ScriptElementOnloadComplete(e);
					}
					
					function ScriptElementOnloadComplete(e) {
						e.target.removeEventListener("load", onloadScriptElement, false);
						e.target.removeEventListener("error", onloadScriptElement, false);
						newScriptLoadedElements.push(e);
						if (newScriptElements.length === newScriptLoadedElements.length) {
							end();
						}
					}
				}
				
				function end() {
					
					if (_t.isquit) {
						if (_t.cancelCallbackFunc) {
							_t.cancelCallbackFunc();
						}
						return false;
					}
					
					var meta = document.getElementsByTagName("meta");
					
					for (var i = 0; i < meta.length; i++) {
						if (meta[i].getAttribute("property")) {
							var prop = meta[i].getAttribute("property");
							
							if(prop.indexOf("og:title") > -1){
								meta[i].setAttribute("content", title);
							}
							if(prop.indexOf("og:url") > -1){
								meta[i].setAttribute("content", location.href);
							}
						}
					}
					
					_t.container.innerHTML = body;
					clone = document.getElementById(_t.contentID).cloneNode(true);
					document.getElementById(_t.containerID).innerHTML = "";
					document.getElementsByTagName("title")[0].innerHTML = title;
					_t.container.appendChild(clone);
					
					
					if (_t.DOMCallbackFunc) {
						_t.DOMCallbackFunc(data);
					}
					
					if (typeof GAS_pjaxDOMContentLoaded === "function") {
						GAS_pjaxDOMContentLoaded();
					}
					
					PreloadImages(_t.contentID, finish);
				}
				
				function PreloadImages(targetNode, callback) {
					
					if (_t.isquit) {
						if (_t.cancelCallbackFunc) {
							_t.cancelCallbackFunc();
						}
						return false;
					}
					
					var id;
					var imgSrcs      = new Array();
					var loadedImages = new Array();
					var loadedCount  = 0;
					var area         = typeof targetNode === "string" ? document.getElementById(targetNode) : targetNode;
					var images       = area.getElementsByTagName("img");
					var l            = images.length;
					
					if (l === 0) {
						callback();
					}
					
					for (var i = 0; i < l; i++) {
						var date = new Date();
						var img = new Image();
						var query = "";
						imgSrcs[i] = images[i].getAttribute("src");
						if (navigator.userAgent.toLowerCase().indexOf("msie") > 0 === "msie") {
							query = "?date=" + date.getTime();
						}
						img.onload = img.onerror = function () {onloadItem(this.number);}
						img.src = imgSrcs[i] + query;
						img.number = i;
					}
					
					function onloadItem(num) {
						if (_t.isquit) {
							if (_t.cancelCallbackFunc) {
								_t.cancelCallbackFunc();
							}
							return false;
						}
						
						loadedCount++;
						loadedImages[num] = num;
						
						if (loadedCount === l && callback) callback();
					}
					
					function getChildNodes(element) {
						var childNodes;
						for (var i = 0; i < 10; i++) {
							if (element.childNodes[i].tagName != undefined) {
								childNodes = element.childNodes[i];
								break;
							}
						}
						return childNodes;
					}
				}
				
				function finish() {
					// 10. onload
					_t.isloading = false;
					
					if (typeof GAS_pjaxOnLoadComplete === "function") {
						GAS_pjaxOnLoadComplete();
					}
					
					
					if (_t.onloadCallbackFunc) {
						_t.onloadCallbackFunc();
					}
				}
				
				function getPathString(regexp, attr) {
					var e = new String(head.match(regexp));
					var a = new String(e.match(attr));
					var b = new String(a.match(/".+?"/,""));
					return b.replaceAll(/"/,"");
				}
			}
		},
		
		cancel: function () {
			this.isquit = true;
			this.httpReq.abort();
		},
		
		isLoading: function () {
			return this.isloading;
		},
		
		isTransition: function () {
			return this.ismoved;
		}
	}
}

String.prototype.replaceAll = function (org, dest) {
	return this.split(org).join(dest);
}


