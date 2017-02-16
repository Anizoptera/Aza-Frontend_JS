
define(["unitjs/TestCase"], function(TestCase)
{
	return TestCase.extend("JSLang", function()
	{
		this.addTest("Basics", function(api) {
			api.assertTrue(null == null && null == undefined, "null & undefined");

			api.assertFalse("".join, "Strings don't have join-method");
			api.assertTrue([].join, "Arrays have join-method");
		});

		this.addTest("Arrays", function(api) {
			api.assertDeep([1,2].concat(3,4), [1,2,3,4], "Array.concat");

			api.assertDeep([1,2].concat([3,4], [5,[6]]), [1,2,3,4,5,[6]], "Array.concat");
		});
	});
});
