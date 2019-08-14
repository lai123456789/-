
var DIRECTORY_LEVEL = 1; // Default : 1

////////////////////////////////////////////////////////////////////////////////

var UserAgent = function(userAgent) {
	ua: userAgent
}
UserAgent.prototype.ua = navigator.userAgent.toLowerCase();
UserAgent.prototype = {
	
	os: (function(a) {
		var o;
		if (a.ua.indexOf("win") > -1) {
			o = "win";
		} else if (a.ua.indexOf("mac") > -1) {
			o = "mac";
		} else if (a.ua.indexOf("linux") > -1) {
			o = "linux";
		} else {
			o = "other";
		}
		return o;
	})(UserAgent.prototype),
	
	browser: (function(a) {
		var b;
		if (a.ua.indexOf("msie") > -1 || a.ua.indexOf("trident") > -1) {
			b = "msie";
		} else if (a.ua.indexOf("edge") > -1) {
			b = "edge";
		} else if (a.ua.indexOf("firefox") > -1) {
			b = "firefox";
		} else if (a.ua.indexOf("safari") > -1 && a.ua.indexOf("chrome") == -1) {
			b = "safari";
		} else if (a.ua.indexOf("chrome") > -1) {
			b = "chrome";
		} else {
			b = "other";
		}
		return b;
	})(UserAgent.prototype),
	
	version: (function(a) {
		var v;
		if (a.ua.indexOf("msie") > -1) {
			v = parseInt(a.ua.substring(a.ua.indexOf("msie") + 5));
		} else if (a.ua.indexOf("trident") > -1) {
			v = parseInt(a.ua.substring(a.ua.indexOf("rv") + 3));
		} else if (a.ua.indexOf("firefox") > -1) {
			v = parseInt(a.ua.substring(a.ua.indexOf("firefox") + 8));
		} else if (a.ua.indexOf("safari") > -1 && a.ua.indexOf("chrome") == -1) {
			v = parseInt(a.ua.substring(a.ua.indexOf("version") + 8));
		} else if (a.ua.indexOf("chrome") > -1) {
			v = parseInt(a.ua.substring(a.ua.indexOf("chrome") + 7));
		} else {
			v = undefined;
		}
		return v;
	})(UserAgent.prototype),
	
	device: (function(a) {
		var d;
		if (a.ua.indexOf("iphone") > -1) {
			d = "iphone";
		} else if (a.ua.indexOf("ipod") > -1) {
			d = "ipod";
		} else if (a.ua.indexOf("ipad") > -1) {
			d = "ipad";
		} else if (a.ua.indexOf("android") > -1) {
			d = a.ua.indexOf("mobile") > -1 ? "android_mobile" : "android_tablet";
		} else {
			d = "other";
		}
		return d;
	})(UserAgent.prototype)
}
var UA = new UserAgent(navigator.userAgent.toLowerCase());


var currentPageHighlight = function(id, level) {
	
	var len = 0;
	var dirLv = level || 1;
	var URL = document.URL;
	var dirAry = URL.split("index.html");
	dirAry.shift();
	dirAry.shift();
	len = dirAry.length;
	
	var dirName = dirAry[dirLv];
	var dirDep = len - 2;
	var t = document.getElementById(id);
	
	if (t) {
		set(t);
	} else {
		t = document.getElementsByClassName(id);
		for (var i = 0; i < t.length; i++) set(t[i]);
	}
	
	function set(t) {
		//var a = t.getElementsByTagName("a");
		var a = t.querySelectorAll("a[href]");
		var aLen = a.length;
		
		for (var i = 0; i < aLen; i++) {
			var b = a[i].getAttribute("href") || "";
			var c = b.split("index.html");
			var d = c[c.length - 2] || "";
			
			if (d === dirName) {
				a[i].parentNode.classList.add("current");
			} else {
				a[i].parentNode.classList.remove("current");
			}
		}
	}
}


var Indicator = function(id, parent) {
	
	return {
		that: null,
		id: id,
		ap: parent,
		indctr: null,
		
		init: function() {
			var _t = this;
			var d = document
			var c = d.createElement("div");
			var indicator = d.createElement("span");
			c.id = _t.id;
			c.appendChild(indicator);
			c.setAttribute("class", "indicator");
			
			
			c.addEventListener("transitionend", function(e) {
				if (e.propertyName === "opacity" && parseInt(_t.getPropVal(_t.indctr, "opacity")) === 0) {
					_t.indctr.classList.remove("show");
					_t.indctr.classList.add("hide");
				}
			}, false);
			
			if (_t.ap.indexOf("#") > -1) {
				d.getElementById(_t.ap.substring(1)).appendChild(c);
			} else {
				d.getElementsByTagName(_t.ap)[0].appendChild(c);
			}
			_t.indctr = c;
			_t.indctr.classList.add("hide");
		},
		
		show: function() {
			var t = this;
			this.indctr.classList.remove("hide");
			setTimeout(function(){
				t.indctr.classList.add("show");
			}, 10);
		},
		
		hide: function() {
			this.indctr.classList.remove("show");
		},
		
		getPropVal: function(t, p) {
			return document.defaultView.getComputedStyle(t, "").getPropertyValue(p);
		}
	}
}


