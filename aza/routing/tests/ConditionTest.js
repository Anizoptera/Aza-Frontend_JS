
define([
	"jquery",
	"unitjs/TestCase",
	"../Router", "../Condition",
	"../conditions/SitePartCondition", "../conditions/SelectorCondition"
], function($, TestCase, Router, Condition, SitePartCondition, SelectorCondition)
{
	return TestCase.extend("RouteConditions", function()
	{
		this.addTest("Basic", 15, function(api) {
			var router = new Router();

			router.registerCondition("YES", Condition.extend(function(params) {
				Condition.call(this);
				api.assertSame(params, 1, "YES: params");
				this.check = function() {
					api.addOkay("YES: check");
					return [123];
				}
			}));

			router.registerCondition("NO", Condition.extend(function(params) {
				Condition.call(this);
				api.assertSame(params, 2, "NO: params");
				this.check = function() {
					api.addOkay("NO: check");
					return false;
				}
			}));

			router.add({YES: 1}, function(yes) {
				api.assertSame(yes, 123, "YES callback");
			});

			router.add({NO: 2}, function() {
				api.addFailure("NO was launched");
			});

			router.add({YES: 1, NO: 2}, function() {
				api.addFailure("YES+NO was launched (should not have been launched)");
			});

			router.add({NO: 2, YES: 1}, function() {
				api.addFailure("NO+YES (NO checks only) was launched (should not have been launched)");
			});

			router.start();

			router.add({YES: 1}, function(yes) {
				api.assertSame(yes, 123, "YES callback");
			});
		});

		this.addTest("SitePartCondition", 13, function(api) {
			var router = new Router(),
				second = false;

			router.registerCondition("STP", SitePartCondition);

			window.site_part = ["TestCtrl", "TestAct"];


			router.add({STP: "TestCtrl/TestAct"}, function() {
				api.assertFalse(second, this.conditions.STP);
			});

			router.add({STP: "TestCtrl/Test"}, function() {
				api.assertTrue(second, this.conditions.STP);
			});

			router.add({STP: "TestCtrl/*"}, function() {
				api.assertTrue(true, this.conditions.STP);
			});


			router.start();


			router.add({STP: "*/TestAct"}, function() {
				api.assertFalse(second, this.conditions.STP);
			});

			router.add({STP: "*/*"}, function() {
				api.assertTrue(true, this.conditions.STP);
			});


			router.add({STP: "!Da/Daaa"}, function() {
				api.assertTrue(true, this.conditions.STP);
			});

			router.add({STP: ["!Da/Daaa", "TestCtrl/TestAct"]}, function() {
				api.assertTrue(true, this.conditions.STP);
			});

			router.add({STP: ["!Da/Daaa", "TestCtrl/Test"]}, function() {
				api.assertTrue(true, this.conditions.STP);
			});


			second = true;

			window.site_part = ["TestCtrl", "Test"];
			router.start();
		});

		this.addTest("SelectorCondition", 6, function(api) {
			var router = new Router(),
				$test = $(
					'<div class="unittest__routing__SEL_elem1">' +
						'<span class="unittest__routing__SEL_elem2"></span>' +
						'<span class="unittest__routing__SEL_elem2">' +
							'<i class="unittest__routing__SEL_elem3"></i>' +
						'</span>' +
					'</div>').appendTo($("body"));

			router.registerCondition("SEL", SelectorCondition);

			router.start();


			router.add({SEL: ".unittest__routing__SEL_elem1"}, function($res) {
				api.assertSame($res.length, 1);
			});

			// again
			router.add({SEL: ".unittest__routing__SEL_elem1"}, function($res) {
				api.assertSame($res.length, 1);
			});


			router.add({SEL: ".unittest__routing__SEL_elem2"}, function($res) {
				api.assertSame($res.length, 2);
			});

			router.add({SEL: ".unittest__routing__SEL_elem1, .unittest__routing__SEL_elem2"}, function($res) {
				api.assertSame($res.length, 3);
			});


			router.add({SEL: [".unittest__routing__SEL_elem1", ".unittest__routing__SEL_elem2"]}, function($res1, $res2) {
				api.assertSame($res1.length, 1);
				api.assertSame($res2.length, 2);
			});


			router.add({SEL: ".unittest__routing__SEL_elem4"}, function() {
				api.assertTrue(false);
			});


			$test.remove();
		});
	});
});
