
define(["jquery", "aza/Core", "aza/browser/Detector"], function($, Aza, Detector)
{
	$.isLMB = function(e) {
		return e && e.which == 1;
	};


	$.fn.findHereof = function(selector) {
		var $res = this.find(selector);
		return this.is(selector) ? this.add($res) : $res;
	};

	/**
	 * Добавляет объект в контейнер в соответствии с указанным индексом
	 *
	 * Можно добавлять набот объектов.
	 *
	 * $child1, $child2, $child3, $child4
	 *
	 * $______.insertByIndex($container, 0)        =>    $______, $child1, $child2, $child3, $child4
	 * $______.insertByIndex($container, 1)        =>    $child1, $______, $child2, $child3, $child4
	 * $______.insertByIndex($container, 4)        =>    $child1, $child2, $child3, $child4, $______
	 * $______.insertByIndex($container, 10)    =>    $child1, $child2, $child3, $child4, $______
	 *
	 * $______.insertByIndex($container, -1)    =>    $child1, $child2, $child3, $child4, $______
	 * $______.insertByIndex($container, -2)    =>    $child1, $child2, $child3, $______, $child4
	 * $______.insertByIndex($container, -5)    =>    $______, $child1, $child2, $child3, $child4
	 * $______.insertByIndex($container, -10)    =>    $______, $child1, $child2, $child3, $child4
	 *
	 * @param {jQuery}    $container    Контейнер
	 * @param {Number}    index        Индекс
	 *
	 * @return {jQuery}    Добавляемый объект
	 */
	$.fn.insertByIndex = function($container, index) {
		var $childs = $container.children(),
			len = $childs.length;

		if (index < 0) {
			index += len + 1;
		}

		if (!len || index >= len) {
			$container.append(this);
		}
		else {
			$childs.eq(
				Aza.norm(index, 0, len - 1)
			).before(this);
		}

		return this;
	};

	$.fn.toggleClassWDelay = function(className, delay) {
		var key = "__Ui_toggleClassWDelay_timeout";

		this.each(function(i, elem) {
			clearTimeout(elem[key]);

			var $this = $(elem);

			$this.addClass(className);

			elem[key] = setTimeout(function() {
				$this.removeClass(className);
				try {
					// IE throws an error if property doesn't exist
					delete elem[key];
				}
				catch (e) { }
			}, delay);
		});

		return this;
	};

	$.fn.incrementCount = function() {
		this.each(function() {
			var $this = $(this);
			$this.html((+$this.html() || 0) + 1);
		});
		return this;
	};

	$.fn.decrementCount = function() {
		this.each(function() {
			var $this = $(this);
			$this.html((+$this.html() || 0) + 1);
		});
		return this;
	};

	/**
	 * Toggles text of an element
	 * <span txt1="Другой текст" txt2="Ещё текст">Текст</span>
	 * @param state
	 * @returns {*}
	 */
	$.fn.toggleText = function(state) {
		var path = "__$_toggleText_data";

		// go through every element
		this.each(function() {
			var $elem = $(this);

			// fix a state if it is launched at the first time
			if ($elem.data(path + ".state") == null) {
				$elem.data(path + ".state", 0);
				$elem.data(path + ".def", $elem.html());
			}

			// set state value
			if (state != null) {
				$elem.html(
					state == 0
						? $elem.data(path + ".def")
						: $elem.attr("txt" + state)
				);

				$elem.data(path + ".state", +state);
			}
		});

		// return current state
		if (state == null) {
			return this.data(path + ".state");
		}

		return this;
	};

	$.fn.toggleAttr = function(name, value1, value2) {
		if (this.attr(name) != value1)
			this.attr(name, value1);
		else if (value2 == null)
			this.removeAttr(name);
		else
			this.attr(name, value2);
	};


	$.each("opacity zIndex cursor".split(" "), function(i, name) {
		$.fn[name] = function(val) {
			return arguments.length ? this.css(name, val) : this.css(name);
		}
	});

	$.fn.dNone = function() {
		return this.css("display", "none");
	};
	$.fn.dBlock = function() {
		return this.css("display", "block");
	};
	$.fn.dNothing = function() {
		return this.css("display", "");
	};

	$.each("Width Height".split(" "), function(i, type) {

		var fnName = "offset" + type,
			cssProp = type.toLowerCase();

		$.fn[fnName] = function(val) {
			if (val == null) {
				return this.length ? this[0][fnName] : this;
			}

			return this.each(function() {
				var $this = $(this),
					currVal = this[fnName];

				val != currVal
				&& $this[cssProp](Aza.toNumber($this[cssProp]()) + val - currVal);
			});
		};

	});

	$.fn.isVisible = function() {
		return this.is(":visible");
	};

	$.fn.isAttached = function() {
		return !!this.parents("body").length;
	};

	$.fn.hideChildrens = function() {
		this.children().hide();
		return this;
	};

	$.fn.showChildrens = function() {
		this.children().show();
		return this;
	};

	$.fn.disableSelection = function(setDefCursor) {
		this
			.attr("unselectable", "on")
			.css("user-select", "none");

		setDefCursor && this.cursor("default");

		if (Detector.opera || Detector.msie) {
			var $childs = this.children();
			$childs.length && $childs.disableSelection(setDefCursor);
		}

		return this;
	};


	$.fn.onEnterNextFocus = function(obj) {
		return this.onKey("enter", "keyup", function() {
			obj.focus();
		})
	};


	/**
	 * Получает данные из атрибута onerror любого DOM-элемента
	 *
	 * <tt>&lt;a onerror="return { ... }"&gt;&lt;/a&gt;</tt>
	 *
	 * @return {*}
	 */
	$.fn.getElemData = function() {
		var onError = this[0] && this[0].onerror;

		return onError
			? (onError.substr
			? new Function(onError)
			: onError)()
			: undefined;
	};

	$.fn.valTrim = function(val) {
		return arguments.length
			? this.val(Aza.trim(val))
			: Aza.trim(this.val());
	};


	return $;
});
