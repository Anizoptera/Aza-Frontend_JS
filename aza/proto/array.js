
define(function()
{
	var ArrayProto = Array.prototype;


	if (!ArrayProto.indexOf)
		// http://es5.github.com/#x15.4.4.14
		Array.prototype.indexOf = function(searchElement, fromIndex) {
			if (this == null)
				throw new TypeError(' this is null or not defined');

			var O = Object(this),
				len = O.length >>> 0,
				i = fromIndex
					? fromIndex < 0 ? Math.max(0, len + fromIndex) : fromIndex	// like in jQuery.inArray
					: 0;

			if (!len || i >= len)
				return -1;

			while (i < len) {
				if (i in O && O[i] === searchElement)
					return i;
				i++;
			}

			return -1;
		};


	if (!ArrayProto.forEach)
		// http://es5.github.com/#x15.4.4.18
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
		Array.prototype.forEach = function(callback, thisArg) {
			if (this == null)
				throw new TypeError('this is null or not defined');

			if ({}.toString.call(callback) != '[object Function]')
				throw new TypeError(callback + ' is not a function');

			var O = Object(this),
				len = O.length >>> 0,
				i = 0;

			while (i < len) {
				if (i in O)
					callback.call(thisArg, O[i], i, O);
				i++;
			}
		};


	if (!ArrayProto.map)
		// http://es5.github.com/#x15.4.4.19
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
		ArrayProto.map = function(callback, thisArg) {
			if (this == null)
				throw new TypeError(' this is null or not defined');

			if ({}.toString.call(callback) != "[object Function]")
				throw new TypeError(callback + " is not a function");

			var O = Object(this),
				len = O.length >>> 0,
				res = new Array(len),
				i = 0;

			while (i < len) {
				if (i in O)
					res[i] = callback.call(thisArg, O[i], i, O);
				i++;
			}

			return res;
		};


	return ArrayProto;
});
