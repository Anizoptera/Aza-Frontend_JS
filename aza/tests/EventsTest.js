
define(["unitjs/TestCase", "../Events"], function(TestCase, Events)
{
	return TestCase.extend("Events", function()
	{
		this.addTest("Namespaces", function(api) {
			var disp = Events.eventalize({}),
				i = 0;


			disp.on("name.first", function() {
				api.assertEquals(++i, 1);
			});
			disp.trigger("name");
			disp.off(".first");
			disp.trigger("name");
			api.assertEquals(i, 1);


			disp.on("name.second", function() {
				api.assertEquals(++i, 2);
			});
			disp.off(".first");
			disp.trigger("name");
			disp.off(".second");
			api.assertEquals(i, 2);


			disp.on("name.first", function() {
				api.assertTrue(false);
			});
			disp.off("name.first");
			disp.trigger("name");
			api.assertEquals(i, 2);


			disp.on("name.first", function() {
				api.assertTrue(false);
			});
			disp.off("name");
			disp.trigger("name");
			api.assertEquals(i, 2);
		});

		this.addTest("Rooms", function(api) {
			var disp = Events.eventalize({});

			function check(selector, expected) {
				var res = 0;

				disp.on(selector, function(e) {
					res++;
				});

				disp.trigger("open");
				disp.trigger("md:open");
				disp.trigger("md:*");
				disp.trigger("*:open");
				disp.trigger("*");
				disp.trigger("md:open overlay:open");
				disp.trigger("md:open overlay:show");

				disp.events.clear();

				api.assertEquals(res, expected, selector);
			}

			check("*", 9);
			check("open", 8);
			check("md:", 4);
			check("md:open", 4);
			check("some", 2);
			check("other:some", 0);
			check("other:open", 0);
			check("other:", 0);
		});
	});
});