function setPriorityLanguage() {
	var h = document.getElementsByTagName("html")[0];
	var lang = window.navigator.languages && window.navigator.languages[0];
	
	// get browser language.
	if (lang.indexOf("ja") > -1) {
		h.classList.add("lang--ja");
	} else {
		h.classList.add("lang--no-ja");
		
		// 現在のURL
		var url = location.href.split("index.html");
		var dir = "";
		var langDir = "index.html";
		var langDirNum = 2;
		
		for (var i = 3; i < url.length; i++) {
			if (url[i] !== "") {
				dir += url[i] + "/";
			}
		}
		
		if (url[langDirNum] === "en") {
			langDir = "en/index.html";
		}
		
		var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)simplicity_redirected\s*\=\s*([^;]*).*$)|^.*$/, "$1");
		
		// 初回のみ英語版に移動
		if (cookieValue !== "1") {
			window.location = langDir + dir;
			document.cookie = "simplicity_redirected=1; max-age=100";
		}
		
	}
	
	// get geolocation in country.
	if ("geolocation" in navigator) {
		/* geolocation is available */
	} else {
		/* geolocation IS NOT available */
	}
}


function addShareElement(container, url, title) {
	
	function build(arg) {
		var li = document.createElement("li");
		var a = document.createElement("a");
		container.appendChild(li);
		li.appendChild(a);
		li.setAttribute("class", arg.className);
		a.setAttribute("href", arg.url);
		a.setAttribute("target", "_blank");
		a.setAttribute("aria-label", arg.label);
		a.innerHTML = arg.html;
		
		if (arg.customData) {
			for (var i = 0; i < arg.customData.length; i++) {
				a.setAttribute(arg.customData[i].label, arg.customData[i].value);
			}
		}
	}
	
	var url = encodeURIComponent(url);
	var title = encodeURIComponent(title);
	
	// Facebook
	build({
		url: "https://www.facebook.com/sharer/sharer.php?u=" + url + "&t=" + title,
		html: '<i class="i-svg icon" title="Facebook"><svg width="20" height="20"><use xlink:href="#icon_sns_facebook"></use></svg></i>',
		className: "share-item facebook",
		label: ""
	});
	
	// Twitter
	build({
		url:"https://twitter.com/share?text=" + title + "&url=" + url,
		html: '<i class="i-svg icon" title="Twitter"><svg width="20" height="20"><use xlink:href="#icon_sns_twitter"></use></svg></i>',
		className: "share-item twitter",
		label: ""
	});
	
	// Mail
	build({
		url: "mailto:?subject=" + title + "&body=" + url,
		html: '<i class="i-svg icon" title="Mail"><svg width="20" height="20"><use xlink:href="#icon_share_mail"></use></svg></i>',
		className: "share-item mail",
		label: "Email"
	});
}


function setScrollDirection(target) {
	
	var w = window;
	var d = document.documentElement;
	var t = target || document.getElementsByTagName("body")[0];
	var currentX = w.pageYOffset || d.scrollTop;
	var currentY = w.pageXOffset || d.scrollLeft;
	
	function onScroll() {
		
		var y = w.pageYOffset || d.scrollTop;
		
		if (y > currentY) {
			// move down
			if (!t.classList.contains("scroll-down")) {
				t.classList.remove("scroll-up");
				t.classList.add("scroll-down");
			}
			
			if (document.documentElement.scrollHeight - window.innerHeight === y) {
				t.classList.add("scroll-y-end");
			}
			
		} else {
			// move up
			if (!t.classList.contains("scroll-up")) {
				t.classList.remove("scroll-down");
				t.classList.remove("scroll-y-end");
				t.classList.add("scroll-up");
				
			}
		}
		
		if (60 > currentY) {
			t.classList.remove("scroll-down");
			t.classList.remove("scroll-y-end");
			t.classList.add("scroll-up");
		}
		
		//currentX = x;
		currentY = y;
	}
	
	w.addEventListener("scroll", onScroll, false);
	onScroll();
}


