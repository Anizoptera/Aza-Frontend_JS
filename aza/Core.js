
define(["jquery", "./browser/Detector"], function($, Detector, undefined)
{
	var Aza = {},

		expandos = {},
		guid = 1,

		toString = Object.prototype.toString,
		ArrayProto = Array.prototype;


	// MICRO-HELPERS

	Aza.noop = function() {};
	Aza.no = function() { return false; };
	Aza.yes = function() { return true; };

	Aza.returner = function(val) {
		return function() { return val; }
	};

	/**
	 * Takes a function and returns a new one that will always have a particular context
	 * @type {Function}
	 */
	Aza.proxy = $.proxy;


	// DATE-TIME

	/**
	 * Returns the time stamp in milliseconds
	 *
	 * @return {Number}
	 */
	Aza.now = function() {
		return Date.now ? Date.now() : (new Date()).getTime();
	};

	/**
	 * Returns the time stamp in seconds
	 *
	 * @return {Number}
	 */
	Aza.nowSec = function() {
		return Math.floor(Aza.now() / 1000);
	};


	// NUMBERS

	/**
	 * Generates a random float point number between [min] and [max] values.
	 *
	 * @param {Number=} min From (default=0)
	 * @param {Number=} max To (default=1)
	 *
	 * @return {Number}
	 */
	Aza.random = function(min, max) {
		if (isNaN(min)) min = 0;
		if (isNaN(max)) max = 1;
		return min + (Math.random() * (max - min));
	};

	/**
	 * Generates a random integer between [min] and [max].
	 *
	 * @param {Number=} min From (default=0)
	 * @param {Number=} max To (default=100)
	 *
	 * @return {Number}
	 */
	Aza.randomInt = function(min, max) {
		return Math.round(Aza.random(min, isNaN(max) ? 100 : max));
	};

	/**
	 * Rounds the number with desired precision
	 *
	 * @param {Number} num          Number
	 * @param {Number=} precision   Precision (should be greater than zero, otherwise an integer will be returned)
	 *
	 * @return {Number}
	 */
	Aza.round = function(num, precision) {
		if (precision) {
			precision = Math.pow(10, precision);
			return Math.round(num * precision) / precision;
		}
		return Math.round(num);
	};

	/**
	 * Concludes the number into a desired range [min..max]
	 *
	 * @param {Number}      num     Number
	 * @param {Number=}     min     Lower bound (pass null to disable normalization)
	 * @param {Number=}     max     Upper bound (pass null to disable normalization)
	 *
	 * @return {Number}
	 */
	Aza.norm = function(num, min, max) {
		num = +num || 0;
		min = min == null ? num : +min;
		max = max == null ? num : +max;
		return (!isNaN(min) && num < min) ? min : (!isNaN(max) && num > max) ? max : num;
	};

	/**
	 * Checks if the number belongs to a target range.
	 *
	 * @param {Number}      num
	 * @param {Number}      min
	 * @param {Number}      max
	 * @param {Boolean=}    strict  Strict check (default=false)
	 *
	 * @return {Boolean}
	 */
	Aza.isBetween = function(num, min, max, strict) {
		return strict
			? num > min && num < max
			: num >= min && num <= max;
	};


	// STRINGS

	/**
	 * Trims whitespaces (or other characters) from the beginning and the ending of a string
	 *  Aza.trim("\t\tHello World  ")   // Hello World
	 *  Aza.trim("Hello World", "Hdle") // o Wor
	 *  Aza.trim("Hello World", "a-z")  // Hello W
	 *
	 * @param {String} str
	 * @param {String=} charlist
	 *
	 * @return {String}
	 */
	Aza.trim = function(str, charlist) {
		return (str + "").replace(
			charlist && (charlist = Aza.regexpEscape(charlist))
				? new RegExp("^[" + charlist + "]+|[" + charlist + "]+$", "g")
				: /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
			""
		);
	};

	Aza.trimLeft = function(str, charlist) {
		return (str + "").replace(
			charlist && (charlist = Aza.regexpEscape(charlist))
				? new RegExp("^[" + charlist + "]+")
				: /^[\s\uFEFF\xA0]+/,
			""
		);
	};

	Aza.trimRight = function(str, charlist) {
		return (str + "").replace(
			charlist && (charlist = Aza.regexpEscape(charlist))
				? new RegExp("[" + charlist + "]+$")
				: /[\s\uFEFF\xA0]+$/g,
			""
		);
	};

	/**
	 * Capitalize first letter of the string or of each work whithin the string.
	 *
	 * @param {String}      string
	 * @param {Boolean=}    eachWord    Capitalize each word (default=false)
	 *
	 * @return {String}
	 */
	Aza.capitalize = function(string, eachWord) {
		if (eachWord) {
			return string.replace(/(^|\s+)(.)/g, function(m, g1, g2) {
				return g1 + g2.toUpperCase();
			});
		}

		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	/**
	 * Склонение существительных после числительных
	 *
	 * @param {Number} n                Собсна число
	 * @param {Array|String} titles        Варианты склонения. Например, "сообщение сообщения сообщений"
	 * @param {Boolean|Number=} full    [opt] Вывести вместе с числом (default=true)
	 * @param {Boolean|Number=} bold    [opt] Обернуть число в тег <b>b</b> (default=false)
	 *
	 * @return {String}
	 */
	Aza.declOfNum = function(n, titles, full, bold) {
		if (titles.substr) titles = titles.split(" ");

		var cases = [2, 0, 1, 1, 1, 2],
			title = titles[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[Math.min(n % 10, 5)]];

		return full || full === undefined ? (bold ? "<b>" + n + "</b>" : n) + " " + title : title;
	};

	/**
	 * Adds leading zeros
	 *
	 * @param num
	 * @param len
	 * @returns {string}
	 */
	Aza.zeroPad = function(num, len) {
		num = num + "";
		return num.length < len
			? (new Array(len).join("0") + num).slice(-len)
			: num;
	};

	/**
	 * Replaces placeholders in a string
	 *
	 * Simple placeholders:
	 *  Aza.hd("This % realy % text", "is", "awesome")
	 *  Aza.hd("This % realy % text", ["is", "awesome"])
	 *
	 * Named placeholders:
	 *  Aza.hd("This {verb} realy {adjective} text", {
	 *      verb: "is",
	 *      adjective: "awesome"
	 *  })
	 *
	 * Instead of ready values the method can receive a function returning the same values:
	 *  Aza.hd("This {verb} realy {adjective} text", getValues)
	 *
	 * @param {String} text - Target string
	 * @param {object|function|Array|...T} obj - Values
	 *
	 * @return {String}
	 */
	Aza.hd = function(text, obj) {
		var args = Aza.slice(arguments, 1);

		if (Aza.isFunction(obj)) {
			obj = obj();
			args = [obj];
		}


		// Named placeholders

		if (obj + "" === "[object Object]") {
			for (var key in obj) if (obj.hasOwnProperty(key)) {
				text = text.replace(
					new RegExp("{" + key + "}", "g"),
					obj[key] !== undefined ? obj[key] : ""
				);
			}

			return text;
		}


		// Simple placeholders

		if (Aza.isArray(obj))
			args = obj;

		return text.replace(/%/g, function() {
			return args.length
				? args.shift()
				: "%";
		})
	};

	/**
	 * Показывает является ли строка полностью апперкейсной
	 * @NOT_USED
	 * @param {String}    text    Строка для анализа
	 *
	 * @return {Boolean}
	 */
	Aza.isUpper = function(text) {
		return text === text.toUpperCase();
	};

	/**
	 * Показывает является ли строка полностью лоуеркейсной
	 * @NOT_USED
	 * @param {String}    text    Строка для анализа
	 *
	 * @return {Boolean}
	 */
	Aza.isLower = function(text) {
		return text === text.toLowerCase();
	};

	/**
	 * Парсит JSON-строку
	 *
	 * @param {String}    data    Строка для парсинга
	 *
	 * @return {Object}    Объект (либо null, если строка пуста или не содержит JSON-данные)
	 */
	Aza.parseJSON = function(data) {
		try {
			return $.parseJSON(data);
		}
		catch (e) { }
		return null;
	};

	/**
	 * Преобразует специальные символы в HTML-сущности
	 *
	 * @param {String|Object|Array}        val        Строка (объект или массив строк) для преобразования
	 * @param {Boolean|Number=}            quotes    [opt] Преобразовывать ли кавычки (default=false)
	 *
	 * @return {String|Object|Array}
	 */
	Aza.htmlSpecialChars = function(val, quotes) {
		var div = document.createElement("div");
		div.appendChild(document.createTextNode(val));
		val = div.innerHTML;

		if (quotes) {
			val = val.replace(/'/g, "&#039;").replace(/"/g, "&quot;");
		}

		return val;
	};

	/**
	 * Преобразует специальные HTML-сущности обратно в соответствующие символы
	 *
	 * @param {String|Object|Array}        val        Строка (объект или массив строк) для преобразования
	 *
	 * @return {String|Object|Array}
	 */
	Aza.htmlSpecialCharsDecode = function(val) {
		var div = document.createElement("div");
		div.innerHTML = val;
		val = div.firstChild && div.firstChild.nodeValue;
		return val || "";
	};

	/**
	 * Removes html-tags from a string
	 * @param {String|*} html
	 * @return {String}
	 */
	Aza.stripHtml = function(html) {
		return (html + "").replace(/<(?:.|\n)*?>/gm, "");
	};

	/**
	 * Экранирует строку для regexp
	 *
	 * Перед символами ()[]|$^.?+*{} ставит обратный слэш
	 *
	 * @param {String}    val    Строка для преобразования
	 *
	 * @return    {String}
	 */
	Aza.regexpEscape = function(val) {
		return (val + "").replace(/[\][{}()*+?.\\^$|]/g, "\\$&");
	};

	/**
	 * Duplicate the string a few times
	 *
	 * @param {Number}    count
	 * @param {String}    str
	 *
	 * @return {String}
	 */
	Aza.multiplyString = function(count, str) {
		var res = "", i;
		for (i = 0; i < count; i++) {
			res += str;
		}
		return res;
	};

	/**
	 * Converts cyrillic letters into translit
	 * @param {String} str
	 * @return {String}
	 */
	Aza.translit = function(str) {
		var dict = {
			'А': 'A',
			'а': 'a',
			'Б': 'B',
			'б': 'b',
			'В': 'V',
			'в': 'v',
			'Г': 'G',
			'г': 'g',
			'Д': 'D',
			'д': 'd',
			'Е': 'E',
			'е': 'e',
			'Ё': 'E',
			'ё': 'e',
			'Ж': 'Zh',
			'ж': 'zh',
			'З': 'Z',
			'з': 'z',
			'И': 'I',
			'и': 'i',
			'Й': 'I',
			'й': 'i',
			'К': 'K',
			'к': 'k',
			'Л': 'L',
			'л': 'l',
			'М': 'M',
			'м': 'm',
			'Н': 'N',
			'н': 'n',
			'О': 'O',
			'о': 'o',
			'П': 'P',
			'п': 'p',
			'Р': 'R',
			'р': 'r',
			'С': 'S',
			'с': 's',
			'Т': 'T',
			'т': 't',
			'У': 'U',
			'у': 'u',
			'Ф': 'F',
			'ф': 'f',
			'Х': 'H',
			'х': 'h',
			'Ц': 'C',
			'ц': 'c',
			'Ч': 'Ch',
			'ч': 'ch',
			'Ш': 'Sh',
			'ш': 'sh',
			'Щ': 'Sch',
			'щ': 'sch',
			'Ъ': "'",
			'ъ': "'",
			'Ы': 'Y',
			'ы': 'y',
			'Ь': "'",
			'ь': "'",
			'Э': 'E',
			'э': 'e',
			'Ю': 'Yu',
			'ю': 'yu',
			'Я': 'Ya',
			'я': 'ya'
		};

		return str.replace(/./g, function(char) {
			return dict[char] || char;
		});
	};

	/**
	 * Converts any non-latin symbols into translit, which can be used in url
	 * @param {String} str
	 * @return {String}
	 */
	Aza.translitUrl = function(str) {
		str = Aza.translit(str.toLowerCase())
			.replace(/['`]+/g, "")
			.replace(/(\w)\-(\w)/g, "$1_$2")
			.replace(/[^_a-z0-9]/g, "-")
			.replace(/\-+/g, "-");
		return Aza.trim(str, "-");
	};

	/**
	 * Returns the mutual parts from beginnings and endings of 2 strings.
	 *  Aza.getMutualParts("abcdef", "abef") // [ab, ef]
	 *
	 * @see CoreTest
	 *
	 * @param str1
	 * @param str2
	 * @returns {*[]}
	 */
	Aza.getMutualParts = function(str1, str2) {
		var i = 0, j = 1;

		while (i < str1.length && str1[i] === str2[i])
			i++;

		while ((j < str1.length - i || j < str2.length - i) && str1[str1.length - j] === str2[str2.length - j])
			j++;

		var start = str1.substr(0, i);
		var end = j > 1 ? str2.slice(-j + 1) : "";

		return [start, end];
	};

	Aza.splitAroundPos = function(str, pos, delimiter) {
		var i = pos, left, right;

		while (--i >= 0)
			if (str[i] === delimiter)
				break;

		left = i;

		i = pos - 1;
		while (++i < str.length)
			if (str[i] === delimiter)
				break;

		right = i;

		return [str.substr(0, left), str.substring(left + 1, right), str.substring(right + 1)];
	};


	// OBJECTS & ARRAYS

	/**
	 * Итерирует объекты и массивы
	 */
	Aza.each = $.each;

	/**
	 * Merges the contents of two or more objects together into the first object
	 */
	Aza.extend = $.extend;

	/**
	 * Controlled merge the contents of two or more objects together into the first object
	 * <tt>
	 *     Aza.flextend("key1 key2", obj1, obj2);
	 *
	 *     Aza.flextend(["key1", "key2"], obj1, obj2);
	 *
	 *     Aza.flextend({
	 *         key1:"nested1 nested2",
	 *         key2:["nested3", "nested4"]
	 *     }, obj1, obj2);
	 * </tt>
	 *
	 * @param {String|Array|Object}    deepKeys    Keys for deep extending
	 * @return {*}
	 */
	Aza.flextend = function(deepKeys) {
		var target = arguments[1],
			deeps = deepKeys || {},
			options, name, src, copy, copyIsArray, clone, i, j;

		if (typeof deepKeys === "string") {
			deepKeys = deepKeys.split(" ");
		}

		if (Aza.isArray(deepKeys)) {
			deeps = {};
			for (j = 0; j < deepKeys.length; j++) {
				deeps[deepKeys[j]] = null;
			}
		}

		for (i = 2; i < arguments.length; i++) {

			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {

				// Extend the base object
				for (name in options) {
					if (options.hasOwnProperty(name)) {
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if deep
						if (deeps[name] !== undefined && copy && (Aza.isPlainObject(copy) || (copyIsArray = Aza.isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && Aza.isArray(src) ? src : [];
							}
							else {
								clone = src && Aza.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = Aza.flextend(deeps[name], clone, copy);
						}

						// Don't bring in undefined values
						else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}

			}

		}

		// Return the modified object
		return target;
	};

	/**
	 * Controlled merge the contents of two or more objects together into the first object
	 * <tt>
	 *     Aza.advancedMerge({
	 *         param1: 1,
	 *         param2: 2
	 *     }, {
	 *         "!param1": 11,   // replace
	 *         "^param2": null  // remove
	 *     })
	 * </tt>
	 * @param {Array|Object} target
	 * @returns {*}
	 */
	Aza.advancedMerge = function(target) {
		var args = arguments,
			from, src, copy, isCopyArray,
			key, i, j, offset;

		for (i = 1; i < args.length; i++) {
			from = args[i];

			// Only deal with non-null/undefined values
			if (from != null) {

				// Merge arrays
				if (Aza.isArray(from)) {
					offset = Aza.isArray(target) ? target.length : 0;

					for (j = 0; j < from.length; j++) {
						target[offset + j] = from[j];
					}

					continue;
				}

				// Extend the base object
				for (key in from) {
					if (from.hasOwnProperty(key)) {

						copy = from[key];
						src = target[key];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						if (key[0] !== "^") {
							if (copy === undefined) {
								continue;
							}

							if (key[0] === "!") {
								target[key.slice(1)] = copy;
							}
							else if (copy && (Aza.isPlainObject(copy) || (isCopyArray = Aza.isArray(copy)))) {

								if (isCopyArray) {
									isCopyArray = false;
									src = src && Aza.isArray(src) ? src : [];
								}
								else {
									src = src && Aza.isPlainObject(src) ? src : {};
								}

								// Never move original objects, clone them
								target[key] = Aza.advancedMerge(src, copy);
							}
							else {
								target[key] = copy;
							}

						}
						else {
							delete target[key.slice(1)];
						}

					}
				}

			}

		}

		return target;
	};

	/**
	 * Пытается преобразовать любой объект в массив
	 *
	 * Принимает:
	 *    1. Исходный объект
	 *    2. Результирующий массив - будет расширен вновь созданным
	 *        (если не передать, будет создан новый массив).
	 */
	Aza.makeArray = $.makeArray;

	/**
	 * Получает значение из объекта по указанному пути
	 *
	 * <tt>
	 *     Aza.getPath({some: {other: 123}}, "some.other") // 123
	 * </tt>
	 *
	 * @param {Object}    obj        Объект
	 * @param {String}    path    Путь
	 *
	 * @return {*}    То что находится по указанному пути, либо undefined, если такого пути нет
	 */
	Aza.getPath = function(obj, path) {
		path = (path = path && path + "") ? path.split(".") : [];

		var res = obj,
			i = 0;

		for (; i < path.length; i++) {
			res = res && res[path[i]];
			if (res === undefined) {
				break;
			}
		}

		return res;
	};

	/**
	 * Добаляет в объект значение по указанному пути
	 *
	 * <tt>
	 *     Aza.setPath({}, "some.other", 123) // {some: {other: 123}}
	 * </tt>
	 *
	 * @param {Object}    obj        Расширяемый объект
	 * @param {String}    path    Путь
	 * @param {*}        val        Данные
	 *
	 * @return {Object}    Расширяемый объект
	 */
	Aza.setPath = function(obj, path, val) {
		path = (path = path && path + "") ? path.split(".") : [];

		var len = path.length,
			tmp = obj,
			pt, i = 0;

		for (; i < len; i++) {
			pt = path[i];
			if (i === len - 1) {
				tmp[pt] = val;
			}
			else {
				tmp = typeof tmp[pt] === "object" && tmp[pt] || (tmp[pt] = {});
			}
		}

		return obj;
	};

	/**
	 * Аналог Array.slice()
	 * Возвращает часть массива.
	 * Оригинальный массив при этом не изменяется.
	 * Подходит для работы с защищёнными массивами (такими как arguments).
	 * Также подходит для строк.
	 *
	 * <tt>
	 *     Aza.slice([1,2,3,4,5], 1, 4)        // [2, 3, 4]
	 *     Aza.slice("sometext", 1, 4)        // "ome"
	 * </tt>
	 *
	 * @param {Array} obj        Массив для обработки
	 * @param {Number=} start    [opt] Начальный индекс (default=0)
	 * @param {Number=} end        [opt] Конечный индекс (default=length)
	 *
	 * @return {Array} Новый массив
	 */
	Aza.slice = function(obj, start, end) {
		var isString = typeof obj === "string",
			res = ArrayProto.slice.call(
				obj,
				start || 0,
				isNaN(end) ? obj.length : end
			);

		return isString ? res.join("") : res;
	};

	/**
	 * Аналог Array.splice()
	 * Добавляет/удаляет элементы в/из массива.
	 * Возвращает удалённые элементы.
	 * <b>Метод изменяет оригинальный массив.</b>
	 * Подходит для работы с защищёнными массивами (такими как arguments)
	 *
	 * @param {Array} arr        Массив для обработки
	 * @param {Number=} start    [opt] Начальный индекс (default=0)
	 * @param {Number=} howmany    [opt] Количество элементов для удаления (default=1)
	 * @param {*=} rest            [opt] Элементы, которые будут добавлены в массив на место удалённых
	 *
	 * @return {Array} Удалённые элементы
	 */
	Aza.splice = function(arr, start, howmany, rest) {
		var args = Aza.slice(arguments, 1);

		if (!args[0]) args[0] = 0;
		if (isNaN(args[1])) args[1] = 1;

		return ArrayProto.splice.apply(arr, args);
	};

	/**
	 * Заполняет объект данными из массива или другого объекта.
	 *
	 * Aza.fillObject("p1 p2", {p1:"a", p2:"b", p3:"c"})
	 * => {p1: "a", p2: "b"}
	 *
	 * Aza.fillObject({
	 *     raw: {p:"a"},						// объект для заполнения (можно не передавать, тогда будет создан новый объект)
	 *     keys: "p1 p2 p3",					// массив ключей или строка с ключами через пробел
	 *     data: {p1:"b", p2:"c"},				// данные (массив или объект)
	 *     defaults: {p1:"d", p2:"e", p3:"f"}	// объект данных по умолчанию
	 * })
	 * => {p: "a", p1: "b", p2: "c", p3: "f"}
	 *
	 * @param {String|Object}    keys        Keys or options
	 * @param {Object=}        data        The data object
	 *
	 * @return {Object}
	 */
	Aza.fillObject = function(keys, data) {
		var opts = Aza.isPlainObject(keys) ? Aza.extend({}, keys) : {keys: keys};

		data = data != null ? data : opts.data;
		keys = (keys = opts.keys).join ? keys : keys.split(" ");

		var raw = opts.raw || {},
			defaults = opts.defaults,

			dataIsArray = Aza.isArray(data),
			dataItem, key, i;

		for (i = 0; i < keys.length; i++) {
			key = keys[i];
			dataItem = data[dataIsArray ? i : key];
			if (dataItem !== undefined) {
				raw[key] = dataItem;
			}
		}

		if (defaults) {
			for (key in defaults) {
				if (defaults.hasOwnProperty(key) && raw[key] === undefined) {
					raw[key] = defaults[key];
				}
			}
		}

		return raw;
	};

	/**
	 * Очищает объект
	 *
	 * @param {Object} obj    Объект для очистки
	 *
	 * @return {Aza}
	 */
	Aza.clearObject = function(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				delete obj[key];
			}
		}

		return obj;
	};

	/**
	 * Очищает массив
	 *
	 * @param {Array} arr    Массив для очистки
	 *
	 * @return {Aza}
	 */
	Aza.clearArray = function(arr) {
		Aza.splice(arr, 0, arr.length);
		return arr;
	};

	/**
	 * Возвращает первый элемент объекта
	 *
	 * <tt>
	 *     Aza.firstItem({some: {other: 123}})        // {other: 123}
	 *     Aza.firstItem({some: {other: 123}}, 2)    // 123
	 * </tt>
	 *
	 * @param {*}            obj        Объект
	 * @param {Number=}        depth    Глубина
	 *
	 * @return {*}
	 */
	Aza.firstItem = function(obj, depth) {
		depth = depth || 1;

		var res, key;

		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				res = obj[key];
				break;
			}
		}

		if (res === undefined) {
			return res;
		}

		if (depth === true) {
			if (Aza.isArray(res) || Aza.isPlainObject(res)) {
				return Aza.firstItem(res, depth);
			}
		}
		else if (depth > 1) {
			return Aza.firstItem(res, depth - 1);
		}

		return res;
	};

	/**
	 * Показывает, имеет ли объект один из указанных ключей
	 * @NOT_USED
	 * @param {*}    obj        Объект для анализа
	 *
	 * @return {Boolean}
	 */
	Aza.hasProp = function(obj) {
		var props = Aza.slice(arguments, 1),
			i = 0;

		for (; i < props.length; i++) {
			if (obj.hasOwnProperty(props[i])) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Показывает, имеет ли объект каждый из указанных ключей
	 * @NOT_USED
	 * @param {*}    obj        Объект для анализа
	 *
	 * @return {Boolean}
	 */
	Aza.hasAllProp = function(obj) {
		var props = Aza.slice(arguments, 1),
			i = 0;

		for (; i < props.length; i++) {
			if (!obj.hasOwnProperty(props[i])) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Выполняет поиск элемента в массиве
	 *
	 * @param {*}        searchElement    Элемент для поиска
	 * @param {Array}    array            Массив для поиска
	 * @param {Number=}    fromIndex        Начальный индекс
	 *
	 * @return {Number} Индекс элемента (если найден), либо -1 (если отсутствует)
	 */
	Aza.inArray = $.inArray;

	/**
	 * Собирает указанные ключи одного объекта в новый объект
	 *
	 * Первым параметром принимает исходный объект с данными.
	 * Вторым - ключи, которые необходимо сохранить из исходного объекта в новый.
	 * Остальными параметрами можно передать дополнительные объекты,
	 * которыми будет расширен только что созданный объект.
	 *
	 * Aza.keysCollector(obj, "key1 key2 key3");
	 * Aza.keysCollector(obj, "key1 key2 key3", objForExtend, objForExtend2, ...);
	 * Aza.keysCollector(obj, ["key1", "key2", "key3"], objForExtend, objForExtend2, ...);
	 *
	 * @param {*}                obj        Исходный объект
	 * @param {String|Array}    keys    Ключи. Либо строка с ключами, разделёнными пробелами, либо массив ключей.
	 *
	 * @return {Object}
	 */
	Aza.keysCollector = function(obj, keys) {
		var rest = Aza.slice(arguments, 2),
			res = {}, key, i;

		if (!keys.join) {
			keys = keys.split(" ");
		}

		for (i = 0; i < keys.length; i++) {
			if (obj[key = keys[i]] != null) {
				res[key] = obj[key];
			}
		}

		for (i = 0; i < rest.length; i++) {
			Aza.extend(res, rest[i]);
		}

		return res;
	};

	/**
	 * Collects methods of an object and runs them in correct context.
	 * Properties can be collected too.
	 *
	 * @param {Object}            obj        Source object
	 * @param {String|Array}    keys    Keys
	 *
	 * @return {Object}
	 */
	Aza.proxyCollector = function(obj, keys) {

		function makeFn(fn) {
			return function() {
				return fn.apply(obj, Aza.slice(arguments));
			}
		}

		if (!keys.join) {
			keys = keys.split(" ");
		}

		var orig = Aza.keysCollector(obj, keys),
			res = {}, key, src, i;

		for (i = 0; i < keys.length; i++) {
			key = keys[i];
			src = orig[key];

			res[key] = Aza.isFunction(src)
				? makeFn(src)
				: src;
		}

		return res;
	};

	/**
	 * Removes an element from array.
	 * @param array
	 * @param elem
	 * @returns {*} Removed element or undefined
	 */
	Aza.removeFromArray = function(array, elem) {
		var idx = array.indexOf(elem);
		return idx >= 0 ? array.splice(idx, 1)[0] : undefined;
	};


	// DATA TYPES

	/**
	 * Проверка типа через typeof
	 *
	 * @param {*}        obj        Объект для проверки
	 * @param {String}    type    Тип
	 *
	 * @return {Boolean}
	 */
	Aza.typeOf = function(obj, type) {
		return typeof obj === type;
	};

	Aza.isFunction = $.isFunction;
	Aza.isArray = $.isArray;
	Aza.isEmptyObject = $.isEmptyObject;
	Aza.isPlainObject = $.isPlainObject;

	/**
	 * Проверяет является ли объект числом.
	 * А точнее числоподнобным объектом.
	 * Это значит, что числом распознается не только Number 123, но и строка "123", и даже массив [123]
	 * Если необходимо проверить на тип, достаточно <tt>typeof obj === "number"</tt>
	 *
	 * @param {*} obj    Объект для проверки
	 *
	 * @return {Boolean}
	 */
	Aza.isNumeric = $.isNumeric;

	/**
	 * Проверяет является ли объект объектом arguments.
	 *
	 * @param {*} obj    Объект для проверки
	 *
	 * @return {Boolean}
	 */
	Aza.isArguments = function(obj) {
		if (obj
			&& typeof obj === "object"
			&& typeof obj.length === "number"
			&& typeof obj.callee === "function"
			&& toString.call(obj) === (Detector.browser.opera || Detector.browser.msie ? "[object Object]" : "[object Arguments]")
		) {
			// В объектах Arguments форычиться могут только ключи данных (т.е. 0,1,2,... - как в обычном массиве).
			// length и callee не попадают в for даже несмотря на то, что они вроде бы как собственные:
			// arguments.hasOwnProperty("length") // true
			// arguments.hasOwnProperty("callee") // true
			for (var key in obj)
				if (!/^\d+$/.test(key))
					return false;

			// Выполняем проверку на возможность передачи проверяемого объекта в качестве Arguments.
			// Если объект не может быть передан в качестве Arguments, возникнет TypeError.
			try {
				return (function() {
					return !!arguments;
				}).apply(null, obj);
			}
			catch (e) {}
		}

		return false;
	};

	/**
	 * Проверяет является ли объект объектом RegExp
	 *
	 * @param {*} obj    Объект для проверки
	 *
	 * @return {Boolean}
	 */
	Aza.isRegExp = function(obj) {
		return toString.call(obj) === "[object RegExp]";
	};

	/**
	 * Проверяет является ли объект объектом AzaAPI
	 *
	 * @param {*} obj    Объект для проверки
	 *
	 * @return {Boolean}
	 */
	Aza.isAPI = function(obj) {
		return toString.call(obj) === "[object AzaAPI]";
	};

	/**
	 * Приводит значение к указанному типу
	 *
	 * @param {*} val        объект для преобразования
	 * @param {String} type    к какому типу приводить (bool|number|int|string|array)
	 *
	 * @return {*}
	 */
	Aza.to = function(val, type) {
		var method = aza["to" + Aza.capitalize(type.toLowerCase())];
		return method ? method(val) : val;
	};

	/**
	 * Приводит к boolean.
	 * Рекомендуется использовать в случаях, когда необходимо распознать строку или число.
	 * В остальных случаях достаточно <tt>!!obj</tt>
	 *
	 * @param {*} val    объект для преобразования
	 *
	 * @return {Boolean}
	 */
	Aza.toBool = function(val) {
		return typeof val === "string" && /^(?:false|null|undefined|NaN)$/.test(val)
			? false
			: !!(
			isNaN(val)
				? val
				: val * 1
		);
	};

	/**
	 * Приводит к Number.
	 * Рекомендуется использовать в случаях, когда необходимо распознать строку.
	 * Например: "12.4", "-0.1", "1,2"
	 * В остальных случаях достаточно <tt>+num</tt>
	 *
	 * @param {*} val    объект для преобразования
	 *
	 * @return {Number}
	 */
	Aza.toNumber = function(val) {
		if (typeof val === "string") {
			val = val.replace(/,/g, ".").match(/\-?\d+(?:\.\d+)?/);
		}

		return Number(val) || 0;
	};

	/**
	 * Приводит к округлённому Number.
	 * Рекомендуется использовать в случаях, когда необходимо распознать строку.
	 * Например: "12.4", "-0.1", "1,2"
	 * В остальных случаях достаточно <tt>Aza.round(+num)</tt>
	 *
	 * @param {*} val    объект для преобразования
	 *
	 * @return {Number}
	 */
	Aza.toInt = function(val) {
		return Math.round(Aza.toNumber(val));
	};

	/**
	 * Приводит к String.
	 *
	 * @param {*} val    объект для преобразования
	 *
	 * @return {String}
	 */
	Aza.toString = function(val) {
		return arguments.length ? String(val) : "[object Anizoptera]";
	};

	/**
	 * Приводит к Array
	 *
	 * @param {*} val    объект для преобразования
	 *
	 * @return {Array}
	 */
	Aza.toArray = function(val) {
		return $.makeArray(val);
	};

	/**
	 * Выполняет поиск элемента заданного типа в объекте или массиве
	 * Возвращает первый подходящий объект, либо undefined
	 *
	 * Aza.findType([123, function(){}], "function")    // function(){}
	 * Aza.findType([123, function(){}], "number")        // 123
	 * Aza.findType([123, 456], "number")                // 123
	 *
	 * @param {Array|Object}    obj        Где искать
	 * @param {String}            type    Какой тип искать
	 *
	 * @return {*}
	 */
	Aza.findType = function(obj, type) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === type) {
					return obj[key];
				}
			}
		}
		return null;
	};


	// CLASSES

	/**
	 * Inherits the prototype methods from one constructor into another
	 * Good explanation of usage: http://coffeescript.org/#classes
	 *
	 * @param ParentClass
	 * @param ChildClass
	 * @return {*}
	 */
	Aza.inherit = function(ParentClass, ChildClass) {
		// Set the prototype chain
		function Surrogate() { this.constructor = ChildClass; }

		Surrogate.prototype = ParentClass.prototype;
		ChildClass.prototype = new Surrogate();

		// Add static properties
		Aza.extend(ChildClass, ParentClass);

		// Set a convenience property in case the parent's prototype is needed later
		ChildClass.__super__ = ParentClass.prototype;

		return ChildClass;
	};

	/**
	 * Sets the prototype chain, for subclass
	 *
	 * @param ParentClass
	 * @param protoProps
	 * @param staticProps
	 * @return {*}
	 */
	Aza.extendClass = function(ParentClass, protoProps, staticProps) {
		// Create the constructor of new class
		var ChildClass = protoProps && protoProps.hasOwnProperty("constructor")
			? protoProps.constructor
			: function() { ParentClass.apply(this, arguments); };

		// Inherit the prototype methods
		Aza.inherit(ParentClass, ChildClass);

		// Add prototype properties
		protoProps
		&& Aza.extend(ChildClass.prototype, protoProps);

		// Add static properties
		staticProps
		&& Aza.extend(ChildClass, staticProps);

		return ChildClass;
	};

	/**
	 * Creates a class that pretends to be an another class
	 * @param MainClass
	 * @param args
	 * @return {Function}
	 */
	Aza.createSurrogateClass = function(MainClass, args) {
		function SurrogateClass() {
			MainClass.apply(this, (args || []).concat(Aza.slice(arguments)));
		}

		SurrogateClass.prototype = MainClass.prototype;
		Aza.extend(SurrogateClass, MainClass);
		return SurrogateClass;
	};


	// OTHER

	/**
	 * Generates an unique (whithin the instance of the framework) identifier:
	 * <prefix><8-digit number><suffix>
	 *
	 * @param {String=}    prefix
	 * @param {String=}    suffix
	 * @return {String}
	 */
	Aza.makeExpando = function(prefix, suffix) {
		var expando = (prefix || "") + Aza.randomInt(1000, 9999) + (Aza.now() + "").slice(-4) + (suffix || "");

		if (expandos[expando])
			return Aza.makeExpando(prefix, suffix);

		expandos[expando] = true;

		return expando;
	};

	/**
	 * Unique expando of the framework instance
	 *
	 * @const
	 * @type {String}
	 */
	Aza.expando = Aza.makeExpando("Aza");

	/**
	 * Получает/записывает/обновляет уникальный id любого объекта.
	 *
	 * @param {Object=} obj        Объект для уникализации
	 *                            Если не передан, функция вернёт число - следующий свободный id.
	 *                            Если объект не содержит id, он будет создан и записан (в случае отсутствия mode).
	 * @param {Number=} mode    Режим работы (используется только в случае, если передан объект).
	 *                            mode = 1 - Только получение id. Если id отсутствует, вернётся false.
	 *                            mode = 2 - Принудительное обновление id (даже в случае, если id уже есть).
	 *
	 * @return {Number|Boolean} id
	 */
	Aza.guid = function(obj, mode) {
		return obj
			? mode != 2 && obj[Aza.expando] || mode != 1 && (obj[Aza.expando] = guid++)
			: guid++;
	};


	/**
	 * Сравнивает объект с переданными аргументами
	 *
	 * <tt>
	 *     Aza.equal("some", "here", "is", "some", "text")    // true
	 *     Aza.equal("some", "text")                        // false
	 *     Aza.equal("some", "here", "is", /\d+/, "text")    // false
	 *     Aza.equal("some", "here", "is", /\D+/, "text")    // true
	 * </tt>
	 *
	 * @param {*}    obj
	 *
	 * @return {Boolean}
	 */
	Aza.equal = function(obj) {
		var arg, i;

		for (i = 1; i < arguments.length; i++) {
			arg = arguments[i];
			if (obj === arg || ((Aza.isRegExp(arg) && typeof arg === "string" && arg.test(obj)))) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Возвращает только цифровые символы из любой строки или параметра id переданного DOM-объекта
	 *
	 * aza.getNum("some123text456here") === 123456
	 * aza.getNum(document.getElementById("some123id")) === 123
	 * aza.getNum($("#some123id")) === 123
	 *
	 * @param {*}    data    Строка или DOM-объект
	 *
	 * @return {Number} Полученное число
	 */
	Aza.getNum = function(data) {
		if (typeof data === "object") {
			if (data.jquery) {
				data = data[0] && data[0].id || 0;
			}
			else if (data.nodeName) {
				data = data[0].id;
			}
		}

		return parseInt(String(data).replace(/\D+/g, "")) || 0;
	};

	/**
	 * Calls a function if the passed object is a function
	 * Otherwise just returns that object.
	 *
	 * @param {*}        obj        Object for check
	 * @param {Array=}    args    Arguments to pass in the function
	 * @param {*=}        context    Context for the function
	 *
	 * @return {*}    Result of calling function (if obj is a function) or obj (if it is not a function)
	 */
	Aza.ifFunction = function(obj, args, context) {
		return obj && Aza.isFunction(obj) ? obj.apply(context || this, args || []) : obj;
	};

	/**
	 * Gets template from the script element.
	 * @param id - Template name (#tpl_name)
	 * @returns {string}
	 */
	Aza.getTpl = function(id) {
		return $("#tpl_" + id).html() || "";
	};

	/**
	 * Creates jQuery object from a script template.
	 * @param id - Template name (#tpl_name)
	 * @param {...*} _args - Values for wildcards in the template
	 * @returns {jQuery}
	 */
	Aza.initTpl = function(id, _args) {
		var args = Aza.slice(arguments);
		args[0] = Aza.getTpl(id);
		return $(Aza.hd.apply(Aza, args));
	};

	Aza.refresh = function() {
		location.reload();
	};

	Aza.redirect = function(url) {
		location.assign(url);
	};

	Aza.replace = function(url) {
		location.replace(url);
	};


	Aza.datalize = (function() {
		var cache = {};

		function data(path, val) {
			var object = this,
				guid = Aza.guid(object),
				data = cache[guid] || (cache[guid] = {});

			if (val === undefined) {
				return path == null
					? data
					: Aza.getPath(data, path);
			}

			Aza.setPath(data, path, val);

			return object;
		}

		return function(object) {
			object.data = data;
			return object;
		}
	})();

	Aza.processConfig = (function() {
		var REX_VAR = /\$\{((?:\.\.\/)*)([^{}]+)\}/g;

		function getPath(cfg, match, currPath) {
			var backward = match[1],    //  "../../"
				forward = match[2];     //  "core.web.main"

			if (backward) {
				var count = backward.split("/").length - 1;

				currPath = currPath.split(".");

				while (count-- > 0) {
					currPath.pop();
				}

				forward = (currPath.length ? currPath.join(".") + "." : "") + forward;
			}

			return Aza.getPath(cfg, forward);
		}

		/**
		 * Processing of configuration objects
		 * @param {Object} cfg
		 * @param currBranch
		 * @param currPath
		 * @returns {Object}
		 */
		return function(cfg, /*internal*/ currBranch, /*internal*/ currPath) {
			var branch, key, match, ref, path;

			currBranch = currBranch || cfg;

			for (key in currBranch) {
				if (currBranch.hasOwnProperty(key)) {

					branch = currBranch[key];
					path = (currPath ? currPath + "." : "") + key;

					if (Aza.isArray(branch) || Aza.isPlainObject(branch)) {
						Aza.processConfig(cfg, branch, path);
					}

					else if (typeof branch === "string") {
						while (match = REX_VAR.exec(branch)) {
							ref = getPath(cfg, match, path);

							if (match[0] === branch) {
								currBranch[key] = ref;
							}
							else {
								currBranch[key] = currBranch[key].replace(match[0], ref);
							}
						}
					}

				}
			}

			return cfg;
		}
	})();

	Aza.goingOn = (function() {
		var globalOn = false,
			instanceNum = 1;

		return function() {
			var localOn = false,
				name = "going" + (instanceNum++);

			function fn(loc, glob) {
				var foreignGlobal = globalOn && globalOn !== name,
					argumentsLen = arguments.length;

				if (!argumentsLen) {
					return foreignGlobal ? true : localOn;
				}

				if (!loc) {
					localOn = false;
					if (argumentsLen < 2) {
						return;
					}
				}

				if (localOn || foreignGlobal) {
					return true;
				}

				localOn = !!loc;

				if (argumentsLen > 1) {
					globalOn = glob ? name : false;
				}

				return false;
			}

			fn.off = function() {
				return fn(0);
			};

			return fn;
		}
	})();


	Aza.datalize(Aza);
	Aza.guid(Aza);


	return Aza;
});
