
define([
	"jquery", "jquery/misc",
	"../Core", "../Ui", "../Component",
	"../browser/Detector",
	"./ZIndex", "./Overlay"
], function($, $$m, Aza, Ui, Component, Detector, ZIndex, Overlay)
{
	var SCROLL_INTERVAL	= 20,
		SCROLL_SPD		= Detector.browser.msie ? 10 : 6,
		SCROLL_ACCEL	= 1.2,

		$stage			= $.document,
		toNumber		= Aza.toNumber;


	var Draggable = Component.extend(function($target, opts) {
		Component.call(this, opts);

		var api = Aza.extend(this, {
				$target: $target
				//$handler
				//$preventer
				//$container
			}),
			o = api.options,

			overlay = new Overlay({
				opacity: 0,
				zIndex: 4,
				cursor: "move"
			}),
			zi = o.zIndex && ZIndex.create(1, o.zIndex),

			namespace = api.namespace,

			$handler = api.$handler = o.handler ? $(o.handler) : $target,
			$preventer = api.$preventer = o.preventer && $(o.preventer),
			$container = api.$container = o.container === "parent" ? $handler.parent() : $(o.container),

			handlerStyle = $handler[0].style,
			targetStyle = $target[0].style,

			mouseStartX, mouseStartY,
			targetStartX, targetStartY,
			targetOffset = {},
			startZIndex = targetStyle.zIndex,

			bounds,
			boundsPads = o.boundsPads,
			axis = o.axis && (o.axis + "").toLowerCase(),

			moveCursor = o.moveCursor,
			defCursor = handlerStyle.cursor,
			dragClass = o.dragClass,

			isContainerTheDocument = $container[0] === document,
			isContainerTheWindow = $container[0] === window,
			isMouseBindedOnDocument,

			scroll = isContainerTheWindow ? 0 : o.scroll,
			scrollInterval;


		api.destroy = function() {
			overlay.destroy();
			$handler.unbind("." + namespace);
			resetMoveCursor();
			api.off("*");
		};


		function updateBounds() {
			if ($container) {
				var offset, vp;

				if (isContainerTheDocument || isContainerTheWindow) {
					vp = Ui.getViewport();
					bounds = {
						left:	isContainerTheDocument ? 0 : vp.scrollLeft,
						top:	isContainerTheDocument ? 0 : vp.scrollTop,
						width:	isContainerTheDocument ? vp.scrollWidth : vp.width,
						height:	isContainerTheDocument ? vp.scrollHeight: vp.height
					}
				}
				else if (offset = $container.offset()) {
					if (o.useOffsetSize) {
						bounds = {
							left:	offset.left,
							top:	offset.top,
							width:	$container.offsetWidth(),
							height:	$container.offsetHeight()
						};

						if (o.useOffsetSize != 2) {
							var borderLeftWidth = toNumber($container.css("borderLeftWidth")),
								borderTopWidth = toNumber($container.css("borderTopWidth"));

							bounds.left += borderLeftWidth;
							bounds.top += borderTopWidth;
							bounds.width -= borderLeftWidth + toNumber($container.css("borderRightWidth"));
							bounds.height -= borderTopWidth + toNumber($container.css("borderBottomWidth"));
						}
					}
					else {
						bounds = {
							left:	offset.left + toNumber($container.css("paddingLeft")) + toNumber($container.css("borderLeftWidth")),
							top:	offset.top + toNumber($container.css("paddingTop")) + toNumber($container.css("borderTopWidth")),
							width:	$container.width(),
							height:	$container.height()
						}
					}
				}

				if (boundsPads) {
					bounds.left += boundsPads[0];
					bounds.top += boundsPads[1];
					bounds.width -= boundsPads[0] + boundsPads[2];
					bounds.height -= boundsPads[1] + boundsPads[3];
				}
			}
		}

		function updateTargetPosition(e) {
			var pageX = axis !== "y" ? e.pageX : mouseStartX,
				pageY = axis !== "x" ? e.pageY : mouseStartY,
				newOffset = {
					left: targetStartX + pageX - mouseStartX,
					top: targetStartY + pageY - mouseStartY
				},

				hMargins = o.considerMargins
					? Aza.toNumber($target.css("margin-left")) + Aza.toNumber($target.css("margin-right"))
					: 0,
				vMargins = o.considerMargins
					? Aza.toNumber($target.css("margin-top")) + Aza.toNumber($target.css("margin-bottom"))
					: 0,

				v1, v2;

			if (bounds) {
				v1 = bounds.left;
				v2 = bounds.left + bounds.width - $target.offsetWidth() - hMargins;
				newOffset.left = Aza.norm(newOffset.left, Math.min(v1, v2), Math.max(v1, v2));
				v1 = bounds.top;
				v2 = bounds.top + bounds.height - $target.offsetHeight() - vMargins;
				newOffset.top = Aza.norm(newOffset.top, Math.min(v1, v2), Math.max(v1, v2));
			}

			$target.offset(targetOffset = newOffset);

			api.trigger(Draggable.EV_DRAG, [api]);
		}

		function setMoveCursor() {
			handlerStyle.cursor = "move";
		}

		function resetMoveCursor() {
			handlerStyle.cursor = defCursor;
		}


		function calcScrollDistance(distance) {
			var res = (scroll - distance) / scroll;		// Отношение расстояния от точки начала скроллинга
														// к размеру области скроллинга

			res *= SCROLL_SPD;							// Умножаем в несколько раз увеличивая тем самым
														// скорость прокрутки

			res = Math.pow(res, SCROLL_ACCEL);			// Возведение в степень придаёт ускорение,
														// которое становится всё более и более заметно при
														// увеличении расстояния между курсором и началом скроллинга

			return Math.round(res);
		}

		function clearScrollInterval() {
			clearInterval(scrollInterval);
		}

		function checkScrollAvail(direction, vp) {
			switch (direction) {
				case "dn":
					return vp.scrollTop + vp.height < vp.scrollHeight;
				case "up":
					return vp.scrollTop > 0;
				case "rt":
					return vp.scrollLeft + vp.width < vp.scrollWidth;
				case "lt":
					return vp.scrollLeft > 0;
			}
		}

		function checkBoundsToScroll(direction, vp) {
			if (!bounds)
				return true;

			var targetWidth = $target.offsetWidth(),
				targetHeight = $target.offsetHeight();

			switch (direction) {
				case "dn":
					return targetOffset.top + targetHeight > vp.scrollTop + vp.height - scroll;
				case "up":
					return targetOffset.top < vp.scrollTop + scroll;
				case "rt":
					return targetOffset.left + targetWidth > vp.scrollLeft + vp.width - scroll;
				case "lt":
					return targetOffset.left < vp.scrollLeft + scroll;
			}
		}

		function checkPageScroll(e) {
			if (!scroll) return;

			clearScrollInterval();


			var vp = Ui.getViewport(),

				pageX = e.pageX, pageY = e.pageY,

				distanceToLeft		= pageX - vp.scrollLeft,
				distanceToTop		= pageY - vp.scrollTop,
				distanceToRight		= vp.scrollLeft + vp.width - pageX,
				distanceToBottom	= vp.scrollTop + vp.height - pageY,

				directionY, directionX,
				scrollDistX = 0, scrollDistY = 0;


			if (distanceToBottom < scroll) {
				scrollDistY = calcScrollDistance(distanceToBottom);
				directionY = "dn";
			}
			else if (distanceToTop < scroll) {
				scrollDistY = -calcScrollDistance(distanceToTop);
				directionY = "up";
			}

			if (distanceToRight < scroll) {
				scrollDistX = calcScrollDistance(distanceToRight);
				directionX = "rt";
			}
			else if (distanceToLeft < scroll) {
				scrollDistX = -calcScrollDistance(distanceToLeft);
				directionX = "lt";
			}

			if (scrollDistX || scrollDistY) {
				function doScroll() {
					vp = Ui.getViewport();

					if (scrollDistX && checkScrollAvail(directionX, vp) && checkBoundsToScroll(directionX, vp)) {
						$.window.scrollLeft(vp.scrollLeft + scrollDistX);
						e.pageX += scrollDistX;
					}

					if (scrollDistY && checkScrollAvail(directionY, vp) && checkBoundsToScroll(directionY, vp)) {
						$.window.scrollTop(vp.scrollTop + scrollDistY);
						e.pageY += scrollDistY;
					}

					updateTargetPosition(e);
				}

				doScroll();
				scrollInterval = setInterval(doScroll, SCROLL_INTERVAL);
			}
		}


		function onMouseDown(e) {
			if (!$.isLMB(e)
				|| $preventer && $(e.target).closest($preventer).length
				|| o.beforeDrag(api) === false
			) return;

			e.preventDefault();

			updateBounds();

			mouseStartX = e.pageX;
			mouseStartY = e.pageY;

			targetOffset = $target.offset();
			targetStartX = targetOffset.left;
			targetStartY = targetOffset.top;

			if (!isMouseBindedOnDocument) {
				isMouseBindedOnDocument = true;
				$stage
					.bind("mousemove." + namespace, onMouseMove)
					.bind("mouseup." + namespace, onMouseUp);
			}

			dragClass && $target.addClass(dragClass);

			if (o.zIndex)
				targetStyle.zIndex = zi.capture().last;

			moveCursor === 2 && setMoveCursor();
			o.useOverlay && overlay.show();

			api.trigger(Draggable.EV_DRAG_START, [api]);
		}

		function onMouseMove(e) {
			e.preventDefault();

			updateTargetPosition(e);

			checkPageScroll(e);
		}

		function onMouseUp() {
			$stage.unbind("." + namespace);
			isMouseBindedOnDocument = false;

			dragClass && $target.removeClass(dragClass);

			if (o.zIndex && zi) {
				zi.release();
				targetStyle.zIndex = startZIndex;
			}

			moveCursor === 2 && resetMoveCursor();
			o.useOverlay && overlay.hide();

			clearScrollInterval();

			api.trigger(Draggable.EV_DRAG_STOP, [api]);
		}


		if (boundsPads) {
			// 10 || [10]
			if (!boundsPads.join || boundsPads.length < 2) {
				boundsPads = toNumber(boundsPads);
				boundsPads = [boundsPads, boundsPads, boundsPads, boundsPads];
			}

			// [10, 20]
			boundsPads.length < 3 && boundsPads.push(boundsPads[0]);

			// [10, 20, 30]
			boundsPads.length < 4 && boundsPads.push(boundsPads[1]);
		}

		moveCursor === 1 && setMoveCursor();

		$handler.unbind("." + namespace).bind("mousedown." + namespace, onMouseDown);
	});

	Draggable.EV_DRAG = "drag";
	Draggable.EV_DRAG_START = "dragStart";
	Draggable.EV_DRAG_STOP = "dragStop";

	Draggable.componentName = "Draggable";

	Draggable.defaults = {
		/**
		 * Объект или набор объектов, за которые можно перетаскивать
		 * Любой объект, который можно запихнуть в $()
		 * Если не передать, перетаскивать можно будет взявшись за сам таргет
		 * @type {String|jQuery|Object}
		 */
		handler: null,

		/**
		 * Объект или набор объектов, за которые нельзя перетаскивать
		 * Любой объект, который можно запихнуть в $()
		 * @type {String|jQuery|Object}
		 */
		preventer: null,

		/**
		 * Take into account margins of the target element while dragging inside container bounds.
		 * @type {boolean}
		 */
		considerMargins: true,

		/**
		 * Контейнер
		 * За границы него таргет не выйдет
		 *
		 * Любой объект, который можно запихнуть в $()
		 *
		 * Можно передать document:
		 * Тогда таргет будет перетаскиваться в пределах всей страницы.
		 *
		 * Можно передать window:
		 * Тогда таргет будет перетаскиваться в пределах лишь видимой области страницы.
		 * Причём скроллинга происходить не будет даже если передан параметр scroll
		 *
		 * Можно передать "parent":
		 * Тогда таргет будет перетаскиваться в пределах родительского элемента.
		 *
		 * @type {String|jQuery|Object}
		 */
		container: $.document,

		/**
		 * Ось перемещения
		 * "x"			- перемещение лишь по горизонтали
		 * "y"			- перемещение лишь по вертикали
		 * 0|null|false	- в любых направлениях
		 * @type {String}
		 */
		axis: null,

		/**
		 * Поправки для контейнера
		 *
		 * Можно передать массив [left,top,right,bottom],
		 * либо число, тогда все стороны будут одинаковы.
		 *
		 * Например, если передать [10,20,30,40],
		 * то границы контейнера уменьшатся на 10 слева, 20 сверху, 30 справа, 40 снизу.
		 *
		 * @type {Array|Number}
		 */
		boundsPads: null,

		/**
		 * Использовать внешнюю/внутреннюю ширину/высоту контейнера
		 * false|0	- использовать внутреннюю ширину/высоту контейнера (без паддингов и бордеров)
		 * true|1	- использовать внешнюю ширину/высоту контейнера (с паддингами, но без бордеров)
		 * 2		- использовать внешнюю ширину/высоту контейнера (с паддингами и бордерами)
		 * @type {Boolean}
		 */
		useOffsetSize: false,

		/**
		 * Класс, который добавляется объекту во время перетаскивания
		 * @type {String}
		 */
		dragClass: "dragging",

		/**
		 * Установить объекту (или хендлеру) cursor: move
		 * 0: не устанавливать
		 * 1: установить сразу
		 * 2: устанавливать только на время перетаскивания
		 * @type {Number}
		 */
		moveCursor: 2,

		/**
		 * Использовать Ui.Blocker с курсором move во время перетаскивания
		 * @type {Boolean}
		 */
		useOverlay: true,

		/**
		 * Расстояние до края страницы, с которого начинать скроллинг
		 * 0|false - без скроллинга
		 * @type {Number}
		 */
		scroll: 100,

		/**
		 * zIndex на время перетаскивания
		 * После перетаскивания значение будет восстановлено
		 * @type {Number|ZIndex}
		 */
		zIndex: false,

		/**
		 * Коллбэк вызывается перед началом перетаскивания
		 * Если вернёт false, перетаскивание будет отменено
		 * @type {Function}
		 */
		beforeDrag: Aza.noop
	};


	return Draggable;
});
