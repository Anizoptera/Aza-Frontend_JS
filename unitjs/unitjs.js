
define(function()
{
	var unitjs = {};


	unitjs.now = function() {
		return (new Date()).getTime();
	};

	unitjs.inherit = function(ParentClass, ChildClass) {
		var protoProps;

		if (typeof ChildClass === "object") {
			protoProps = ChildClass;
			ChildClass = function() { ParentClass.apply(this, arguments) };
		}

		// Set the prototype chain
		function Surrogate() { this.constructor = ChildClass; }
		Surrogate.prototype = ParentClass.prototype;
		ChildClass.prototype = new Surrogate();

		// Add prototype properties
		protoProps && unitjs.extend(ChildClass.prototype, protoProps);

		// Add static properties
		unitjs.extend(ChildClass, ParentClass);

		// Set a convenience property in case the parent's prototype is needed later
		ChildClass.__super__ = ParentClass.prototype;

		return ChildClass;
	};

	unitjs.extend = function(target) {
		var source, key, i;

		for (i = 1; i < arguments.length; i++) {
			source = arguments[i];

			if (source) {

				for (key in source) {
					if (source.hasOwnProperty(key)) {

						if (typeof source[key] === "object") {
							target[key] = unitjs.extend(target[key], source[key]);
						}
						else {
							target[key] = source[key];
						}

					}
				}

			}
		}

		return target;
	};

	unitjs.hd = function(text) {
		var holders = [].slice.call(arguments, 1),
			holder, key;

		if (holders[0]+"" === "[object Object]") {
			holders = holders[0];
			for (key in holders) { if (holders.hasOwnProperty(key)) {
				text = text.replace(
					new RegExp("{" + key + "}", "g"),
					holders[key] !== undefined ? holders[key] : ""
				);
			}}
		}
		else {
			if (holders[0].join) {
				holders = holders[0];
			}

			text = text.replace(/%/g, function() {
				if (holders.length) {
					holder = holders.shift();
				}
				return holder;
			})
		}

		return text;
	};

	/**
	 * Returns extended type of an object
	 *
	 * undefined|null|object|array|boolean|number|string|function|date|regexp
	 *
	 * Form QUnit
	 *
	 * @param obj
	 * @returns {*}
	 */
	unitjs.objectType = function(obj) {
		if (obj === undefined) return "undefined";
		if (obj === null) return "null";

		var match = {}.toString.call(obj).match(/^\[object\s(.*)\]$/),
			type = match && match[1] || "";

		switch (type) {
			case "Number":
				if (isNaN(obj)) return "nan";
				return "number";
			case "String":
			case "Boolean":
			case "Array":
			case "Date":
			case "RegExp":
			case "Function":
				return type.toLowerCase();
		}

		if (typeof obj === "object") return "object";

		return undefined;
	};

	/**
	 * Tests for equality any JavaScript type
	 *
	 * Discussions and reference: http://philrathe.com/articles/equiv
	 * Test suites: http://philrathe.com/tests/equiv
	 * Author: Philippe Rathé <prathe@gmail.com>
	 */
	unitjs.equiv = (function() {
		// About passing arguments:
		//      when < 2   : return true
		//      when 2     : return true if 1st equals 2nd
		//      when > 2   : return true 1st equals 2nd, and 2nd equals 3rd,
		//                      and 3rd equals 4th ... ans so on (by transition)

		// Hoozit
		// Determine what is o.
		function hoozit(o) {
			if (typeof o === "string") {
				return "string";

			} else if (typeof o === "boolean") {
				return "boolean";

			} else if (typeof o === "number") {

				if (isNaN(o)) {
					return "nan";
				} else {
					return "number";
				}

			} else if (typeof o === "undefined") {
				return "undefined";

			// consider: typeof null === object
			} else if (o === null) {
				return "null";

			// consider: typeof [] === object
			} else if (o instanceof Array) {
				return "array";

			// consider: typeof new Date() === object
			} else if (o instanceof Date) {
				return "date";

			// consider: /./ instanceof Object;
			//           /./ instanceof RegExp;
			//          typeof /./ === "function"; // => false in IE and Opera,
			//                                          true in FF and Safari
			} else if (o instanceof RegExp) {
				return "regexp";

			} else if (typeof o === "object") {
				return "object";

			} else if (o instanceof Function) {
				return "function";
			}
		}

		// Call the o related callback with the given arguments.
		function bindCallbacks(o, callbacks, args) {
			var prop = hoozit(o);
			if (prop) {
				if (hoozit(callbacks[prop]) === "function") {
					return callbacks[prop].apply(callbacks, args);
				} else {
					return callbacks[prop]; // or undefined
				}
			}
		}

		return (function() {

			var innerEquiv; // the real equiv function
			var callers = []; // stack to decide between skip/abort functions


			var callbacks = function () {

				// for string, boolean, number and null
				function useStrictEquality(b, a) {
					if (b instanceof a.constructor || a instanceof b.constructor) {
						// to catch short annotaion VS 'new' annotation of a declaration
						// e.g. var i = 1;
						//      var j = new Number(1);
						return a == b;
					}
					else {
						return a === b;
					}
				}

				return {
					"string": useStrictEquality,
					"boolean": useStrictEquality,
					"number": useStrictEquality,
					"null": useStrictEquality,
					"undefined": useStrictEquality,

					"nan": function (b) {
						return isNaN(b);
					},

					"date": function (b, a) {
						return hoozit(b) === "date" && a.valueOf() === b.valueOf();
					},

					"regexp": function (b, a) {
						return hoozit(b) === "regexp" &&
							a.source === b.source && // the regex itself
							a.global === b.global && // and its modifers (gmi) ...
							a.ignoreCase === b.ignoreCase &&
							a.multiline === b.multiline;
					},

					// - skip when the property is a method of an instance (OOP)
					// - abort otherwise,
					//   initial === would have catch identical references anyway
					"function": function () {
						var caller = callers[callers.length - 1];
						return caller !== Object &&
								typeof caller !== "undefined";
					},

					"array": function (b, a) {
						var i;
						var len;

						// b could be an object literal here
						if ( ! (hoozit(b) === "array")) {
							return false;
						}

						len = a.length;
						if (len !== b.length) { // safe and faster
							return false;
						}
						for (i = 0; i < len; i++) {
							if( ! innerEquiv(a[i], b[i])) {
								return false;
							}
						}
						return true;
					},

					"object": function (b, a) {
						var i;
						var eq = true; // unless we can proove it
						var aProperties = [], bProperties = []; // collection of strings

						// comparing constructors is more strict than using instanceof
						if ( a.constructor !== b.constructor) {
							return false;
						}

						// stack constructor before traversing properties
						callers.push(a.constructor);

						for (i in a) { // be strict: don't ensures hasOwnProperty and go deep

							aProperties.push(i); // collect a's properties

							if ( ! innerEquiv(a[i], b[i])) {
								eq = false;
							}
						}

						callers.pop(); // unstack, we are done

						for (i in b) {
							bProperties.push(i); // collect b's properties
						}

						// Ensures identical properties name
						return eq && innerEquiv(aProperties.sort(), bProperties.sort());
					}
				};
			}();

			innerEquiv = function () { // can take multiple arguments
				var args = Array.prototype.slice.apply(arguments);
				if (args.length < 2) {
					return true; // end transition
				}

				return (function (a, b) {
					if (a === b) {
						return true; // catch the most you can

					} else if (typeof a !== typeof b || a === null || b === null || typeof a === "undefined" || typeof b === "undefined") {
						return false; // don't lose time with error prone cases

					} else {
						return bindCallbacks(a, callbacks, [b, a]);
					}

				// apply transition with (1..n) arguments
				})(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
			};

			return innerEquiv;
		})();
	})();

	/**
	 * Dumps an object to string
	 *
	 * Original idea belongs to Saqoosha:
	 * https://github.com/Saqoosha/SAQAS3/blob/master/sh/saqoo/debug/ObjectDumper.as
	 *
	 * @param {*} obj
	 * @param {Number=} maxObjectNests (default=10)
	 * @param {Boolean=} escapeHtml (default=false)
	 * @param {String=} newLineChar (default=\n)
	 * @param {Number=} level internal
	 * @param {String=} prefix internal
	 * @returns {String}
	 */
	unitjs.dump = function(obj, maxObjectNests, escapeHtml, newLineChar, /* internal */ level, /* internal */ prefix) {
		function htmlSpecialChars(val) {
			return escapeHtml ? unitjs.htmlSpecialChars(val) : val;
		}

		function multiplyString(count, str) {
			var res = "", i;
			for (i = 0; i < count; i++)
				res += str;
			return res;
		}

		maxObjectNests = +maxObjectNests || 10;
		newLineChar = newLineChar == null ? "\n" : newLineChar;
		level = +level || 0;
		prefix = prefix || "";

		var str = Object.prototype.toString.call(obj),
			match = /^\[object (.+)\]$/.exec(str),
			type = match ? match[1] : "",

			indent = multiplyString(level, "    "),
			out = "", keys, key, i;

		switch (true) {
			case type === "Array":
			case obj instanceof $:
				out += unitjs.hd("%(%) [% size = %]", indent + prefix, typeof obj, type === "Array" ? type : "jQuery", obj.length) + newLineChar;

				for (i = 0; i < obj.length; i++)
					out += unitjs.dump(obj[i], maxObjectNests, escapeHtml, newLineChar, level + 1, "[" + i + "] = ");

				break;
			case type === "RegExp":
				out += unitjs.hd("%(%) [% %]", indent + prefix, typeof obj, type, obj.source + (obj.global ? "g" : "") + (obj.ignoreCase ? "i" : "") + (obj.multiline ? "m" : "")) + newLineChar;
				break;
			case type === "Function":
				out += unitjs.hd("%(%) %", indent + prefix, typeof obj, htmlSpecialChars(str)) + newLineChar;
				break;
			default:
				out += unitjs.hd("%(%) %", indent + prefix, typeof obj, htmlSpecialChars(type === "String" ? "\"" + obj + "\"" : obj)) + newLineChar;

				if (type === "Object") {
					if (!maxObjectNests || level < maxObjectNests) {
						keys = [];
						for (key in obj) if (obj.hasOwnProperty(key))
							keys.push(key);
						keys.sort();
						for (i = 0; i < keys.length; i++)
							out += unitjs.dump(obj[keys[i]], maxObjectNests, escapeHtml, newLineChar, level + 1, keys[i] + " = ");
					}
					else {
						out += indent + "    ... abbreviated ..." + newLineChar;
					}
				}
		}

		return out;
	};

	/**
	 * Javascript Diff Algorithm
	 *  By John Resig (http://ejohn.org/)
	 *  Modified by Chu Alan "sprite" and Oleg Cherr
	 *  Also modified by Oleg Cherr
	 *
	 * Released under the MIT license.
	 *
	 * More Info:
	 *  http://ejohn.org/projects/javascript-diff-algorithm/
	 */
	unitjs.diffString = (function() {
		function escape(s) {
			return (s+"")
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;");
		}

		function diff(o, n) {
			var ns = {}, os = {}, i;

			for (i = 0; i < n.length; i++) {
				if (ns[ n[i] ] == null)
					ns[ n[i] ] = { rows: [], o: null };
				ns[ n[i] ].rows.push(i);
			}

			for (i = 0; i < o.length; i++) {
				if (os[ o[i] ] == null)
					os[ o[i] ] = { rows: [], n: null };
				os[ o[i] ].rows.push(i);
			}

			for (i in ns) {
				if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
					n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
					o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
				}
			}

			for (i = 0; i < n.length - 1; i++) {
				if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null &&
					n[i + 1] == o[ n[i].row + 1 ]) {
					n[i + 1] = { text: n[i + 1], row: n[i].row + 1 };
					o[n[i].row + 1] = { text: o[n[i].row + 1], row: i + 1 };
				}
			}

			for (i = n.length - 1; i > 0; i--) {
				if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null &&
					n[i - 1] == o[ n[i].row - 1 ]) {
					n[i - 1] = { text: n[i - 1], row: n[i].row - 1 };
					o[n[i].row - 1] = { text: o[n[i].row - 1], row: i - 1 };
				}
			}

			return { o: o, n: n };
		}

		return function(o, n) {
			o = o.replace(/\s+$/, "");
			n = n.replace(/\s+$/, "");

			var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/)),
				str = "", i;

			var oSpace = o.match(/\s+/g);
			if (oSpace == null) {
				oSpace = [""];
			} else {
				oSpace.push("");
			}
			var nSpace = n.match(/\s+/g);
			if (nSpace == null) {
				nSpace = [""];
			} else {
				nSpace.push("");
			}

			if (out.n.length == 0) {
				for (i = 0; i < out.o.length; i++) {
					str += "<del>" + escape(out.o[i]) + oSpace[i] + "</del>";
				}
			} else {
				if (out.n[0].text == null) {
					for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
						str += "<del>" + escape(out.o[n]) + oSpace[n] + "</del>";
					}
				}

				for (i = 0; i < out.n.length; i++) {
					if (out.n[i].text == null) {
						str += "<ins>" + escape(out.n[i]) + nSpace[i] + "</ins>";
					} else {
						var pre = "";

						for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
							pre += "<del>" + escape(out.o[n]) + oSpace[n] + "</del>";
						}
						str += " " + out.n[i].text + nSpace[i] + pre;
					}
				}
			}

			return str;
		}
	})();


	return unitjs;
});