// 指定の要素が含んでいるテキストをspanで囲む。
// 指定の要素の子要素は含まれません。
function wrapInnerText(elm, delay, random, offset) {
	
	/*
	 * @ elm : string
	 * @ delay : number
	 * @ random : boolian
	 * @ offset : number
	 */
	
	var is_random = random || false;
	var delay  = delay || 20;
	var offset  = offset || 0;
	var targetGroup = elm || document.getElementsByClassName("wrap-span-group");
	var target = elm.getElementsByClassName("wrap-span");
	var strings = [];
	var count = 0;
	
	if (target.length) {
		for (var i = 0; i < target.length; i++) {
			strings[i] = wrap(target[i], i + 1);
		}
	} else {
		strings[0] = wrap(target);
	}
	
	if (is_random) {
		for (var i = 0; i < strings.length; i++) {
			for (var j = 0; j < strings[i].length; j++) {
				strings[i][j].style.transitionDelay = Math.round(Math.random() * (delay * 10)) + offset + "ms";
			}
		}
		
	} else {
		for (var i = 0; i < strings.length; i++) {
			for (var j = 0; j < strings[i].length; j++) {
				var line = parseInt(strings[i][j].getAttribute("data-line-index"));
				var index = parseInt(strings[i][j].getAttribute("data-text-index"));
				strings[i][j].style.transitionDelay = offset + (delay * (index)) + "ms";
			}
		}
	}
	
	function wrap(target, num) {
		var children = target.childNodes;
		var elm;
		var span;
		
		for (var i = 0; i < children.length; i++) {
			var cld = children[i];
			if (cld.nodeType === 3) { // TEXT_NODE
				elm = cld.textContent.replace(/(\S|\W)/g, '<span class="txt-anm" data-content="$1" data-line-index="' + num + '">$1</span>');
				cld.textContent = "";
			}
		}
		
		target.insertAdjacentHTML("beforeend", elm);
		span = target.getElementsByClassName("txt-anm");
		
		for (var i = 0; i < span.length; i++) {
			count += 1;
			span[i].setAttribute("data-text-index", count);
		}
		
		return span;
	}
	
	setTimeout(function() {
		document.body.classList.add("text-wraped");
	}, 800);
}


var PopupMenu = {
	
	te: "popup",
	tt: "popup__trigger",
	tg: "popup__target",
	na: null,
	b: null,
	time: 100,
	isSwipe: false,
	current: null,
	
	init: function() {
		var that = this;
		var d = document;
		that.b = d.getElementsByTagName("body")[0];
		that.b.addEventListener("click",  function(e) {that.onClick(e, that);}, true);
		that.b.addEventListener("mouseenter", function(e) {that.onClick(e, that);}, true);
		that.b.addEventListener("mouseleave", function(e) {that.onClick(e, that);}, true);
		that.b.addEventListener("touchend", function(e) {that.onMove(e, that);}, true);
		that.b.addEventListener("touchmove", function(e) {that.onMove(e, that);}, true);
	},
	
	onMove: function(e, t) {
		if (e.type === "touchstart") t.isSwipe = false;
		if (e.type === "touchmove") t.isSwipe = true;
		if (e.type === "touchend" && !t.isSwipe) {
			t.onClick(e, t);
		}
	},
	
	onClick: function(e, t) {
		var a = t.f.getParentAnchorElement(e, t);
		var b = t.f.getParentHasClass(e.target, e, t.tg);
		var p = t.f.getParentHasClass(a, e, t.te);
		var f = p ? p.classList.contains("anmation-end") : false; // アニメーションが終了しているかどうか
		var isActive =  p ? p.classList.contains("active") : false;
		var isHover =  p ? p.classList.contains("popup--hover") : false;
		var notElm = !f ? p : "";
		
		
		// クリックでもhover対象の場合
		if (e.type === "click" && isHover) {
			if (a.getAttribute("href")) {
				return true;
			}
			e.preventDefault();
			return false;
		}
		
		if (e.type === "mouseenter") {
			if (!isHover) return;
			if (t.current === p) {
				return;
			} else {
				t.show(e, t, p, f);
			}
			t.current = p;
			return false;
			
		} else if (e.type === "mouseleave") {
			if (t.current === p) return;
			if (!p && t.current == e.target) {
				t.hide(e, t, e.target, f);
				t.current = null;
				return;
			}
			if (!isHover) return;
		}
		
		if (!f) {
			if (!b) {
				t.clearAll(a, e, t, notElm);
			}
			if (!p) return false;
		}
		
		
		if (e.type === "touchend") f = false;
		if (e.target.getAttribute("href")) {
			
			return true;
		}
		
		if (e.type === "click") e.preventDefault();
		
		t.toggle(e, t, p, f);
		return true;
	},
	
	toggle: function(e, t, p, f) {
		var c = $(p).find("." + t.tg).get(0);
		if (f) {
			p.classList.remove("anmation-end", "active");
			$(c).stop().fadeOut(t.time);
			
		} else {
			p.classList.add("active");
			t.f.setPosition(c, p);
			$(c).stop().fadeIn(t.time, function() {
				p.classList.add("anmation-end");
			});
		}
	},
	
	show: function(e, t, p, f) {
		var c = $(p).find("." + t.tg).get(0);
		p.classList.add("active");
		t.f.setPosition(c, p);
		$(c).stop().fadeIn(t.time, function() { p.classList.add("anmation-end") });
	},
	
	hide: function(e, t, p, f) {
		var c = $(p).find("." + t.tg).get(0);
		p.classList.remove("anmation-end", "active");
		$(c).stop().fadeOut(t.time);
	},
	
	clearAll: function(a, e, t, notElm) {
		var elm = document.getElementsByClassName(t.te);
		$(elm).removeClass("anmation-end active");
		$(elm).find("." + t.tg).stop().fadeOut(t.time);
	},
	
	f: {
		setPosition: function(c, p) {
			var ww = window.innerWidth;
			var pw = p.getBoundingClientRect().width;
			var displayIni = this.getPropVal(c, "display");
			var margin = 20;
			var x, w, rect;
			c.style.display = "block";
			c.style.left = "auto";
			c.style.right = "auto";
			rect = c.getBoundingClientRect();
			x = rect.left;
			w = rect.width;
			
			c.classList.remove("arrow--r", "arrow--l");
			
			// right
			if (ww < x + w) {
				c.style.right = "0px";
				c.classList.add("arrow--l");
				
			// left
			} else if(x < (w / 2)) {
				c.style.left = "0px";
				c.classList.add("arrow--r");
				
			} else {
				c.style.left = (pw / 2) - (w / 2) + "px";
			}
			c.style.display = displayIni;
		},
		
		getParentHasClass: function(t, e, className) {
			var l = this.getElementDepth(e.currentTarget, e.target);
			var pn = t;
			
			if (UA.browser === "msie") {
				
			}
			
			if (t.tagName === "svg") {
				if (UA.browser === "msie") {
					pn = t.parentNode;
				} else {
					pn = t.parentElement;
				}
				
			}
			
			for (var i = 0; i < l; i++) {
				if (!pn || !pn.classList) {
					return;
				}
				if (pn.classList.contains(className)) {
					return pn;
				} else {
					pn = pn.parentNode;
				}
			}
			return false;
		},
		
		getParentAnchorElement: function(e, t) {
			var l = this.getElementDepth(e.currentTarget, e.target);
			var pn = e.target;
			
			for (var i = 0; i < l; i++) {
				if (!pn) {
					return;
				}
				
				if (pn.tagName === ("A" || "a")) {
					return pn;
				} else {
					pn = pn.parentNode;
				}
			}
			return false;
		},
		
		getElementDepth: function(parent, child) {
			var depth = 0;
			var p = parent;
			var c = child;
			
			while (c != p) {
				depth++;
				if (c.parentNode) {
					c = c.parentNode;
				}
			}
			return depth;
		},
		
		// スタイルを取得
		getPropVal: function(t, p) {
			return document.defaultView.getComputedStyle(t, "").getPropertyValue(p);
		}
	}
}


