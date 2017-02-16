
define(["../TestListener"], function(TestListener)
{
	function log() {
		var console = window.console;
		console && console.log && console.log.apply(console, arguments);
	}

	return TestListener.extend({
		suiteBegin: function(suite) {
			log("Suite is started");
		},

		suiteDone: function(suite) {
			log("Suite is finished -› "+(suite.isPassed ? "passed" : "FAILED"));
		},


		caseBegin: function(testCase) {
			log("Test case «"+testCase.name+"»");
		},

		caseDone: function(testCase) {
			log((testCase.isPassed ? "passed" : "FAILED")+" - - - - - - - - - - - - - - - - - - - - - -");
		},


		testBegin: function(testItem) {
			log("    "+testItem.name);
		},

		testDone: function(testItem) {
			log("    "+(testItem.isPassed ? "passed" : "FAILED")+" - - - - - - - - - - - - - - - - - - - -");
		},


		addOkay: function(data, testItem) {
			log("        "+this.generateResultMessage("Okay", data));
		},

		addFailure: function(data, testItem) {
			log("     -> "+this.generateResultMessage("Failure", data));
		},

		addError: function(e, testItem) {
			log("     -> Error: "+e.message);
		},

		addWarning: function(msg, testItem) {
			log("     -> "+msg);
		},

		addInfo: function(msg, testItem) {
			log("      i "+msg);
		}
	});
});
