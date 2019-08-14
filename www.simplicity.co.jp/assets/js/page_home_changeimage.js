
var swipeObject;
var indexGallery;


if (PJAX.maincontents.isTransition() === false) {
	document.addEventListener("DOMContentLoaded", GAS_pjaxDOMContentLoaded, false);
}

function GAS_pjaxDOMContentLoaded() {
	
	/*if (MonoTypeWebFonts) {
		//MonoTypeWebFonts.cleanup();
		//MonoTypeWebFonts.RefreshFonts();
		//console.log("MonoTypeWebFonts.RefreshFonts /");
	}*/
	
	// wrapInnerText
	var mw = document.getElementsByClassName("main-wrapper")[0];
	var it = document.getElementById("intro");
	var sc = document.getElementById("section-container");
	var itws = it.getElementsByClassName("wrap-span-group");
	var scttl = sc.querySelectorAll(".body-ttl.wrap-span-group");
	var sctxt = sc.querySelectorAll(".body-txt .wrap-span-group");
	
	// #intro
	for (var i = 0; i < itws.length; i++) {
		//wrapInnerText(itws[i], 50, false, 0);
	}
	
	// #section-container : title
	for (var i = 0; i < scttl.length; i++) {
		//wrapInnerText(scttl[i], 50, false, 0);
	}
	
	// #section-container : text
	for (var i = 0; i < sctxt.length; i++) {
		//var d = 2000 / (sctxt[i].innerText.length - 1); // テキスト量に応じてディレイを相対的に変更
		//wrapInnerText(sctxt[i], 50, false, 500);
	}
	document.body.classList.add("text-wraped");
	
	// ---------------------------------------------------------------------------
	
	$(".scrollsection").each(function(i) {
		$(this).find(".body-link").clone().appendTo($(this).find(".vertical-body"));
	});
	
	$(".info-btn").on("click", function(){
		var parent = $(this).parent();
		
		if (parent.hasClass("show-info")) {
			parent.removeClass("show-info");
			parent.addClass("hide-info");
		} else {
			parent.removeClass("hide-info");
			parent.addClass("show-info");
		}
	});
	
	// ---------------------------------------------------------------------------
	
	/* iOSで下部メニューバーの高さを引いた分の高さを指定 */
	if (UA.device !== "other") {
		$("body").addClass("multitouchdevice");
		document.getElementsByClassName("section-index__list")[0].style.height = window.innerHeight + "px";
		$(".section-index__list li").height((window.innerHeight - 70) + "px");
	}
	
	// 下層ページからの遷移の場合イントロをショートカット
	if (document.body.classList.contains("showed-intro")) {
		Intro.minShow = 1000;
	}
	
	Intro.show();
}


function GAS_pjaxOnLoadComplete() {
	
	$("#sec0").removeClass("show");
	
	Infinitescroll.parent = $("#section-container")
	Infinitescroll.section = $(".scrollsection");
	Infinitescroll.init();
	
	indexGallery = new IndexGallery();
	swipeObject = new SwipeObject();
	swipeObject.init();
	
	Intro.isLoaded = true;
	Intro.checkProcess();
}


function GAS_pjaxDestroyJS() {
	$(".info-btn").off("click");
	$(".js-anchor").off("click");
	
	document.body.classList.remove("home-introEnd");
	document.body.classList.remove("home-openingEnd");
	document.body.classList.remove("home-opening");
	
	swipeObject.destroy();
	swipeObject = null;
	
	indexGallery.destroy();
	indexGallery = null;
	
	Intro.destroy();
	Intro = null;
	
	Infinitescroll.destroy();
	Infinitescroll = null;
	
	GAS_pjaxOnLoadComplete = null;
	GAS_pjaxDOMContentLoaded = null;
	GAS_pjaxDestroyJS = null;
}



