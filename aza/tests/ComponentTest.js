
define(["unitjs/TestCase","../Component","../Core"], function(TestCase, Component, Aza)
{
	return TestCase.extend("Component", function()
	{
		this.addTest("Basic", function(api) {
			api.checkProperties(Component, {
				extend: "function",
				extendDefaults: "function"
			});


			var inst = new Component();

			api.checkProperties(inst, {
				events: "object",

				componentName: "string",
				namespace: "string"
			});

			api.assertTrue(Aza.isPlainObject(inst.options), "options is plainObject");
		});

		this.addTest("Component naming", function(api) {
			var ClassA = Component.extend(function() {
				Component.call(this);
			});

			ClassA.componentName = "ClassA";


			var ClassB = Component.extend(function() {
				Component.call(this);
			});

			ClassB.componentName = "ClassB";


			// Check for correct inheritance
			api.assertSame(ClassA.componentName, "ClassA");
		});

		this.addTest("Options & defaults", function(api) {
			var ClassA = Component.extend(function(opts) {
				Component.call(this, opts);
			});

			var defsA = {
					p1: 1,
					p2: {
						p21: 21,
						p22: [1,2,3],
						p23: [4,5,6]
					},
					p3: "${p1}"
				};

			ClassA.defaults = Aza.extend({}, defsA);

			var a = new ClassA({
				p2: {
					"^p21": null,
					p22: [7],
					"!p23": [8]
				}
			});

			api.assertDeep(a.options, {
				p1: 1,
				p2: {
					p22: [1,2,3,7],
					p23: [8]
				},
				p3: 1
			});


			// Check for correct inheritance

			var ClassB = ClassA.extend(function(opts) {
				ClassA.call(this, opts);
			});

			api.assertDeep(ClassB.defaults, defsA);

			ClassB.defaults.param1 = 11;

			api.assertSame(ClassA.defaults.p1, 1);
		});

		this.addTest("Extend defaults", function(api) {
			var ClassA = Component.extend(function(opts) {
				Component.call(this, opts);
			});

			ClassA.defaults = {
				p1: 1,
				p2: 2
			};



			var ClassB = ClassA.extend(function(opts) {
				ClassA.call(this, opts);
			});

			ClassB.extendDefaults({
				"^p2": null,
				p21: 21
			});

			api.assertDeep(ClassB.defaults, {
				p1: 1,
				p21: 21
			});

			var b = new ClassB({
				p31: 31
			});

			api.assertDeep(b.options, {
				p1: 1,
				p21: 21,
				p31: 31
			});
		});

		this.addTest("Compile options", function(api) {
			var ClassA = Component.extend(function(opts) {
				opts = ClassA.compileOpts(opts);

				Component.call(this, opts);

				api.assertDeep(opts, {
					p1: 1,
					p2: 2,
					p3: 3
				});
			});

			ClassA.defaults = {
				p1: 1
			};


			var ClassB = ClassA.extend(function(opts) {
				opts = ClassB.compileOpts(opts);

				api.assertDeep(opts, {
					p2: 2,
					p3: 3
				});

				ClassA.call(this, opts);

				api.assertDeep(this.options, {
					p1: 1,
					p2: 2,
					p3: 3
				});
			});

			ClassB.defaults = {
				p2: 2
			};

			new ClassB({p3: 3});
		});
	});
});
