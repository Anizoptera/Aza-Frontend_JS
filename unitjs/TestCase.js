
define(["./unitjs", "./TestItem"], function(unitjs, TestItem)
{
	function TestCase() {
		function runNextTest() {
			if (api.isWorking) {
				api.testItems[++api.currentTestItem]
					? api.testItems[api.currentTestItem].run(api.testSuite, api)
					: caseDone();
			}
		}

		function caseDone() {
			api.isWorking = false;
			api.timeEnd = unitjs.now();

			if (api.isPassed == null)
				api.isPassed = true;

			api.currentTestItem = -1;
			api.testSuite.callListeners("caseDone", [api]);
			api.testSuite.caseDone();
		}


		var api = this;

		api.testItems = [];
		api.currentTestItem = -1;
		api.testSuite = null;
		api.name = api.name || "TestCase";
		api.isPassed = null;
		api.isWorking = false;
		api.timeStart = 0;
		api.timeEnd = 0;


		api.run = function(suite) {
			if (api.isWorking) return api;
			api.isWorking = true;

			api.isPassed = null;
			api.testSuite = suite;

			api.testSuite.callListeners("caseBegin", [api]);

			api.currentTestItem = -1;
			api.timeStart = unitjs.now();

			runNextTest();

			return api;
		};

		api.stop = function() {
			if (api.isWorking) {
				api.isWorking = false;
				api.testItems[api.currentTestItem].done();
				caseDone();
			}
			return api;
		};


		api.addTest = function(name, expect, fn, async /* internal */) {
			api.testItems.push(new TestItem(
				name,
				fn ? expect : -1,
				fn || expect,
				!!async
			));

			return api;
		};

		api.addAsyncTest = function(name, expect, fn) {
			return api.addTest(name, expect, fn, true);
		};

		api.testDone = function() {
			if (api.isWorking) {
				if (!api.testItems[api.currentTestItem].isPassed)
					api.isPassed = false;
				runNextTest();
			}
			return api;
		}
	}

	TestCase.extend = function(caseName, caseFn) {
		if (!caseFn) {
			caseFn = caseName;
			caseName = null;
		}

		var ParentClass = this,
			Test = unitjs.inherit(ParentClass, function() {
				ParentClass.apply(this, arguments);
				this.name = caseName;
				caseFn.apply(this, arguments);
			});

		Test.caseName = caseName;

		return Test;
	};

	return TestCase;
});