var PJAX = {
	
	maincontents: new TransitionAsync(),
	contentIndicator: null,
	
	init: function() {
		var that = this;
		var d = document;
		var b = d.getElementsByTagName("body")[0];
		
		var pjRoot = "pushstate-root";
		var pjContainer = "pushstate-container";
		var pjContents = "pushstate-target";
		var pagingCover = "paging-cover";
		var nextPageURL = "";
		var pjaxPush = false;
		var isPopstate = false;
		var isCtrlKey = false;
		var indicatorId = "indMC";
		var indicatorBgImg = "assets/img/global/indicator_k.png";
		
		var BgPreload = new Image();
		BgPreload.src = indicatorBgImg;
		
		// 最初のアクセスの場合stateオブジェクトが無いので最初のアドレスを登録
		if (!history.state && history.replaceState) {
			history.replaceState({
				path: location.pathname,
				count: 0
			}, "", location.pathname);
		}
		
		////////////////////////////////////////////////////////////////////////////////////////////////
		// TransitionAsync callback
		////////////////////////////////////////////////////////////////////////////////////////////////
		
		var historycount = history.state ? history.state.count : 0;
		var mcContentHTML;
		
		if (historycount == undefined) {
			historycount = 0;
			history.state.count = 0;
		}
		
		var onloadStart = function() {
			var b = d.getElementsByTagName("body")[0];
			var t = d.getElementById(pjRoot);
			var p = isPopstate ? " popstate" : "";
			var g = d.getElementById("global-header");
			
			if (nextPageURL == undefined) {
				nextPageURL = location.pathname;
			}
			
			//Webfont.destroy();
			
			(function() {
				
				if (!p) {
					b.classList.remove("popstate-forward");
					historycount++; // popstate
				}
				
				t.setAttribute("class", "onloadstart" + p);
				that.maincontents.move("", nextPageURL, pjaxPush, historycount);
			})();
		}
		
		var onloadAjaxContent = function(data) {
			var b = d.getElementsByTagName("body")[0];
			
			if (!b.classList.contains("onPopstate")) {
				window.scrollTo(0, 0);
			}
			addClass_to_parentcontainer(pjRoot, "onloadajaxcontent");
			currentPageHighlight("global-header", DIRECTORY_LEVEL);
		}
		
		var onReady = function(data) {
			addClass_to_parentcontainer(pjRoot, "onready");
			d.getElementById(indicatorId).classList.remove("show");
			d.getElementById(indicatorId).classList.add("hide");
			
			MAIN.PageTitle.change();
			MAIN.Progress.init({
				background: true // 背景画像も監視対象に含める場合はtrue デフォルトはfalse
			});
			
			//Webfont.set();
			ResetPages();
		}
		
		var onloadComplete = function() {
			d.getElementById(pjRoot).style.height = "auto";
			addClass_to_parentcontainer(pjRoot, "onloadcomplete");
			that.contentIndicator.hide();
		}
		
		var onPopstate = function(url, event) {
			
			var t = d.getElementById(pjRoot);
			var b = d.getElementsByTagName("body")[0];
			var gh = d.getElementById("global-header");
			var pc = d.getElementById(pjRoot);
			
			setTimeout(function() {
			
				if (check_back_or_forward(event) === "forward") {
					b.classList.add("popstate-forward");
					
				} else {
					b.classList.remove("popstate-forward");
				}
				currentPageHighlight("global-header", DIRECTORY_LEVEL);
				t.setAttribute("class", "");
				
				isPopstate = true;
				pjaxPush = false;
				nextPageURL = url;
				
				pc.style.height = pc.offsetHeight + "px";
				
				if (that.maincontents.isLoading()) {
					that.maincontents.cancel();
				}
				
				onloadStart();
				
			}, 20);
		}
		
		var onCancel = function(message) {
			that.contentIndicator.hide();
		}
		
		
		/*var Webfont = {
			id: "typesquare",
			head: document.getElementsByTagName("head")[0],
			
			destroy: function() {
				
				if (!document.getElementById(this.id)) {
					return;
				}
				var s = document.getElementById(this.id);
				var c = document.getElementById(this.id + "_css");
				if (s) this.head.removeChild(s);
				if (c) this.head.removeChild(c);
				s = null;
				c = null;
			},
			
			set: function() {
				var s = document.createElement("script");
				//s.src = "//typesquare.com/accessor/script/typesquare.js?cUAakVZI2UM%3D";
				s.src = "//fast.fonts.com/jsapi/d5a1d227-04ef-4ca9-8e92-abdd53261559.js";
				s.setAttribute("charset", "utf-8");
				s.id = this.id;
				this.head.appendChild(s);
			}
		}*/
		
		
		////////////////////////////////////////////////////////////////////////////////////////////////
		// TransitionAsync trigger
		////////////////////////////////////////////////////////////////////////////////////////////////
		
		function onClickHandler(e, a) {
			
			var href = a.getAttribute("href");
			var target = a.getAttribute("target");
			var gh = d.getElementById("global-header");
			var time = 500;
			var b = d.getElementsByTagName("body")[0];
			
			if (target === "_blank") {
				return false;
			}
			
			if (that.maincontents.isLoading()) {
				that.maincontents.cancel();
				return false;
			}
			
			if (href.indexOf("#") > -1 || href.indexOf("tel:") > -1 || href.indexOf("mail:") > -1) {
				return false;
			}
			
			if (a.classList.contains("no-pjax")) {
				return false;
			}
			
			if (isCtrlKey) {
				return false;
			}
			
			if (e.preventDefault) {
				e.preventDefault();
			}
			
			gh.classList.remove("-show");
			document.body.classList.remove("text-wraped");
			
			//$('html,body').animate({scrollTop: 0}, 700, "easeInOutExpo");
			nextPageURL = convertAbsoluteURL(a.getAttribute("href"));
			addClass_to_parentcontainer(pjRoot, "eraseStart");
			that.contentIndicator.show();
		}
		
		var TransitionEndObject = function() {
			return {
				callBack: null,
				targetElement: null,
				addEvent: function(tg, cb) {
					var that = this;
					that.callBack = cb;
					that.targetElement = tg;
					that.targetElement.addEventListener("transitionend", function(e) {
						
						if (this !== e.target) {
							return false;
						} else {
							return that.callBack(e);
						}
						
					}, false);
					
				},
				eventlistener: null,
				destroy: function() {
					//console.log("called destroy");
				}
			}
		}
		
		var transitionEndObject = new TransitionEndObject();
		transitionEndObject.addEvent(document.getElementById(pagingCover), TransitionEndFinish);
		
		function TransitionEndFinish(e) {
			var m = getPropVal(e.currentTarget, "opacity");
			if (e.propertyName === "opacity") {
				if (m === "1") {
					pjaxPush = true;
					onloadStart();
				}
			}
		}
		
		
		////////////////////////////////////////////////////////////////////////////////////////////////
		// TransitionAsync Init
		////////////////////////////////////////////////////////////////////////////////////////////////
		
		if (history.pushState) {
			
			this.contentIndicator = new Indicator(indicatorId, "#" + pjRoot);
			this.contentIndicator.init();
			that.contentIndicator.show();
			
			// MAIN CONTENTS / INIT
			this.maincontents.init(
				pjContainer,
				pjContents,
				onloadComplete,
				onReady,
				onloadAjaxContent,
				onPopstate,
				onCancel
			);
			
			// Body要素にクリックイベントを設定しクリック時の発生元を調べる
			b.addEventListener("click", function(e) {
				var a = getAnchorElement(e);
				if (a) {
					onClickHandler(e, a);
				}
			}, false);
		}
		
		window.addEventListener("resize", onResize, false);
		if (typeof GAS_pjaxOnLoadComplete === "function") {
			window.addEventListener("load", GAS_pjaxOnLoadComplete, false);
		}
		window.addEventListener("load", function(){
			that.contentIndicator.hide();
			addClass_to_parentcontainer(pjRoot, "onloadcomplete");
		}, false);
		
		window.addEventListener("DOMContentLoaded", function(){
			ResetPages();
			addClass_to_parentcontainer(pjRoot, "onready");
		}, false);
		
		document.addEventListener("keydown", function( e ) {
			var keyEvent = e || window.event;
			isCtrlKey = keyEvent.ctrlKey;
		}, false);
		
		
		////////////////////////////////////////////////////////////////////////////////////////////////
		// TransitionAsync Page Reset
		////////////////////////////////////////////////////////////////////////////////////////////////
		
		function ResetPages() {
			
			// Replace svg icon (IE)
			if (UA.browser === "msie") {
				$(".accordion, .uk-modal").on("shown", function() {
					$(this).find("use").each(function(i, elm) {
						$(elm).attr("xlink:href", $(elm).attr("xlink:href"));
					});
				});
			}
		}
		
		
		////////////////////////////////////////////////////////////////////////////////////////////////
		// CHECK IN METHODS
		////////////////////////////////////////////////////////////////////////////////////////////////
		
		// popstateで進んだか戻ったかを判別
		function check_back_or_forward(event) {
			
			var ca = event.state ? event.state.count : 0;
			var cb = event.state ? event.state.count : 0;
			var result;
			
			that.maincontents.stateObj.count = ca;
			
			if (ca > historycount) {
				result = "forward";
			} else {
				result = "back";
			}
			
			historycount = ca;
			return result;
		}
		
		function addClass_to_parentcontainer(target, className) {
			var t = d.getElementById(target);
			t.classList.add(className);
		}
		
		function convertAbsoluteURL(src) {
			var a = d.createElement("div");
			a.innerHTML = "<a href='" + src + "'>";
			return a.firstChild.href;
		}
		
		// スタイルを調べる
		function getPropVal(t, p) {
			return d.defaultView.getComputedStyle(t, "").getPropertyValue(p);
		}
		
		// 子から見た親要素を調べる。
		function getAnchorElement(e) {
			var l = getElementDepth(e.currentTarget, e.target);
			var pn = e.target;
			
			// クリック元がSVGの場合
			if (e.target.tagName == "svg") {
				pn = e.target.parentElement;
				l += 1;
			}
			
			for (var i = 0; i < l; i++) {
				
				if (!pn) {
					return;
				}
				if (pn.tagName === ("A" || "a")) {
					return pn;
				} else {
					pn = pn.parentNode;
				}
			}
			return false;
		}
		
		// 子から見た特定のクラスを持った親要素を調べる。
		function getHasClassParentNode(t, e, className) {
			var l = getElementDepth(e.currentTarget, e.target);
			var pn = t;
			
			// クリック元がSVGの場合
			if (t.tagName == "svg" || t.tagName == "use") {
				pn = t.parentElement;
			}
			
			for (var i = 0; i < l; i++) {
				if (!pn || !pn.classList) {
					return;
				}
				
				if (pn.classList.contains(className)) {
					return pn;
					
				} else {
					pn = pn.parentNode;
				}
			}
			return false;
		}
		
		// 子から見た親要素の総数を返す
		function getElementDepth(parent, child) {
			var depth = 0;
			var p = parent;
			var c = child;
			
			while (c != p) {
				depth++;
				c = c.parentNode;
			}
			return depth;
		}
		
		function onResize(e) {
			var wh = d.documentElement.clientHeight || d.body.clientHeight;
		}
	}
}


