
require.config({
	baseUrl: "../",
	paths: {}
});


_deps_ = [
	"jquery",
	"unitjs/unitjs", "unitjs/TestListener", "unitjs/TestSuite"
];

require(
	_deps_.concat(_allTestDeps_),
	function($, unitjs, TestListener, TestSuite) {
		var CLS_BODY                = "l-body",
			CLS_HEADER              = "l-header",
			CLS_HEADER_ITEM         = CLS_HEADER+"-item",
			CLS_CASETITLE           = "e-caseTitle",
			CLS_TEST                = "e-test",
			CLS_ASSERTSLIST         = "e-assertsList",
			CLS_ASSERT              = "e-assert",

			$body = $(".j-UnitJS-body"),
			$menu = $body.find(".j-menu"),
			$runAllBtn = $body.find(".j-runAllBtn"),
			$items,

			pageTitle = document.title,
			tests = [].slice.call(arguments, _deps_.length),
			currentTest = location.hash.replace("#", ""),
			items = "", activeItem = -1,
			suite, timer, i,

			UnitJsRunnerListener = TestListener.extend(function()
			{
				TestListener.call(this);

				var api = this,
					$content        = $body.find(".j-content"),
					$timer          = $body.find(".j-timer"),
					$passedCounter  = $body.find(".j-passedCounter"),
					$failedCounter  = $body.find(".j-failedCounter"),
					$totalCounter   = $body.find(".j-totalCounter"),
					$test, $testFailed, $testPassed, $testTotal, $asserts;

				api.suiteBegin = function(suite) {
					$body.removeClass(CLS_BODY+"_passed "+CLS_BODY+"_failed");
					$content.html("");
					$passedCounter.html(0);
					$failedCounter.html(0);
					$totalCounter.html(0);
				};

				api.suiteDone = function(suite) {
					$body.addClass(CLS_BODY+(suite.isPassed ? "_passed" : "_failed"));
				};

				api.caseBegin = function(testCase) {
					testCase.testSuite.testCases.length > 1 && $content.append(unitjs.hd(
						'<div class="{caseTitle}">' +
							'<div class="{caseTitle}-line"></div>' +
							'<span class="{caseTitle}-text">'+testCase.name+'</span>' +
						'</div>',
						{ caseTitle: CLS_CASETITLE }
					));
				};

				api.caseDone = function(testCase) {};

				api.testBegin = function(testItem) {
					$test = $(unitjs.hd(
						'<div class="{test} j-test">' +
							'<div class="{test}-head j-head">' +
								'<span class="{test}-head-title">'+testItem.name+'</span>&nbsp;&nbsp;&nbsp;›&nbsp;&nbsp;&nbsp;' +
								'<span class="{test}-head-failed j-failed">0</span>&nbsp;/&nbsp;' +
								'<span class="{test}-head-passed j-passed">0</span>&nbsp;/&nbsp;' +
								'<span class="j-total">0</span>' +
							'</div>' +
							'<div class="{assertsList} j-results"></div>' +
						'</div>',
						{
							test: CLS_TEST,
							assertsList: CLS_ASSERTSLIST
						}
					)).appendTo($content);

					$testFailed = $test.find(".j-failed");
					$testPassed = $test.find(".j-passed");
					$testTotal = $test.find(".j-total");
					$asserts = $test.find(".j-results");

					$test.find(".j-head").click(onTestHeadClick);
				};

				api.testDone = function(testItem) {
					$timer.html(unitjs.now() - testItem.testSuite.timeStart);
				};


				api.addOkay = function(data, testItem) {
					$asserts.append(generateAssert(api, "Okay", data));
					increaseCounter($testPassed);
					increaseCounter($testTotal);
					increaseCounter($passedCounter);
					increaseCounter($totalCounter);
				};

				api.addFailure = function(data, testItem) {
					$asserts.append(generateAssert(api, "Failure", data));
					increaseCounter($testFailed);
					increaseCounter($testTotal);
					increaseCounter($failedCounter);
					increaseCounter($totalCounter);
					$test.addClass(CLS_TEST+"_failed");
				};

				api.addError = function(e, testItem) {
					$asserts.append(generateAssert(api, "Error", e));
					$test.addClass(CLS_TEST+"_failed");
				};

				api.addWarning = function(msg, testItem) {
					$asserts.append(generateAssert(api, "Warning", msg));
					$test.addClass(CLS_TEST+"_failed");
				};

				api.addInfo = function(msg, testItem) {
					$asserts.append(generateAssert(api, "Info", msg));
				}
			});


		for (i = 0; i < tests.length; i++) {
			if (tests[i].caseName === currentTest)
				activeItem = i;
			items += unitjs.hd("<a class='% j-item' href='#%'>%</a>", CLS_HEADER_ITEM, tests[i].caseName);
		}

		$items = $menu.html(items).find(".j-item").click(onItemClick);
		$runAllBtn.click(onItemClick);

		if (currentTest === "RunAll" || activeItem >= 0)
			runTest(activeItem);


		function runTest(id) {
			clearTimeout(timer);
			suite && suite.stop();

			$items.add($runAllBtn).removeClass(CLS_HEADER_ITEM+"_active");
			(id < 0 ? $runAllBtn : $items.eq(id)).addClass(CLS_HEADER_ITEM+"_active");

			document.title = pageTitle + " › " + (id < 0 ? "Everything" : tests[id].caseName);

			suite = new TestSuite();
			suite.addListeners(new UnitJsRunnerListener());

			if (id < 0)
				for (var i = 0; i < tests.length; i++)
					suite.addTestCases( new tests[i]() );
			else
				suite.addTestCases( new tests[id]() );

			// Timeout to let the menu-click-event get completed
			timer = setTimeout(function() {
				suite.run();
			}, 50);
		}

		function increaseCounter($elem) {
		++$elem[0].innerHTML;
	}

		function generateAssert(api, type, data) {
			var table = "",
				tr =    '<tr class="{assert}-%">' +
							'<td class="{assert}-titleCell">%:</td>' +
							'<td class="{assert}-dataCell"><pre>%</pre></td>' +
						'</tr>';

			table += unitjs.hd(tr, "actual", "Actual", unitjs.dump(data.actual));

			if (type === "Failure") {
				table += unitjs.hd(tr, "expected", "Expected", unitjs.dump(data.expected));
				table += unitjs.hd(tr, "diff", "Diff", unitjs.diffString(unitjs.dump(data.expected), unitjs.dump(data.actual)));
			}

			return unitjs.hd(
				'<div class="{assert} {assert_mod}">' +
						'<div class="{assert}-inner">' +
							'<div class="{assert}-message">'+api.generateResultMessage(type, data)+'</div>' +
							'<table class="{assert}-table">'+table+'</table>' +
						'</div>' +
					'</div>',
				{
					assert: CLS_ASSERT,
					assert_mod: CLS_ASSERT+"_"+type.toLowerCase()
				}
			);
		}

		function onItemClick() {
			runTest(
				this === $runAllBtn[0]
					? -1
					: $items.index($(this))
			);
		}

		function onTestHeadClick() {
			$(this).closest(".j-test").toggleClass(CLS_TEST+"_open");
		}
	}
);
