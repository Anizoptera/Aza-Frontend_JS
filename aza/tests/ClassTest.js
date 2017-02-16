
define(["unitjs/TestCase", "../Class"], function(TestCase, Class)
{
	return TestCase.extend("Class", function()
	{
		this.addTest("Class", function(api) {
			api.checkProperties(Class, {
				extend: "function"
			});


			// ClassA

			var ClassA = Class.extend(function(param) {
				Class.call(this);
				this.field1 = 1;
				this.param1 = param;
			});

			ClassA.prototype.proto1 = 2;

			var a = new ClassA(3);

			api.assertSame(a.field1, 1);
			api.assertSame(a.proto1, 2);
			api.assertSame(a.param1, 3);


			// ClassB

			var ClassB = ClassA.extend(function(param) {
				ClassA.call(this, param);
				this.field2 = 11;
				this.param2 = param;
			});

			ClassB.prototype.proto2 = 22;

			var b = new ClassB(33);

			api.assertSame(b.field1, 1);
			api.assertSame(b.proto1, 2);
			api.assertSame(b.param1, 33);
			api.assertSame(b.field2, 11);
			api.assertSame(b.proto2, 22);
			api.assertSame(b.param2, 33);

		});
	});
});