var MAIN = {
	
	func: {
		getPropVal: function(t, p) {
			return document.defaultView.getComputedStyle(t, "").getPropertyValue(p);
		}
	},
	
	////////////////////////////////////////////////////////////////////////////////////////////////
	// Progress
	////////////////////////////////////////////////////////////////////////////////////////////////
	
	// ページ全体のプログレスバー
	Progress: {
		
		prog: undefined, // .progress
		progInner: undefined, // progress inner wrapper
		monitorContainer: undefined, // Monitoring Target Container
		monitorElm: [], // IMG elements
		monitorElmDummy: [],
		requestId: 0,
		isComplete: false,
		
		option: {
			background: false,
			target: "div, span, section, article, header, footer, aside"
		},
		
		status: {
			value: 0,
			loaded: 0,
			total: 0
		},
		
		init: function(opt) {
			var d = document;
			var data;
			var that = this;
			var outerClass = "progress";
			var innerClass = "progress--inner";
			var appendContainer = "global-header";
			var monitoringTarget = "pushstate-root";
			
			// init
			if (this.prog) {
				this.monitorElm = [];
				this.monitorElmDummy = [];
				this.requestId = 0;
				this.isComplete = false;
				this.status = {
					value: 0,
					loaded: 0,
					total: 0
				};
				this.prog.setAttribute("class", "");
			}
			
			if (!d.getElementsByClassName(outerClass)[0]) {
				if (!this.prog) {
					this.prog = d.createElement("div"); // .progress
					this.progInner = d.createElement("span"); // progress inner
					this.prog.appendChild(this.progInner);
				}
				this.prog.setAttribute("data-monitoring-container", monitoringTarget);
				this.prog.classList.add(outerClass);
				this.progInner.classList.add(innerClass);
				document.getElementById(appendContainer).appendChild(this.prog);
				
			} else {
				this.prog = d.getElementsByClassName(outerClass)[0];
				this.progInner = d.getElementsByClassName(innerClass)[0];
			}
			
			data = this.prog.getAttribute("data-monitoring-container") || "";
			
			if (opt) {
				for (var prop in opt) {
					this.option[prop] = opt[prop];
				}
			}
			
			if (data) {
				this.monitorContainer = d.getElementById(data);
				
			} else {
				this.monitorContainer = d.getElementByTagName("body")[0];
			}
			
			if (this.option.background) {
				var elm = document.querySelectorAll(this.option.target); // 背景画像が設定されていそうな要素を取得
				
				for (var i = 0; i < elm.length; i++) {
					var style = window.getComputedStyle(elm[i], null).getPropertyValue("background-image");
					
					if (style !== "none") {
						this.monitorElm.push(style.substring(5, style.length - 2));
					}
				}
			}
			
			var imgs = this.monitorContainer.getElementsByTagName("img"); // ページ内のIMG要素
			for (var i = 0; i < imgs.length; i++) {
				this.monitorElm.push(imgs[i].getAttribute("src"));
			}
			
			if (imgs.length > 0) {
				this.status.total = this.monitorElm.length;
			} else {
				this.status.total = 0;
				this.status.value = 100;
				this.status.loaded = 100;
			}
			
			for (var i = 0; i < this.monitorElm.length; i++) {
				that.monitorElmDummy[i] = new Image();
				that.monitorElmDummy[i].src = that.monitorElm[i];
				that.monitorElmDummy[i].addEventListener("load", that.loaded, false);
				that.monitorElmDummy[i].addEventListener("error", that.error, false);
			}
			
			this.update(this);
		},
		
		loaded : function(e) {
			MAIN.Progress.status.loaded += 1;
		},
		
		error : function(e) {
			MAIN.Progress.status.loaded += 1;
		},
		
		update: function(t) {
			t.status.value = t.status.loaded / t.status.total * 100;
			t.progInner.style.width = t.status.value + "%";
			
			// complete
			if (t.status.value >= 100) {
				t.isComplete = true;
				t.prog.classList.add("progress-complete");
				t.remove(t);
				return true;
			}
			
			t.requestId = window.requestAnimationFrame(function(){
				t.update(t);
			});
			
		},
		
		remove: function(t) {
			window.cancelAnimationFrame(t.requestId);
			for (var i = 0; i < t.monitorElm.length; i++) {
				t.monitorElmDummy[i].removeEventListener("load", t.loadedImage, false);
			}
		}
	},
	
	////////////////////////////////////////////////////////////////////////////////////////////////
	// GlobalNavigation
	////////////////////////////////////////////////////////////////////////////////////////////////
	
	GlobalNavigation: {
		
		an: null,
		gh: null,
		gw: null,
		ma: null,
		ol: null,
		na: null,
		ni: null,
		niobj: [],
		
		init: function() {
			var d = document;
			var that = this;
			
			that.gh = d.getElementById("global-header");
			that.gw = d.querySelector(".gnav");
			that.an = d.querySelectorAll(".gnav .anm");
			that.an2 = that.gh.getElementsByClassName("anm");
			that.ma = d.querySelectorAll(".button--menu a");
			that.ni = d.querySelectorAll(".nav-item");
			that.ol = d.createElement("div");
			that.ol.classList.add("overlay");
			that.gw.appendChild(that.ol);
			
			for (var i = 0; i < that.ma.length; i++) {
				that.ma[i].addEventListener("click", function(e) {that.onClick(e, that)}, false);
			}
			
			that.ol.addEventListener("transitionend", function(e) {
				var n = that.gh;
				var m = MAIN.func.getPropVal(e.currentTarget, "opacity");
				
				if (e.propertyName === "opacity") {
					if (m === "0"){
						n.classList.add("-hide");
						that.gh.classList.remove("-show");
						that.gw.scrollTop = 0;
					}
				}
			}, false);
			
			that.gh.classList.add("-hide");
		},
		
		onClick: function(e, t) {
			
			if (e.preventDefault) {
				e.preventDefault();
			}
			t.toggle(e, t);
			return false;
		},
		
		toggle: function(e, t) {
			var time = 0.2;
			var delay = 0.1;
			
			if (t.gh.classList.contains("-show")) {
				if (e.type === "mouseenter") {
					return;
				}
				time = 0;
				delay = 0;
				t.gh.classList.remove("-show");
				
			} else {
				t.gh.classList.remove("-hide");
				t.gh.classList.add("-show");
			}
			
			for (var i = 0; i < t.an.length; i++) {
				t.an[i].style.transitionDelay = time + (delay * i) + "s";
			}
			for (var i = 0; i < t.an2.length; i++) {
				t.an2[i].style.transitionDelay = (delay * i) + "s";
			}
		}
	},
	
	////////////////////////////////////////////////////////////////////////////////////////////////
	// Page title
	////////////////////////////////////////////////////////////////////////////////////////////////
	
	PageTitle: {
		
		subheader: undefined,
		container: undefined,
		innerNext: undefined,
		innerPrev: undefined,
		
		init: function() {
			var t = this;
			var d = document;
			
			if (d.getElementsByClassName("subheader")[0]) {
				t.subheader = d.getElementsByClassName("subheader")[0];
				
				if (d.getElementsByClassName("subheader-part-ttl")[0]) {
					t.container = d.getElementsByClassName("subheader-part-ttl")[0];
					t.container.innerText = "";
				} else {
					t.container = d.createElement("div");
					t.container.classList.add("subheader-part-ttl");
					t.subheader.appendChild(t.container)
				}
				
				t.innerNext = d.createElement("span");
				t.innerNext.classList.add("subheader-part-inner-next");
				
				t.innerPrev = d.createElement("span");
				t.innerPrev.classList.add("subheader-part-inner-prev");
				
				t.container.appendChild(t.innerNext);
				t.container.appendChild(t.innerPrev);
			}
			t.change();
		},
		
		change: function() {
			var pageTitle = document.getElementsByClassName("part-container")[0].getAttribute("data-page-name");
			
			MAIN.PageTitle.innerPrev.innerText = "";
			MAIN.PageTitle.innerNext.innerText = pageTitle;
		}
	},
	
	init: function() {
		
		var that = this;
		var d = document;
		var b = d.getElementsByTagName("body")[0];
		
		PopupMenu.init();
		MAIN.GlobalNavigation.init();
		MAIN.PageTitle.init();
		currentPageHighlight("global-header");
		
		window.addEventListener("load", function(){
			b.classList.add("load");
		}, false);
		
		that.Progress.init({
			background: false // 背景画像も監視対象に含める場合はtrue デフォルトはfalse
		});
	}
}



