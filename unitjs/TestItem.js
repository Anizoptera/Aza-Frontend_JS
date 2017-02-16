
define(["./unitjs"], function(unitjs)
{
	function TestItem(name, expect, fn, async) {
		function addAssertResult(res, data) {
			if (api.isWorking)
				api[res ? "addOkay" : "addFailure"](data);
		}

		function prepareData(data) {
			return typeof data === "object"
				? data
				: data != null
					? {message: data+""}
					: data || {};
		}

		function done() {
			if (!api.isWorking) return;

			api.timeEnd = unitjs.now();

			if (api.expect >= 0 && api.launched !== api.expect)
				api.addWarning("Expected "+api.expect+" assertions, but "+api.launched+" were run");

			if (api.isPassed == null)
				api.isPassed = true;

			api.isWorking = false;

			api.onDone && api.onDone(api);

			api.testSuite.callListeners("testDone", [api]);
			api.testCase.testDone();
		}


		var api = this;

		api.testSuite = null;
		api.testCase = null;
		api.name = name;
		api.expect = expect;
		api.launched = 0;
		api.isPassed = null;
		api.isWorking = false;
		api.timeStart = 0;
		api.timeEnd = 0;

		api.onDone = null;


		api.run = function(suite, tcase) {
			if (api.isWorking) return api;
			api.isWorking = true;
			api.isPassed = null;

			api.onDone = null;

			api.testSuite = suite;
			api.testCase = tcase;

			api.testSuite.callListeners("testBegin", [api]);
			api.timeStart = unitjs.now();

			try {
				fn.call(api, api);
				async || api.done();
			}
			catch(e) {
				api.addError(e);
				api.done();
				throw e;
			}

			return api;
		};

		api.done = function(timeout) {
			if (api.isWorking) {
				timeout
					? setTimeout(done, timeout)
					: done();
			}
			return api;
		};


		api.addOkay = function(data) {
			if (api.isWorking) {
				api.launched++;
				api.testSuite.callListeners("addOkay", [prepareData(data), api]);
			}
			return api;
		};

		api.addFailure = function(data) {
			if (api.isWorking) {
				api.launched++;
				api.isPassed = false;

				console.error(new Error("\n>> assert"+data.assert+"\n> "+data.expected+"\n> "+data.actual+"\n> "+(data.message||"")));
				api.testSuite.callListeners("addFailure", [prepareData(data), api]);
			}
			return api;
		};

		api.addError = function(e) {
			if (api.isWorking) {
				api.isPassed = false;

				console.error(e);
				api.testSuite.callListeners("addError", [e, api]);
			}
			return api;
		};

		api.addWarning = function(msg) {
			if (api.isWorking) {
				api.isPassed = false;
				api.testSuite.callListeners("addWarning", [msg, api]);
			}
			return api;
		};

		api.addInfo = function(msg) {
			if (api.isWorking) {
				api.testSuite.callListeners("addInfo", [msg, api]);
			}
			return api;
		};


		api.assertEquals = function(actual, expected, msg) {
			addAssertResult(actual == expected, {
				assert: "Equals",
				actual: actual,
				expected: expected,
				message: msg
			});
			return api;
		};

		api.assertSame = function(actual, expected, msg) {
			addAssertResult(actual === expected, {
				assert: "Same",
				actual: actual,
				expected: expected,
				message: msg
			});
			return api;
		};

		api.assertTrue = function(actual, msg) {
			addAssertResult(!!actual, {
				assert: "True",
				actual: actual,
				expected: true,
				message: msg
			});
			return api;
		};

		api.assertFalse = function(actual, msg) {
			addAssertResult(!actual, {
				assert: "False",
				actual: actual,
				expected: false,
				message: msg
			});
			return api;
		};

		api.assertDeep = function(actual, expected, msg) {
			addAssertResult(unitjs.equiv(actual, expected), {
				assert: "Deep",
				actual: actual,
				expected: expected,
				message: msg
			});
			return api;
		};

		api.checkProperties = function(obj, onlyOwn, props) {
			if (!api.isWorking) return api;

			var key, prop;

			if (!props) {
				props = onlyOwn;
				onlyOwn = false;
			}

			for (key in props) {
				if (!onlyOwn || props.hasOwnProperty(key)) {
					prop = props[key];

					if (typeof prop === "string" && /undefined|null|object|array|boolean|number|string|function|date|regexp/.test(prop))
						api.assertSame(unitjs.objectType(obj[key]), prop, "type of «"+key+"» is "+prop);

					else if (prop != null)
						api.assertSame(obj[key], prop, "«"+key+"» is «"+prop+"»");

					else if (prop === undefined)
						api.assertFalse(key in obj, "there is no «"+key+"» in the object");

					// null
					else api.assertTrue(key in obj, "there is «"+key+"» in the object");
				}
			}

			return api;
		}
	}

	return TestItem;
});
