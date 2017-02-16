
define(["unitjs/TestCase","jquery"], function(TestCase, $)
{
	return TestCase.extend("jQuery", function()
	{
		this.addTest("jquery", function(api) {
			// isReady
			// (Routing)

			api.assertSame(typeof $.isReady, "boolean", "isReady");
		});

		this.addTest("each", function(api) {
			// (SelectableList)

			var a = [1,2,3], res;

			api.assertSame($.each(a, function() {}), a, "return of $.each");

			$.each(a, function(i, val) {
				res = i;
				return false;
			});

			api.assertSame(res, 0, "return false in $.each");
		});

		this.addTest("not", function(api) {
			var $a = $('<span class="cl1"></span><span class="cl2"></span><span class="cl3"></span>'),
				$b = $a.not([$a[0], $a[1]]);

			api.assertSame($b.length, 1, "$.fn.not - length");
			api.assertFalse($b.is(".cl2"), "$.fn.not - elems");
		});

		this.addTest("unbind all", function(api) {
			var res = 1;

			var $a = $("<div>").click(function() {
				res = 0;
			});

			$a.unbind().click();

			api.assertSame(res, 1, "unbind");
		});

		this.addTest("eq", function(api) {
			// (SelectableList)

			var $a = $('<div class="div1"></div><div class="div2"></div><div class="div3"></div>');

			api.assertTrue($a.eq(0).hasClass("div1"), "eq(0)");

			api.assertTrue($a.eq(-1).hasClass("div3"), "eq(-1)");
		});
	});
});