document.addEventListener("DOMContentLoaded", function() {
	var b = this.getElementsByTagName("body")[0];
	
	MAIN.init();
	PJAX.init();
	
	if (UA.browser !== "msie") {
		setScrollDirection();
		setPriorityLanguage();
	}
	
	b.classList.add("domContentLoaded");
});


(function() {
	
	var h = document.getElementsByTagName("html")[0];
	var w = window;
	
	if (UA.os === "win") {
		h.classList.add("windows");
	}
	if (UA.browser === "msie") {
		h.classList.add("msie");
	}
	if (UA.browser == "edge") {
		h.classList.add("edge");
	}
	if (UA.browser === "msie") {
		if (UA.version === 11) {
			h.classList.add("ie11");
		}
		if (UA.version < 11) {
			h.classList.add("under-ie11");
		}
	}
	
	if (UA.browser === "msie" && UA.version < 9) {
		h.classList.add("under-ie9");
	}
	
	h.classList.add("js");
	
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	// requestAnimationFrame polyfill by Erik Moller. fixes from Paul Irish and Tino Zijdel
	
	w.requestAnimationFrame = (function() {
		return w.requestAnimationFrame || w.webkitRequestAnimationFrame;
	})();
	
	w.cancelAnimationFrame = (function() {
		return w.cancelAnimationFrame || w.webkitCancelAnimationFrame;
	})();
	
	if (!w.requestAnimationFrame) {
		w.requestAnimationFrame = function(cb) {
			var id = window.setTimeout(cb, 1000 / 60);
			return id;
		};
	}
	
	if (!w.cancelAnimationFrame) {
		w.cancelAnimationFrame = function(id) {
			w.clearTimeout(id);
		}
	}
})();


// ------------------------------------------------------------------------------------

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','../www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-1030048-11', 'auto');
ga('send', 'pageview');

// ------------------------------------------------------------------------------------