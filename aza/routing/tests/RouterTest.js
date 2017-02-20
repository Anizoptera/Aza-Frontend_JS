
define(["unitjs/TestCase","../Router"], function(TestCase, Router)
{
	return TestCase.extend("Router", function()
	{
		this.addTest("API", function(api) {
			api.checkProperties(new Router(), {
				events: "object",

				add: "function",
				addHandler: "function",
				start: "function",

				registerCondition: "function",

				isStarted: false
			});
		});

		this.addTest("EmptyLaunch", 3, function(api) {
			var router = new Router(),
				a;

			router.add({}, function() {
				a = true;
			});

			api.assertFalse(a, "not launched yet");


			router.start();

			api.assertTrue(a, "launched");


			router.add({}, function() {
				api.assertTrue(1, "launch after routing was started");
			});
		});
	});
});