var Intro = {
	
	duration: 1000,
	minShow: 5000,
	
	isTimeout: false,
	isLoaded: false,
	isStandbyIndex: false,
	timeoutId: undefined,
	
	checkProcess: function() {
		
		// ロードが完了したらインデックスを表示
		if (!Intro.isTimeout && Intro.isLoaded) {
			document.body.classList.add("home-standby");
			indexGallery.init();
		}
		
		// ロード完了、インデックスの表示、イントロの最低表示時間をクリアしたらイントロを削除
		if (Intro.isTimeout && Intro.isLoaded) {
			Intro.hide(); // resolve
			Infinitescroll.isMoveable = true;
		}
	},
	
	show: function() {
		// opening -> introEnd -> openingEnd
		document.body.classList.add("home-opening");
		
		Intro.timeoutId = setTimeout(function() {
			Intro.isTimeout = true;
			Intro.checkProcess();
		}, Intro.minShow);
		
	},
	
	hide: function() {
		var b = document.body;
		var intro = document.getElementsByClassName("intro")[0];
		b.classList.add("home-introEnd");
		document.getElementById("sec0").classList.add("show");
		intro.addEventListener("transitionend", finish, false);
		
		function finish(e) {
			if (e.propertyName === "transform") {
				//$(".intro").remove();
				b.classList.remove("home-opening");
				b.classList.add("home-openingEnd");
				b.classList.add("showed-intro");
				intro.removeEventListener("transitionend", finish, false);
			}
		}
	},
	
	destroy: function() {
		Intro.isTimeout = false;
		Intro.isLoaded = false;
		document.body.classList.remove("home-standby");
		window.clearTimeout(Intro.timeoutId);
		$(".intro").queue([]).stop();
	}
}



function IndexGallery() {
	
	return {
		
		indexDelay: 0,
		interval: 15000,
		
		intervalId: undefined,
		indexRoot: document.getElementsByClassName("section-index")[0],
		parent: document.getElementsByClassName("section-index__list")[0],
		target: document.getElementsByClassName("section-index__item"),
		event_resize: undefined,
		obj: [],
		currentIndex: 0,
		
		init: function() {
			var t = this;
			var d = t.indexDelay;
			
			for (var i = 0; i < t.target.length; i++) {
				t.obj[i] = new t.Obj(t.target[i], i);
				t.obj[i].build(i);
			}
			
			t.event_resize = function(e) {
				t.resize(t);
			}
			
			$(".section-index__list li").each(function(i) {
				/*$(this).find("img").each(function(){
					this.style.transitionDelay = (i * d) + "ms";
				});*/
				$(this).delay(i * d).queue(function(){
					$(this).addClass("-show");
				});
			});
			
			t.indexRoot.classList.add("timer-play");
			t.indexRoot.classList.remove("timer-play");
			t.nextAll(t);
		},
		
		nextAll: function(t, interval) {
			var t = this;
			var intervalNum = interval || 16;
			var len = t.obj.length;
			
			t.intervalId = setTimeout(function() {
				var len = t.target.length;
				for (var i = 0; i < len; i++) {
					t.obj[i].next(t.obj[i]);
				}
				if (t.currentIndex < len - 1) {
					t.currentIndex += 1;
				} else {
					t.currentIndex = 0;
				}
				t.nextAll(t, t.interval);
			}, intervalNum);
			
		},
		
		playTimer: function(t) {
			t.indexRoot.classList.add("timer-play");
			t.indexRoot.classList.remove("timer-play");
			t.nextAll(t, t.interval);
		},
		
		stopTimer: function(t) {
			t.indexRoot.classList.remove("timer-stop");
			t.indexRoot.classList.add("timer-stop");
			window.clearTimeout(t.intervalId);
		},
		
		Obj: function(targetElement, index) {
			
			return {
				
				index: undefined,
				target: undefined,
				images: undefined,
				current: -1,
				
				build: function(index) {
					var t = this;
					t.index = index;
					t.target = targetElement;
					t.images = targetElement.getElementsByTagName("img");
				},
				
				next: function(t) {
					var t = t;
					var len = t.images.length;
					
					if (t.current < len - 1) {
						t.current += 1;
					} else {
						t.current = 0;
					}
					
					for (var i = 0; i < len; i++) {
						if (t.current == i) {
							t.images[i].classList.add("is-selected");
						} else {
							t.images[i].classList.remove("is-selected");
						}
					}
				},
				
				// 現在の各セクションの画像を調べてクラスを付け直す
				reflesh: function() {
					
				}
			}
		},
		
		destroy: function(t) {
			$(".section-index__list li").queue([]).stop();
		}
	}
}


