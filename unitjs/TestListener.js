
define(["./unitjs"], function(unitjs)
{
	var TestListenerProto = TestListener.prototype;


	function TestListener() {}


	TestListenerProto.generateResultMessage = function(type, data) {
		var msgArr = [type];

		if (typeof data === "string") {
			msgArr.push(data);
		}
		else {
			data.assert && msgArr.push("assert"+data.assert);
			data.message && msgArr.push(data.message);
		}

		return msgArr.join(" -› ");
	};


	TestListenerProto.suiteBegin = function(suite) {};

	TestListenerProto.suiteDone = function(suite) {};


	TestListenerProto.caseBegin = function(testCase) {};

	TestListenerProto.caseDone = function(testCase) {};


	TestListenerProto.testBegin = function(testItem) {};

	TestListenerProto.testDone = function(testItem) {};


	TestListenerProto.addOkay = function(data, testItem) {};

	TestListenerProto.addFailure = function(data, testItem) {};

	TestListenerProto.addError = function(e, testItem) {};

	TestListenerProto.addWarning = function(msg, testItem) {};

	TestListenerProto.addInfo = function(msg, testItem) {};


	TestListener.extend = function(Constr) {
		return unitjs.inherit(this, Constr);
	};


	return TestListener;
});
