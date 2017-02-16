
define([
	"jquery", "jquery/misc",
	"../Core", "../Component",
	"./Draggable"
], function($, $$m, Aza, Component, Draggable)
{
	var Sortable = Component.extend(function($container, opts) {
		Component.call(this, opts);

		var api = Aza.extend(this, {
				$container: $container,
				isDragging: false
			}),
			o = api.options,
			draggables = [],

			$items, itemDimens,
			lastElem,

			$helper, helperIndex, helperDimens, helperStyle,
			startHelperCSSPos, startHelperWidth, startHelperHeight,
			startHelperIndex,

			$pholder, pholderDimens;


		api.destroy = function() {
			for (var i = 0; i < draggables.length; i++)
				draggables[i].destroy();

			api.off("*");
		};


		function resetItems() {
			$items = $container.find(o.items);

			if ($pholder)
				$items = $items.not($pholder);

			if (api.isDragging)
				helperIndex = $items.index($helper);
		}


		function dimensForItem($item) {
			var offset, width, height;

			offset = $item.offset();
			width = $item.offsetWidth();
			height = $item.offsetHeight();

			return {
				width: width,
				height: height,
				left: offset.left,
				top: offset.top,
				right: offset.left + width,
				bottom: offset.top + height
			};
		}

		function updateItemDimensions() {
			if (!api.isDragging) return;

			itemDimens = [];

			for (var i = 0; i < $items.length; i++)
				itemDimens.push(dimensForItem($($items[i])));
		}

		function updatePhDimensions() {
			if (!api.isDragging) return;
			pholderDimens = dimensForItem($pholder);
		}

		function updateHelperDimens() {
			if (!api.isDragging) return;
			helperDimens = dimensForItem($helper);
		}

		function calcDistanceToHelper(dimens/*, dimensForCoef*/) {
			var coefHor = 1,
				coefVer = 1;

			/*dimensForCoef = dimensForCoef || dimens;

			var coefHor = Math.abs(dimensForCoef.width - helperDimens.width),
				coefVer = Math.abs(dimensForCoef.height - helperDimens.height);

			coefHor = coefHor ? dimensForCoef.width / coefHor : 1;
			coefVer = coefVer ? dimensForCoef.height / coefVer : 1;*/

			return Math.round(
				Math.sqrt(
					Math.pow(Math.abs(helperDimens.top - dimens.top) * coefVer, 2)
					+ Math.pow(Math.abs(helperDimens.left - dimens.left) * coefHor, 2)
				)
				+ Math.sqrt(
					Math.pow(Math.abs(helperDimens.right - dimens.right) * coefHor, 2)
					+ Math.pow(Math.abs(helperDimens.bottom - dimens.bottom) * coefVer, 2)
				)
			);
		}


		function onDragStart(e, draggable) {
			if (api.isDragging) return;
			api.isDragging = true;


			updateItemDimensions();

			$helper = draggable.$target;
			helperIndex = startHelperIndex = $items.index($helper);
			helperDimens = itemDimens[helperIndex];
			helperStyle = $helper[0].style;


			$pholder = $(document.createElement($helper[0].tagName)).html(
					Aza.ifFunction(o.phContent, [$helper, helperIndex, api])
			);

			if (o.phCopyClasses)
				$pholder[0].className = $helper[0].className;

			if (o.phClass)
				$pholder.removeClass(o.dragClass).addClass(o.phClass);

			$helper.after($pholder);

			$pholder
				.width($pholder.width() + helperDimens.width - $pholder.offsetWidth())
				.height($pholder.height() + helperDimens.height - $pholder.offsetHeight());


			if (o.keepHelperSize) {
				startHelperWidth = helperStyle.width;
				startHelperHeight = helperStyle.height;
				$helper.width($helper.width()).height($helper.height());
			}


			startHelperCSSPos = helperStyle.position;
			helperStyle.position = "absolute";

			helperStyle.left = helperStyle.top = "0px";
			var newOffset = $helper.offset();
			helperStyle.left = helperDimens.left - newOffset.left + "px";
			helperStyle.top = helperDimens.top - newOffset.top + "px";


			updatePhDimensions();


			api.trigger(Sortable.EV_DRAG_START, [$helper, api]);
		}

		function onDrag(e, draggable) {
			if (!api.isDragging) return;

			updateHelperDimens();

			var minDistance = null,
				minDistanceIndex = null,
				distance, i;

			for (i = 0; i < itemDimens.length; i++)
				if (i !== helperIndex) {
					distance = calcDistanceToHelper(itemDimens[i]);
					if (minDistance === null || distance < minDistance) {
						minDistance = distance;
						minDistanceIndex = i;
					}
				}

			if (minDistance > calcDistanceToHelper(pholderDimens))
				lastElem = null;
			else if (lastElem !== $items[minDistanceIndex]) {
				lastElem = $items[minDistanceIndex];

				var method = minDistanceIndex > helperIndex
					? "insertAfter"
					: "insertBefore";

				$pholder.add($helper)[method]($($items[minDistanceIndex]));

				resetItems();

				updateItemDimensions();
				updatePhDimensions();
			}

			api.trigger(Sortable.EV_DRAG, [$helper, api]);
		}

		function onDragStop(e, draggable) {
			if (!api.isDragging) return;

			function complete() {
				$pholder.remove();
				$pholder[0] = null;
				$pholder = null;

				helperStyle.width = startHelperWidth;
				helperStyle.height = startHelperHeight;
				helperStyle.position = startHelperCSSPos;
				helperStyle.left = helperStyle.top = "";

				lastElem = null;

				api.isDragging = false;

				api.trigger(Sortable.EV_DRAG_STOP, [$helper, api]);

				if (startHelperIndex !== helperIndex)
					api.trigger(Sortable.EV_UPDATE, [$helper, helperIndex, startHelperIndex, api]);
			}

			if (o.revert)
				$helper.animate({
					left: Aza.toNumber($helper.css("left")) - (helperDimens.left - pholderDimens.left),
					top: Aza.toNumber($helper.css("top")) - (helperDimens.top - pholderDimens.top)
				}, o.revert, complete);
			else complete();
		}


		resetItems();

		//noinspection JSUnusedAssignment
		$items.each(function() {
			var draggable = new Draggable($(this), {
				handler: o.handler,
				preventer: o.preventer,
				considerMargins: o.considerMargins,

				container: o.container,
				boundsPads: o.boundsPads,
				useOffsetSize: o.useOffsetSize,

				dragClass: o.dragClass,

				axis: o.axis,

				moveCursor: o.moveCursor,
				scroll: o.scroll,
				zIndex: o.zIndex,

				beforeDrag: function(dr) {
					return !api.isDragging && o.beforeDrag(dr.$target, api) !== false;
				}
			});

			draggable.on(Draggable.EV_DRAG_START, onDragStart);
			draggable.on(Draggable.EV_DRAG, onDrag);
			draggable.on(Draggable.EV_DRAG_STOP, onDragStop);

			draggables.push(draggable);
		});
	});

	Sortable.EV_DRAG = "drag";
	Sortable.EV_DRAG_START = "dragStart";
	Sortable.EV_DRAG_STOP = "dragStop";
	Sortable.EV_UPDATE = "update";

	Sortable.componentName = "Sortable";

	Sortable.defaults = {
		/**
		 * Селектор для поиска чилдренов
		 * Данная строка будет отправлена в $target.find(o.items) для поиска сортируемых элементов
		 * @type {String}
		 */
		items: "> *",

		/**
		 * Объект или набор объектов, за которые можно перетаскивать сортируемые элементы
		 * @see Draggable
		 * @type {String|jQuery|Object}
		 */
		handler: null,

		/**
		 * Объект или набор объектов, за которые нельзя перетаскивать
		 * @see Draggable
		 * @type {String|jQuery|Object}
		 */
		preventer: null,

		/**
		 * Take into account margins of the target element while dragging inside container bounds.
		 * @see Draggable
		 * @type {boolean}
		 */
		considerMargins: true,

		/**
		 * Контейнер
		 * @see Draggable
		 * @type {String|jQuery|Object}
		 */
		container: $.document,

		/**
		 * Ось перемещения
		 * @see Draggable
		 * @type {String}
		 */
		axis: null,

		/**
		 * Поправки для контейнера
		 * @see Draggable
		 * @type {Array|Number}
		 */
		boundsPads: null,

		/**
		 * Использовать внешнюю/внутреннюю ширину/высоту контейнера
		 * @see Draggable
		 * @type {Boolean}
		 */
		useOffsetSize: false,

		/**
		 * Класс, который добавляется элементу во время перетаскивания
		 * @see Draggable
		 * @type {String}
		 */
		dragClass: "dragging",

		/**
		 * Сохранять размеры элемента
		 * Во время перетаскивания элементу присваивается position: absolute.
		 * Это может повлиять на размеры элемента.
		 * Если данный параметр == 1|true, перед перетаскиванием элементу будут явно указаны его размеры.
		 * @type {Boolean}
		 */
		keepHelperSize: true,

		/**
		 * zIndex на время перетаскивания
		 * @see Draggable
		 * @type {ZIndex|Number}
		 */
		zIndex: 3,

		/**
		 * Скопировать плейсхолдеру классы элемента
		 * @type {Boolean}
		 */
		phCopyClasses: true,

		/**
		 * Дополнительный класс для плейсхолдера
		 * @type {String}
		 */
		phClass: "placeholder",

		/**
		 * Содержимое плейсхолдера
		 * @type {String|Object|jQuery|Function($helper, helperIndex, api)}
		 */
		phContent: "&nbsp;",

		/**
		 * Установить объекту (или хендлеру) cursor: move
		 * @see Draggable
		 * @type {Number}
		 */
		moveCursor: 2,

		/**
		 * Расстояние до края страницы, с которого начинать скроллинг
		 * @see Draggable
		 * @type {Number}
		 */
		scroll: 100,

		/**
		 * Скорость анимации возвращения элемента на место
		 * 0 - без анимации
		 * @type {Number}
		 */
		revert: 200,

		/**
		 * Коллбэк вызывается перед началом перетаскивания
		 * Если вернёт false, перетаскивание будет отменено
		 * @type {Function}
		 */
		beforeDrag: function() {}
	};


	return Sortable;
});
