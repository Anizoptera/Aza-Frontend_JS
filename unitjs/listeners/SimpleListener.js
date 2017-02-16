
define(["../TestListener"], function(TestListener)
{
	var CLS_MAIN            = "UnitJSSimLis",

		CLS_SUITE           = CLS_MAIN+"-suite",
		CLS_SUITE_P         = CLS_SUITE+"_passed",
		CLS_SUITE_F         = CLS_SUITE+"_failed",
		CLS_SUITERESULT     = CLS_MAIN+"-suiteResult",

		CLS_CASE            = CLS_MAIN+"-case",
		CLS_CASE_P          = CLS_CASE+"_passed",
		CLS_CASE_F          = CLS_CASE+"_failed",
		CLS_CASEHEAD        = CLS_MAIN+"-caseHead",
		CLS_CASETITLE       = CLS_MAIN+"-caseTitle",
		CLS_CASERESULT      = CLS_MAIN+"-caseResult",

		CLS_TEST            = CLS_MAIN+"-test",
		CLS_TEST_P          = CLS_TEST+"_passed",
		CLS_TEST_F          = CLS_TEST+"_failed",

		CLS_TESTHEAD        = CLS_MAIN+"-testHead",
		CLS_TESTTITLE       = CLS_MAIN+"-testTitle",
		CLS_TESTCOUNTS      = CLS_MAIN+"-testCounts",
		CLS_TESTSTATUS      = CLS_MAIN+"-testStatus",

		CLS_TERMSLIST       = CLS_MAIN+"-termsList",
		CLS_TERM            = CLS_MAIN+"-term",
		CLS_TERM_OKAY       = CLS_TERM+"_okay",
		CLS_TERM_FAIL       = CLS_TERM+"_failure",
		CLS_TERM_ERROR      = CLS_TERM+"_error",
		CLS_TERM_WARN       = CLS_TERM+"_warning",
		CLS_TERM_INFO       = CLS_TERM+"_info";


	function createElement(tag, classNames, appendTo) {
		var elem = document.createElement(tag);
		if (classNames) {
			elem.className = classNames;
		}
		if (appendTo) {
			appendTo.appendChild(elem);
		}
		return elem;
	}


	return TestListener.extend(function(container)
	{
		TestListener.call(this);

		var api = this,
			suiteResult,
			tcase, tcaseHead, tcaseTitle, tcaseResult,
			testWrap, testHead, testTitle, testCounts, testOkay, testFailure, testTotal, testStatus, testList;

		api.suiteBegin = function(suite) {
			container.className += " " + CLS_SUITE;
		};

		api.suiteDone = function(suite) {
			suiteResult = createElement("div", CLS_SUITERESULT, container);
			suiteResult.innerHTML = suite.isPassed ? "passed" : "failed";
			container.className += " " + (suite.isPassed ? CLS_SUITE_P : CLS_SUITE_F);
		};

		api.caseBegin = function(testCase) {
			tcase       = createElement("div", CLS_CASE, container);
			tcaseHead   = createElement("div", CLS_CASEHEAD, tcase);
			tcaseTitle  = createElement("h3", CLS_CASETITLE, tcaseHead);

			tcaseTitle.innerHTML = "Test case «"+testCase.name+"»";
		};

		api.caseDone = function(testCase) {
			tcaseResult = createElement("div", CLS_CASERESULT, tcase);
			tcaseResult.innerHTML = testCase.isPassed ? "passed" : "failed";

			tcase.className += " " + (testCase.isPassed ? CLS_CASE_P : CLS_CASE_F);
		};

		api.testBegin = function(testItem) {
			testWrap    = createElement("div", CLS_TEST, tcase);
			testHead    = createElement("div", CLS_TESTHEAD, testWrap);
			testTitle   = createElement("div", CLS_TESTTITLE, testHead);
			testCounts  = createElement("div", CLS_TESTCOUNTS, testHead);
			testOkay    = createElement("span", "", testCounts);
			testCounts.appendChild( document.createTextNode(" / ") );
			testFailure = createElement("i", "", testCounts);
			testCounts.appendChild( document.createTextNode(" / ") );
			testTotal   = createElement("b", "", testCounts);
			testList    = createElement("ol", CLS_TERMSLIST, testWrap);
			testStatus  = createElement("div", CLS_TESTSTATUS, testHead);

			testTitle.innerHTML = testItem.name;
			testOkay.innerHTML = testFailure.innerHTML = testTotal.innerHTML = 0;
			testStatus.innerHTML = "in progress ...";
		};

		api.testDone = function(testItem) {
			testStatus.innerHTML = testItem.isPassed ? "passed" : "failed";
			testWrap.className += " " + (testItem.isPassed ? CLS_TEST_P : CLS_TEST_F);
		};


		api.addOkay = function(data, testItem) {
			var li = createElement("li", CLS_TERM+" "+CLS_TERM_OKAY, testList);
			li.innerHTML = api.generateResultMessage("Okay", data);

			++testOkay.innerHTML;
			++testTotal.innerHTML;
		};

		api.addFailure = function(data, testItem) {
			var li = createElement("li", CLS_TERM+" "+CLS_TERM_FAIL, testList);
			li.innerHTML = api.generateResultMessage("Failure", data);

			++testFailure.innerHTML;
			++testTotal.innerHTML;
		};

		api.addError = function(e, testItem) {
			var li = createElement("li", CLS_TERM+" "+CLS_TERM_ERROR, testList);
			li.innerHTML = "Error: "+e.message;
			li.type = "none";
			li.value = testItem.launched;
		};

		api.addWarning = function(msg, testItem) {
			var li = createElement("li", CLS_TERM+" "+CLS_TERM_WARN, testList);
			li.innerHTML = msg;
			li.type = "none";
			li.value = testItem.launched;
		};

		api.addInfo = function(msg, testItem) {
			var li = createElement("li", CLS_TERM+" "+CLS_TERM_INFO, testList);
			li.innerHTML = msg;
			li.type = "none";
			li.value = testItem.launched;
		}
	});
});
