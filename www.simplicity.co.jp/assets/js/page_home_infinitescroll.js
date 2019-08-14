
var Infinitescroll = {
	
	time: null,
	parent: null,
	section: null,
	container: null,
	mainWrapper: null,
	length: 0,
	current: null,
	index: 0,
	isAnimate: false,
	isMoveable: false,
	
	timeoutId: undefined,
	timeoutId2: undefined,
	timeoutId3: undefined,
	
	init: function () {
		
		this.length = this.section.length || 0;
		this.parent.removeClass("loading");
		
		var that = this;
		var home = this.section.eq(0);
		var pages = this.section.eq(0).nextAll();
		var l = this.length;
		var i = 0;
		var d = home.css("transition-duration");
		
		this.container = document.getElementById("section-container");
		this.current = home;
		
		if (d) {
			this.time = d.indexOf("ms") < 0 ? parseInt(d) * 1000 : parseInt(d);
		}
		
		this.mousewheel.parent = this;
		this.mousewheel.addEvent();
		
		// iOS events
		var touchStartX;
		var touchStartY;
		var touchMoveX;
		var touchMoveY;
		var touchEndX;
		var touchEndY;
		var difference = 50;
		
		// 開始時
		window.addEventListener("touchstart", function(e) {
			if (document.body.classList.contains("home-openingEnd")) {
				touchStartX = e.touches[0].pageX;
				touchStartY = e.touches[0].pageY;
			}
		}, false);
		
		// 移動時
		window.addEventListener("touchmove", function(e) {
			if (document.body.classList.contains("home-openingEnd")) {
				touchMoveX = e.changedTouches[0].pageX;
				touchMoveY = e.changedTouches[0].pageY;
			}
		}, false);
		
		// 終了時
		window.addEventListener("touchend", function(e) {
			if (document.body.classList.contains("home-openingEnd")) {
				touchEndX = e.changedTouches[0].pageX;
				touchEndY = e.changedTouches[0].pageY;
				
				if (touchStartY > touchEndY) {
					if (touchStartY > (touchEndY + difference)) {
						that.mousewheel.scrolling({deltaY: -1});
						e.preventDefault();
					}
					
				} else if (touchStartY < touchEndY) {
					if ((touchStartY + difference) < touchEndY) {
						that.mousewheel.scrolling({deltaY: 1});
						e.preventDefault();
					}
				}
			}
		}, false);
		
		// iOSでのスクロールイベントを切る
		this.mainWrapper = document.getElementsByClassName("main-wrapper")[0];
		this.mainWrapper.addEventListener('touchmove', this.noScroll, false);
		
		
		// Key events
		$(document).keydown(function (e) {
			
			var keycode;
			
			if (e === null) {
				keycode = e.keyCode;
			} else {
				keycode = e.which;
			}
			
			// PageUp key (or Down key)
			if ((keycode === 33 || keycode === 38)) {
				that.mousewheel.scrolling({deltaY: 1});
				return false;
				
			// Page Down key (or Up key)
			} else if (keycode === 34 || keycode === 40) {
				that.mousewheel.scrolling({deltaY: -1});
				return false;
				
			// Home key
			} else if (keycode === 36) {
				that.moveSectionAt(0);
				return false;
				
			// End key
			} else if (keycode === 35) {
				that.mousewheel.scrolling({deltaY: -1});
				return false;
			}
		});
		
		$(".js-backto").on("click", function(e) {
			e.preventDefault()
			that.moveSectionAt(0);
			return false;
		});
		
		$(".js-anchor").on("click", function(e) {
			if (touchStartY > (touchEndY + difference)) {
				return false;
			}
			if ((touchStartY + difference) < touchEndY) {
				return false;
			}
			
			e.preventDefault();
			var id = e.currentTarget.getAttribute("data-anchor-id");
			that.moveSectionAt(id);
			return false;
		});
		
		document.body.classList.add("is_home");
		
		this.replaceSection(this);
		this.moveSection(this);
	},
	
	mousewheel: {
		
		parent: null,
		startId: 0,
		
		addEvent: function() {
			var that = this;
			$(window).on("mousewheel", function(e) {
				e.preventDefault();
				window.scrollTo(0, 0);
				that.scrolling(e);
				return false;
			});
		},
		
		removeEvent: function() {
			var that = this;
			$(window).off("mousewheel");
		},
		
		scrolling: function (e) {
			var that = this;
			var a = this.parent.isAnimate;
			var time = this.parent.time;
			var y = e.deltaY;
			
			if (!Infinitescroll.isMoveable) {
				return false;
			}
			
			if (!a) {
				if (y > 0) {
					f(that, that.parent.up, time);
					Infinitescroll.parent.addClass("js-up");
				} else {
					f(that, that.parent.down, time);
					Infinitescroll.parent.addClass("js-down");
				}
			}
			
			function f(t, func, time) {
				t.removeEvent();
				t.parent.isAnimate = true;
				func(Infinitescroll);
				Infinitescroll.parent.removeClass("js-transitionEnd");
				
				that.parent.timeoutId3 = setTimeout(function() {
					
					// z-index調整のため、トランジションが終わるまでのフック
					Infinitescroll.parent.addClass("js-transitionEnd");
					Infinitescroll.parent.removeClass("js-down");
					Infinitescroll.parent.removeClass("js-up");
					
					t.addEvent();
					t.parent.isAnimate = false;
				}, time + 500);
			}
			
			return false
		}
	},
	
	up: function(t) {
		t.current = t.current.prev();
		t.replaceSection(t);
		t.moveSection(t);
	},
	
	down: function(t) {
		t.current = t.current.next();
		t.replaceSection(t);
		t.moveSection(t);
	},
	
	// 各セクションのスタイリングを行い移動する
	moveSection: function(t, isTargetStyled) {
		var s, v, t;
		var index = t.section.index(t.current);
		t.section.removeClass("show").removeClass("prev").removeClass("next");
		
		for (var i = 0; i < t.length; i++) {
			s = t.section.eq(i);
			// currentより前
			if (i < index) {
				t.styling.prev(s);
				
			// currentより後
			} else if (i > index) {
				t.styling.next(s);
			}
			
			// current
			if (i === index) {
				t.styling.current(s, index, isTargetStyled);
			}
		}
	},
	
	// current の index を調べて順序を変える。
	replaceSection: function(t) {
		var index = t.section.index(t.current);
		var first, last;
		
		//　現在の位置がインデックスの最初かどうか判定する
		if (index == 0) {
			first = t.section.first();
			// 最初だった場合は配列の一番最後を持ってくる
			t.section.last().insertBefore(first);
			t.section = $(".scrollsection");
			
		} else if (index >= t.length - 1) {
			last = t.section.last();
			// 最後だった場合は配列の一番最初を持ってくる
			t.section.first().insertAfter(last);
			t.section = $(".scrollsection");
		}
		
		return index;
	},
	
	// 現在の位置をコンテナの一番最初に配置し直し、順番通りにする
	resetSection: function(t) {
		
		var startSecNum = parseInt(t.current.attr("data-index")); // 基点となるセクション番号
		var newSection = [];
		
		// ループの開始は現在表示中のセクション番号から
		for (var i = startSecNum; i < t.section.length; i++) {
			newSection.push("sec" + i);
		}
		
		// 上記のあと0番目から上記ループ開始のセクションを追加
		for (var i = 0; i < startSecNum; i++) {
			newSection.push("sec" + i);
		}
		
		// 上記のあと0番目から上記ループ開始のセクションを追加
		for (var i = 0; i < newSection.length; i++) {
			var s = document.getElementById(newSection[i]);
			t.container.appendChild(s);
			if (i > 0) {
				t.styling.next($(s));
			}
		}
		return t.container.getElementsByClassName("scrollsection");
	},
	
	// 指定のセクションに移動
	moveSectionAt: function(id) {
		var t = Infinitescroll;
		var id = id;
		var targetSection = $("#" + id);
		var targetSectionIndex;
		var index = 0;
		var refreshedSections; // 更新後のセクション
		var moveToSections = [];
		
		t.isAnimate = true;
		t.section.removeClass("show").removeClass("prev").removeClass("next");
		
		// transitionを一時的に切るclassを付与
		t.container.classList.add("moveSectionAt");
		t.container.classList.add("js-downAt");
		
		// 必ず下からスライドさせるため、一旦すべての要素順を基点順にリセット
		refreshedSections = t.resetSection(t);
		
		t.timeoutId2 = setTimeout(function() {
			
			var dly = 0.25;
			var shiftY = 0;
			// transitionを元に戻す(ディレイ)
			t.container.classList.remove("moveSectionAt");
			
			// リセットしたら移動先のセクションのインデックス番号を取得
			targetSectionIndex = $("#" + id).index();
			
			// カレントとセクション一覧を更新
			t.section = $(".scrollsection");
			t.current = t.section.eq(targetSectionIndex);
			
			// スタートから目標までの動かすセクションを取得
			for (var i = 0; i < t.section.length; i++) {
				
				moveToSections[i] = refreshedSections[i];
				
				// 各セクションにディレイ設定
				moveToSections[i].style.transitionDelay = (i * dly) - dly + "s";
				
				// 目標へ移動開始
				if (i > 0 && i < targetSectionIndex) {
					t.styling.prev($(moveToSections[i]), shiftY);
					
				} else if (i == targetSectionIndex) {
					t.styling.current($(moveToSections[i]), targetSectionIndex);
					
				} else if (i > targetSectionIndex) {
					t.styling.next($(moveToSections[i]));
				}
			}
			t.container.classList.remove("js-transitionEnd");
			
			// 全セクションの移動完了後
			t.timeoutId2 = setTimeout(function() {
				
				// 各セクションのディレイ削除
				for (var i = 0; i < moveToSections.length; i++) {
					moveToSections[i].style.transitionDelay = "0s";
				}
				
				// 最後のセクションが選択された場合、
				// 一番最初のセクションが最後に行かないので再度リプレイスと
				// トランジションを切って移動し直す。
				t.container.classList.add("moveSectionAt");
				t.container.classList.add("js-transitionEnd");
				t.replaceSection(t);
				t.moveSection(t, true);
				
				setTimeout(function() {
					t.container.classList.remove("moveSectionAt");
					t.container.classList.remove("js-downAt");
					t.isAnimate = false;
				}, 32);
				
			}, (targetSectionIndex * dly * 1000) + 1000);
			
		}, 32);
	},
	
	// スタイリング
	styling: {
		
		prev: function(s, shiftY) {
			var shiftY = shiftY || 0;
			var shiftH = ($(window).height() / 4 * -1);
			s.css({transform: "translate3d(0, " + shiftH + "px, 0)"});
		},
		
		next: function(s) {
			s.css({transform: "translate3d(0, " + $(window).height() + "px, 0)"});
		},
		
		current: function(s, index, isTargetStyled) {
			var s = s;
			s.addClass("show");
			s.addClass("show-info");
			s.removeClass("hide-info");
			s.prev().addClass("prev");
			s.next().addClass("next");
			s.css({transform: "translate3d(0, 0, 0)"});
			
			if (swipeObject && indexGallery && !isTargetStyled) {
				
				if (s.hasClass("home")) {
					// インデックスだった場合タイマーを再開
					indexGallery.playTimer(indexGallery);
					document.body.classList.add("is_home");
				} else {
					// 移動先セクションの動作を開始し、インデックスのタイマーを停止
					swipeObject.playSection(s, index);
					indexGallery.stopTimer(indexGallery);
					document.body.classList.remove("is_home");
				}
			}
		}
	},
	
	noScroll: function(e) {
		e.preventDefault();
	},
	
	destroy: function() {
		Infinitescroll.time = null;
		Infinitescroll.parent = null;
		Infinitescroll.section = null;
		Infinitescroll.container = null;
		Infinitescroll.length = 0;
		Infinitescroll.current = null;
		Infinitescroll.index = 0;
		Infinitescroll.isAnimate = false;
		Infinitescroll.isMoveable = false;
		
		window.clearTimeout(Infinitescroll.timeoutId);
		window.clearTimeout(Infinitescroll.timeoutId2);
		window.clearTimeout(Infinitescroll.timeoutId3);
		
		document.body.classList.remove("is_home");
		
		Infinitescroll.mainWrapper.removeEventListener('touchmove', Infinitescroll.noScroll, false);
		
		$(window).off("scroll");
		$(window).off("mousewheel");
	}
}