function SwipeObject() {
	
	return {
		
		target: undefined,
		event_resize: undefined,
		obj: [],
		
		init: function() {
			var t = this;
			t.target = document.getElementsByClassName("carousel-images");
			for (var i = 0; i < t.target.length; i++) {
				t.obj[i] = new t.Obj(t.target[i], i);
				t.obj[i].build();
			}
			t.event_resize = function(e) {
				t.resize(t);
			}
			
			window.addEventListener("resize", t.event_resize);
		},
		
		playSection: function(element, index) {
			var t = swipeObject;
			var index = index - 1; // indexを抜いた数
			var elm = element.get(0);
			var galleryIndex = indexGallery.currentIndex;
			var targetCarousel = element.get()[0].getElementsByClassName("carousel-images")[0];
			
			for (var i = 0; i < t.target.length; i++) {
				
				// 各セクションの画像を現在のインデックスに更新
				t.obj[i].select(t.obj[i], galleryIndex - 1);
				//t.obj[i].stop(t.obj[i], i);
				
				// ターゲットとなるセクションは自動再生開始
				if (t.obj[i].target === targetCarousel) {
					t.obj[i].set(t.obj[i], i);
				}
			}
		},
		
		resize: function(t) {
			for (var i = 0; i < t.target.length; i++) {
				var obj = t.obj[i];
				obj.resize(obj);
			}
		},
		
		Obj: function(targetElement, index) {
			
			return {
				index: undefined,
				target: undefined,
				li: undefined,
				
				flickObj: undefined,
				defaultSize: [0, 0],
				images: [],
				
				build: function() {
					var flickObj;
					var images;
					var flkty;
					
					t = this;
					t.index = index;
					t.target = targetElement;
					t.li = t.target.getElementsByClassName("carousel-cell");
					t.images = t.target.querySelectorAll("img");
					
					for (var i = 0; i < t.images.length; i++) {
						this.defaultSize[i] = {
							normalWidth: this.images[i].offsetWidth,
							normalHeight: this.images[i].offsetHeight
						}
						// 縦画像の判別
						var rect = this.images[i].getBoundingClientRect();
						if (rect.width < rect.height) {
							t.li[i].classList.add("vertical-image");
						}
					}
					
					t.resize(t);
					
					// 各Archiveのリストにディレイを設置
					$(".flickity-page-dots").each(function() {
						$(this).find("li").each(function(i) {
							$(this).css({transitionDelay: (0.05 * i) + "s"});
						})
					});
					
					// body-link
					var ss = document.getElementsByClassName("scrollsection__body");
					/*for (var i = 0; i < ss.length; i++) {
						var ta = ss[i].getElementsByClassName("txt-anm");
						var style = window.getComputedStyle(ta[ta.length - 1]).getPropertyValue("transition-delay");
						
						var bl = ss[i].getElementsByClassName("body-link")[0];
						if (bl !== undefined) {
							bl.style.transitionDelay = style.substr(0, style.indexOf("s") + 1);
						}
					}*/
				},
				
				resize: function(t) {
					var img, rect, ww, wh, l, margin;
					
					if (Modernizr.objectfit) {
						return;
					}
					
					if (window.matchMedia("(min-width:1024px)").matches) {
						margin = 100;
					} else {
						margin = 0;
					}
					
					for (var i = 0; i < t.li.length; i++) {
						img = t.li[i].getElementsByTagName("img")[0];
						rect = img.getBoundingClientRect();
					}
					
					rect = this.target.getBoundingClientRect();
					ww = rect.width + margin;
					wh = rect.height;
					l = this.images.length;
					
					for (var i = 0; i < l; i++) {
						(function (target, size) {
							var dw = size.normalWidth;
							var dh = size.normalHeight;
							var fixScale = Math.max(ww / dw, wh / dh);
							var w = fixScale * dw;
							var h = fixScale * dh;
							
							target.style.width = w + "px";
							target.style.left = (Math.round(ww / 2 - w / 2) - margin / 2) + "px";
							target.style.top = Math.round(wh / 2 - h / 2) + "px";
						})(this.images[i], this.defaultSize[i]);
					}
					
					//t.flickObj.flickity("resize");
				},
				
				set: function(t, index) {
					if (t.li.length > 1) {
						t.flickObj = flickObj = $(t.target).flickity({
							cellAlign: 'left',
							contain: true,
							wrapAround: true,
							prevNextButtons: true,
							pageDots: true,
							draggable: true,
							autoPlay: false,
							percentPosition: false,
							dragThreshold: 15,
							isInstant: false,
							arrowShape: { 
								x0: 20,
								x1: 65, y1: 40,
								x2: 70, y2: 35,
								x3: 30
							}
						});
					}
				},
				
				select: function(t, index) {
					//t.flickObj.flickity("select", index);
				},
				
				stop: function(t, index) {
					//t.flickObj.flickity("stopPlayer");
				},
				
				destroy: function(t) {
					t.flickObj.flickity("destroy");
					//t.flickObj = null;
				}
			}
		},
		
		destroy: function(t) {
			window.removeEventListener("resize", swipeObject.resize);
		}
	}
}
