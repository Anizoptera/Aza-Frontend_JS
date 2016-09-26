
define(["jquery", "./Core"], function($, Aza)
{
	var Debug = {},
		timers = {};


	Debug.measure = function(fn, iterations, timeLimit, useAlert) {
		var ITERATIONS = iterations || 1E3,
			TIME_LIMIT = timeLimit != null ? timeLimit : 10000,
			TESTS_COUNT = 10,
			USE_ALERT = useAlert != null ? useAlert : false,

			log = console.log,
			now = Aza.now,
			totalTime = 0,
			testNum = 0;

		function go() {
			testNum || log("-> go");

			//////////////////////////////////////////////////////////////

			var timeStart = now(),
				time, i;

			for (i = 0; i < ITERATIONS && fn() !== false; i++) { }

			time = now() - timeStart;

			//////////////////////////////////////////////////////////////

			if (!TIME_LIMIT || time <= TIME_LIMIT) {
				USE_ALERT || log(time + "ms");
				totalTime += time;
				testNum++;
			}

			setTimeout(testNum < TESTS_COUNT ? go : done, 500);
		}

		function done() {
			var result = totalTime / TESTS_COUNT,
				mess = "-> " + result + "ms";
			USE_ALERT ? alert(mess) : log(mess);
			Debug.measure.complete(result);
		}

		$("object").remove();

		setTimeout(go, 2000);

		return Aza;
	};

	Debug.measure.complete = function() {};


	Debug.profile = function(name) {
		return timers[name || "Time"] = Aza.now();
	};

	Debug.profileEnd = function(name) {
			name = name || "Time";
			var res = Aza.now() - (timers[name] || Aza.now());
			console.log(name + ": " + res + "ms");
			return res;
		};


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
	Debug.dump = function(obj, maxObjectNests, escapeHtml, newLineChar, /* internal */ level, /* internal */ prefix) {
		function htmlSpecialChars(val) {
			return escapeHtml ? Aza.htmlSpecialChars(val) : val;
		}

		maxObjectNests = +maxObjectNests || 10;
		newLineChar = newLineChar == null ? "\n" : newLineChar;
		level = +level || 0;
		prefix = prefix || "";

		var str = Object.prototype.toString.call(obj),
			match = /^\[object (.+)\]$/.exec(str),
			type = match ? match[1] : "",

			indent = Aza.multiplyString(level, "    "),
			out = "", keys, key, i;

		switch (true) {
			case type === "Array":
			case obj instanceof $:
				out += "%(%) [% size = %]".hd(indent + prefix, typeof obj, type === "Array" ? type : "jQuery", obj.length) + newLineChar;

				for (i = 0; i < obj.length; i++)
					out += Debug.dump(obj[i], maxObjectNests, escapeHtml, newLineChar, level + 1, "[" + i + "] = ");

				break;
			case type === "RegExp":
				out += "%(%) [% %]".hd(indent + prefix, typeof obj, type, obj.source + (obj.global ? "g" : "") + (obj.ignoreCase ? "i" : "") + (obj.multiline ? "m" : "")) + newLineChar;
				break;
			case type === "Function":
				out += "%(%) %".hd(indent + prefix, typeof obj, htmlSpecialChars(str)) + newLineChar;
				break;
			default:
				out += "%(%) %".hd(indent + prefix, typeof obj, htmlSpecialChars(type === "String" ? "\"" + obj + "\"" : obj)) + newLineChar;

				if (type === "Object") {
					if (!maxObjectNests || level < maxObjectNests) {
						keys = [];
						for (key in obj) if (obj.hasOwnProperty(key))
							keys.push(key);
						keys.sort();
						for (i = 0; i < keys.length; i++)
							out += Debug.dump(obj[keys[i]], maxObjectNests, escapeHtml, newLineChar, level + 1, keys[i] + " = ");
					}
					else {
						out += indent + "    ... abbreviated ..." + newLineChar;
					}
				}
		}

		return out;
	};


	return Debug;
});
