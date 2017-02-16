
define([
	"jquery", "jquery/mainElems",
	"../Core", "../Ui", "../Component", "./ZIndex",
	"../event/dispatchers/OverlayDispatcher"
], function($, $$m, Aza, Ui, Component, ZIndex, EvOverlay)
{
	var Overlay = Component.extend(function(opts) {
		Component.call(this, opts);

		var api = Aza.extend(this, {
				//options
				//$body

				isShown: false,
				isHidden: true,
				isShowing: false,
				isHiding: false
			}),
			o = api.options,

			namespace = api.namespace,
			$body;


		api.show = function() {
			if (api.isShown || api.isShowing || o.beforeShow(api) === false)
				return api;

			if (api.isHidden) {
				if (!$body) {
					$body = api.$body || $("<div>").addClass(o.bodyClass + " " + o.bodyAdsClass + " " + namespace).css({
						position: "fixed",
						left: 0,
						top: 0,
						backgroundColor: o.color,
						opacity: o.fadeIn ? 0 : o.opacity,
						zIndex: o.zIndex.capture().last,
						cursor: o.cursor
					});
					api.$body = $body;

					if (o.hideOnClick)
						$body
							.bind("mousedown." + namespace, false)
							.bind("click." + namespace, function() {
								api.isShown && api.hide();
							});
				}

				$body.appendTo(Ui.$jsWrap);

				$.window.on("resize."+namespace, Aza.proxy(api, "updateSize"));

				EvOverlay.trigger(EvOverlay.EV_SHOW, [$body]);
			}
			// hiding
			else $body.stop();

			api.updateSize();

			if (o.fadeIn) {
				api.isHidden = api.isHiding = false;
				api.isShowing = true;

				$body.fadeTo(o.fadeIn, o.opacity, afterShow);
			}
			else afterShow();

			return api;
		};

		api.hide = function() {
			if (api.isHidden || api.isHiding || o.beforeHide(api) === false)
				return api;

			$body.stop();

			$.window.off("."+namespace);

			if (o.fadeOut) {
				api.isShown = api.isShowing = false;
				api.isHiding = true;

				$body.fadeTo(o.fadeOut, 0, afterHide);
			}
			else afterHide();

			return api;
		};

		api.updateSize = function() {
			var vp = Ui.getViewport();

			$body.css({width:0, height:0}).css({
				width: vp.width,
				height: vp.height
			});

			return api;
		};

		api.destroy = function() {
			$body && $body.remove();
			$.window.off("."+namespace);
			api.off("*");
		};


		function afterShow() {
			api.isShowing = api.isHidden = api.isHiding = false;
			api.isShown = true;

			api.trigger(Overlay.EV_SHOW, [$body, api]);
		}

		function afterHide() {
			api.isHiding = api.isShown = api.isShowing = false;
			api.isHidden = true;

			$body.detach();
			o.zIndex.release();

			api.trigger(Overlay.EV_HIDE, [api]);
			EvOverlay.trigger(EvOverlay.EV_HIDE);
		}


		o.zIndex = ZIndex.create(1, o.zIndex);
	});

	Overlay.EV_SHOW = "show";
	Overlay.EV_HIDE = "hide";

	Overlay.componentName = "Overlay";

	Overlay.defaults = {
		/**
		 * Цвет
		 * @type {String}
		 */
		color: "#000",

		/**
		 * Прозрачность
		 * @type {Number}
		 */
		opacity: .4,

		/**
		 * zIndex
		 * @type {ZIndex|Number}
		 */
		zIndex: 2,

		/**
		 * @type {String}
		 */
		cursor: "default",

		/**
		 * Класс для $body
		 * @type {String}
		 */
		bodyClass: "e-Overlay",

		/**
		 * Дополнительный класс для $body
		 * @type {String}
		 */
		bodyAdsClass: "",

		/**
		 * Дополнительный CSS для $body
		 * @type {Object}
		 */
		css: null,

		/**
		 * Скорость появления
		 * 0 - без анимации
		 * @type {Number}
		 */
		fadeIn: 330,

		/**
		 * Скорость скрытия
		 * 0 - без анимации
		 * @type {Number}
		 */
		fadeOut: 198,

		/**
		 * Скрывать по клику
		 * @type {Boolean}
		 */
		hideOnClick: false,

		/**
		 * Выполнится перед открытием
		 * @type {Function}
		 */
		beforeShow: Aza.noop,

		/**
		 * Выполнится перед скрытием
		 * @type {Function}
		 */
		beforeHide: Aza.noop
	};


	return Overlay;
});
