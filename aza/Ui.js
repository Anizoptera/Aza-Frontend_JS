
define(["./Core", "jquery", "jquery/mainElems"], function(Aza, $)
{
	var Ui = {};


	/**
	 * Default new-line char
	 *
	 * @const
	 * @type {String}
	 */
	Ui.NL = (function() {
		var tarea = document.createElement("textarea"), res;
		tarea.value = "\n";
		res = tarea.value;
		tarea = null;
		return res;
	})();


	/**
	 * Container for all the interactive pop-ups
	 *
	 * @type {jQuery}
	 */
	Ui.$jsWrap = $('<div style="width:0;height:0;">').appendTo($.body);


	/**
	 * Hides the first element-set, and shows the second one.
	 * Or does the opposite if 'invert' is 'true'.
	 *
	 * @param {jQuery}  $elemsToHide
	 * @param {jQuery}  $elemsToShow
	 * @param {Boolean} invert
	 */
	Ui.hideShow = function($elemsToHide, $elemsToShow, invert) {
		if (invert) {
			$elemsToShow.hide();
			$elemsToHide.show();
		}
		else {
			$elemsToHide.hide();
			$elemsToShow.show();
		}
	};


	/**
	 * Returns info about page dimensions, viewport size and scroll positions.
	 * {
	 *  scrollTop:      v-scroll
	 *  scrollLeft:     h-scroll
	 *  width:          viewport width
	 *  height:         viewport height
	 *  scrollWidth:    page width
	 *  scrollHeight:   page height
	 * }
	 *
	 * @return {Object|{scrollTop, scrollLeft, width, height, scrollWidth, scrollHeight}}
	 */
	Ui.getViewport = function() {
		var docElem = document.documentElement;
		return {
			scrollTop: "pageYOffset" in window ? window.pageYOffset : docElem.scrollTop,
			scrollLeft: "pageXOffset" in window ? window.pageXOffset : docElem.scrollLeft,

			width: docElem.clientWidth,
			height: docElem.clientHeight,

			scrollWidth: docElem.scrollWidth,
			scrollHeight: docElem.scrollHeight
		}
	};

	/**
	 * Returns element bounds:
	 * {width, height, top, left, right, bottom}
	 *
	 * @param {jQuery} $elem
	 * @returns {Object}
	 */
	Ui.bounds = function($elem) {
		var res = $elem.offset();
		res.width = $elem.outerWidth();
		res.height = $elem.outerHeight();
		res.right = res.left + res.width;
		res.bottom = res.top + res.height;
		return res;
	};


	/**
	 * Загружает изображения, по завершении выполняет коллбэк
	 *
	 * <b>Изображения могут быть переданы как:</b>
	 * 1. Строка (или массив строк)
	 * <tt>Ui.loadImages("http://3run.su/1.jpg", onComplete)</tt>
	 * 2. DOM-объект (или массив DOM-объектов)
	 * <tt>Ui.loadImages(document.getElementsByTagName("IMG"), onComplete)</tt>
	 * 3. JQuery-коллекция
	 * <tt>Ui.loadImages($("img"), onComplete)</tt>
	 *
	 * Коллбэк первым параметром примет массив DOM-объектов - загруженных изображений.
	 * Изображения будут в том же порядке, что и были переданы в Aza.loadImages.
	 * Вторым параметром примет флаг наличия ошибок при загрузке.
	 *
	 * @param {*}                            images    Изображения для загрузки
	 * @param {Function=}    fn        Коллбэк.
	 *
	 * @return {Ui}
	 */
	Ui.loadImages = function(images, fn) {
		if (!Aza.isArray(images))
			images = [images];

		var len = images.length,
			out = [], error, i;

		function loadImage(src) {
			var image = new Image();

			fn && out.push(image);

			function complete() {
				// Проверяем существование изображения (предотвращаем повторное срабатывание complete)
				// Декриментим len
				// Если есть коллбэк, вызваем его с небольшой задержкой
				// (fix для вебкита, когда сразу после загрузки не определены ширина и высота)
				image && !--len && fn && setTimeout(function() {
					fn(out, !!error);
				}, 200);

				image = null;
			}

			image.onload = complete;
			image.onerror = function() {
				error = true;
				complete();
			};

			image.src = src;
		}

		for (i = 0; i < images.length; i++)
			loadImage(images[i].src ? images[i].src : images[i]);

		return Ui;
	};


	/**
	 * Scrolls to a DOM-element
	 */
	Ui.scrollTo = function($target, pads, animate, callback) {
		pads = pads || 0;

		function onComplete() {
			callback && callback($target);
		}

		var offset = $target.offset(),
			vp = Ui.getViewport(),

			ver1 = offset.top + $target.offsetHeight() - vp.height + pads,
			ver2 = offset.top - pads,

			hor1 = offset.left + $target.offsetWidth() - vp.width + pads,
			hor2 = offset.left - pads,

			newTop = Aza.norm(vp.scrollTop, Math.min(ver1, ver2), Math.max(ver1, ver2)),
			newLeft = Aza.norm(vp.scrollLeft, Math.min(hor1, hor2), Math.max(hor1, hor2));


		if (vp.scrollTop !== newTop || vp.scrollLeft !== newLeft) {
			if (animate && !Aza.browser.isMobile) {
				// body - webkit
				// html - other
				$.body.add($.docElem[0]).animate({
					scrollTop: newTop,
					scrollLeft: newLeft
				}, animate, onComplete);
			}
			else {
				window.scrollTo(newLeft, newTop);
				onComplete();
			}
		}
		else onComplete();
	};


	/**
	 * Returns the caret position in inputs and textareas.
	 * http://stackoverflow.com/a/2897229/4899346
	 *
	 * @param {Element} field
	 * @returns {Number}
	 */
	Ui.getCaretPosition = function(field) {
		if (document.selection) {
			var oSel = document.selection.createRange();
			oSel.moveStart("character", -field.value.length);
			return oSel.text.length;
		}

		return field.selectionStart || 0;
	};

	/**
	 * Creates a selection in inputs and textareas.
	 * http://stackoverflow.com/q/512528/4899346
	 *
	 * @param {Element} field
	 * @param {Number} posStart
	 * @param {Number=} posEnd
	 */
	Ui.setFieldSelection = function(field, posStart, posEnd) {
		if (posEnd == null)
			posEnd = posStart;

		if (field.setSelectionRange)
			field.setSelectionRange(posStart, posEnd);
		else if (field.createTextRange) {
			var range = field.createTextRange();
			range.moveEnd("character", posEnd);
			range.moveStart("character", posStart);
			range.select();
		}
	};


	return Ui;
});
