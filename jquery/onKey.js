
define(["jquery"], function($)
{
	var DEFAULT_EVENT = "keydown",
		REX_EVENTS = /keyup|keypress|keydown/,

		specialKeys = {
			"esc":			27,
			"tab":			9,
			"space":		32,
			"enter":		13,
			"backspace":	8,
			"scroll":		145,
			"capslock":		20,
			"numlock":		144,
			"pause":		19,
			"insert":		45,
			"home":			36,
			"del":			46,
			"end":			35,
			"pageup":		33,
			"pagedown":		34,

			"left":			37,
			"up":			38,
			"right":		39,
			"down":			40,

			"f1":			112,
			"f2":			113,
			"f3":			114,
			"f4":			115,
			"f5":			116,
			"f6":			117,
			"f7":			118,
			"f8":			119,
			"f9":			120,
			"f10":			121,
			"f11":			122,
			"f12":			123,

			"*":			106,
			"plus":			107,
			"-":			[109, 173],
			"=":			61,
			"/":			[191, 111],
			".":			[110, 190],

			"0":			[48, 96],
			"1":			[49, 97],
			"2":			[50, 98],
			"3":			[51, 99],
			"4":			[52, 100],
			"5":			[53, 101],
			"6":			[54, 102],
			"7":			[55, 103],
			"8":			[56, 104],
			"9":			[57, 105]
		};


	function prepareCombis(combisString) {
		var res = [],
			// "ctrl+enter shift+a" -> ["ctrl+enter", "shift+a"]
			combs = $.trim(combisString).toLowerCase().split(/\s+/);

		for (var i = 0; i < combs.length; i++)
			res.push(prepareCombi(combs[i]));

		return res;
	}

	function prepareCombi(combiString) {
		var res = {
				selector: combiString,
				ctrl: false,
				alt: false,
				shift: false,
				special: null,
				other: null
			},
			currKey, i;

		// "ctrl+enter" -> ["ctrl", "enter"]
		combiString = combiString.split("+");

		for (i = 0; i < combiString.length; i++) {
			currKey = combiString[i];

			// Flags for ctrl/alt/shift
			if (/ctrl|alt|shift/.test(currKey))
				res[currKey] = true;

			// Special keys: space/enter/f1/0/9/...
			else if (specialKeys[currKey])
				res.special = specialKeys[currKey];

			// Letter keys
			else res.other = currKey;
		}

		return res;
	}

	function checkEvent(e, combi) {
		var special = combi.special,
			code = e.which || e.keyCode;

		if (combi.shift && !e.shiftKey
			|| combi.ctrl && !e.ctrlKey && !e.metaKey
			|| combi.alt && !e.altKey
		) return false;

		if (special && (special.join ? $.inArray(code, special) < 0 : code !== special))
			return false;

		return !combi.other || combi.other === String.fromCharCode(code).toLowerCase();
	}


	/**
	 * Работа с клавиатурой
	 * Вызов функции похож на $.bind с единственной разницей -
	 * первым параметром передаётся нужная клавиатурная комбинация.
	 * Далее можно указать какой тип событий слушать - keyup, keypress, keydown.
	 * Неймспейсы также поддерживаются.
	 * Затем можно передать данные для event.data
	 * И в конце идёт функция-коллбек.
	 * Вызов коллбэка происходит точно так же, как и в $.bind -
	 * в this передаётся DOM-объект, вызвавший событие, а первым параметром - объект события.
	 * В объекте события добавляется новое свойство - onKey,
	 * в котором записана сработавшая клавиатурная комбинация (например, "ctrl+enter").
	 *
	 * $obj.onKey("ctrl+right", nextLinkClick);
	 * $obj.onKey("ctrl+right shift+n", nextLinkClick);
	 * $obj.onKey("ctrl+right", "keyup", nextLinkClick);
	 * $obj.onKey("ctrl+right", "keyup.AC keypress.AC", nextLinkClick);
	 * $obj.onKey("ctrl+right", ".AC", {some:getSome()}, nextLinkClick);
	 */
	$.fn.onKey = function(combis/*, type, data, fn*/) {
		var type = DEFAULT_EVENT,
			namespace,
			arg, fn, data, i, combi, key;

		// $.onKey({left:gotoPrev, right:gotoNext, "ctrl+enter":sendMsg})
		if (typeof combis === "object") {
			for (key in combis) if (combis.hasOwnProperty(key))
				this.onKey(key, combis[key]);
			return;
		}

		combis = prepareCombis(combis);

		// Figuring out what else is passed into the function
		for (i = 1; i < arguments.length; i++) {
			arg = arguments[i];

			if ($.isFunction(arg))
				fn = arg;

			else if (typeof arg === "string") {
				if (/^\./.test(arg)) namespace = $.trim(arg);
				else if (REX_EVENTS.test(arg)) type = $.trim(arg);
				else data = arg;
			}

			else if (arg != null)
				data = arg;
		}

		// Adding a namespace for such cases:
		// $.onKey("enter", ".namespace", ...)
		if (namespace) {
			type = type.split(/\s+/);

			for (i = 0; i < type.length; i++)
				type[i] += namespace;

			type = type.join(" ");
		}

		// Adding the listener
		this.bind(type, data, function(e) {
			for (i = 0; i < combis.length; i++) {
				combi = combis[i];

				if (checkEvent(e, combi)) {
					e.onKey = combi.selector;
					return fn.call(this, e);
				}
			}
		});

		return this;
	};

	$.onKey = function(combis, type, data, fn) {
		$.document.onKey(combis, type, data, fn);
		return $;
	};

	$.onKey.checkEvent = function(e, combisString) {
		var combis = prepareCombis(combisString), i;

		for (i = 0; i < combis.length; i++)
			if (checkEvent(e, combis[i]))
				return combis[i].selector;

		return false;
	};

	return $;
});
