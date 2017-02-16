
define(["unitjs/TestCase", "../Core"], function(TestCase, Aza)
{
	return TestCase.extend("Core", function()
	{
		// numbers

		this.addTest("norm", function(api) {
			var norm = Aza.norm;

			api.assertSame(norm(),              0);
			api.assertSame(norm(undefined),     0);
			api.assertSame(norm(null),          0);
			api.assertSame(norm(false),         0);
			api.assertSame(norm("some"),        0);
			api.assertSame(norm(8),             8);

			api.assertSame(norm(8, 5, 10),      8);
			api.assertSame(norm(12, 5, 10),     10);
			api.assertSame(norm(2, 5, 10),      5);

			api.assertSame(norm(12, null, 10),      10);
			api.assertSame(norm(8, null, 10),       8);
			api.assertSame(norm(12, "some", 10),    10);
			api.assertSame(norm(8, "some", 10),     8);
			api.assertSame(norm(8, 5, null),        8);
			api.assertSame(norm(2, 5, null),        5);
			api.assertSame(norm(8, 5, "some"),      8);
			api.assertSame(norm(2, 5, "some"),      5);
			api.assertSame(norm(8, 5),              8);
			api.assertSame(norm(2, 5),              5);

			api.assertSame(norm("8.42", "5.87", "10.27"),   8.42);
			api.assertSame(norm("12.42", "5.87", "10.27"),  10.27);
			api.assertSame(norm("2.42", "5.87", "10.27"),   5.87);
		});


		// strings

		this.addTest("capitalize", function(api) {
			var capitalize = Aza.capitalize;

			api.assertSame(capitalize(""),         "");
			api.assertSame(capitalize("j"),        "J");
			api.assertSame(capitalize("j", 1),     "J");
			api.assertSame(capitalize("ф"),        "Ф");
			api.assertSame(capitalize("ф", 1),     "Ф");

			api.assertSame(capitalize("some text here"),           "Some text here");
			api.assertSame(capitalize("some text here", 1),        "Some Text Here");

			api.assertSame(capitalize("здесь любой текст"),        "Здесь любой текст");
			api.assertSame(capitalize("здесь любой текст", 1),     "Здесь Любой Текст");

			api.assertSame(capitalize("тут ...началось такое"),    "Тут ...началось такое");
			api.assertSame(capitalize("тут ...началось такое", 1), "Тут ...началось Такое");

			api.assertSame(capitalize("а называется он 15ре"),     "А называется он 15ре");
			api.assertSame(capitalize("а называется он 15ре", 1),  "А Называется Он 15ре");
		});

		this.addTest("hd", function(api) {
			api.assertSame(Aza.hd("", ""), "");
			api.assertSame(Aza.hd("", []), "");
			api.assertSame(Aza.hd("", {}), "");
			api.assertSame(Aza.hd("", function() {}), "");

			api.assertSame(Aza.hd("ab%cd%ef"), "ab%cd%ef");
			api.assertSame(Aza.hd("ab{p1}cd{p2}ef"), "ab{p1}cd{p2}ef");

			api.assertSame(Aza.hd("ab%cd%ef", 12), "ab12cd%ef");
			api.assertSame(Aza.hd("ab%cd%ef", "12"), "ab12cd%ef");
			api.assertSame(Aza.hd("ab%cd%ef", [12]), "ab12cd%ef");
			api.assertSame(Aza.hd("ab%cd%ef", ["12"]), "ab12cd%ef");
			api.assertSame(Aza.hd("ab%cd%ef", function() { return 12; }), "ab12cd%ef");
			api.assertSame(Aza.hd("ab%cd%ef", function() { return "12"; }), "ab12cd%ef");
			api.assertSame(Aza.hd("ab%cd%ef", function() { return [12]; }), "ab12cd%ef");
			api.assertSame(Aza.hd("ab%cd%ef", function() { return ["12"]; }), "ab12cd%ef");

			api.assertSame(Aza.hd("ab{p1}cd{p2}ef", {p1:12}), "ab12cd{p2}ef");
			api.assertSame(Aza.hd("ab{p1}cd{p2}ef", function() { return {p1:12}; }), "ab12cd{p2}ef");

			api.assertSame(Aza.hd("ab%cd%ef", 12, "34"), "ab12cd34ef");
			api.assertSame(Aza.hd("ab%cd%ef", "12", 34), "ab12cd34ef");
			api.assertSame(Aza.hd("ab%cd%ef", [12, 34]), "ab12cd34ef");
			api.assertSame(Aza.hd("ab%cd%ef", ["12", "34"]), "ab12cd34ef");

			api.assertSame(Aza.hd("ab{p1}cd{p2}ef", {p1:12, p2:34, p3:56}), "ab12cd34ef");
			api.assertSame(Aza.hd("ab{p1}cd{p2}ef", function() { return {p1:12, p2:34, p3:56}; }), "ab12cd34ef");
		});

		this.addTest("getMutualParts", function(api) {
			api.assertDeep(Aza.getMutualParts("", ""),          ["", ""]);
			api.assertDeep(Aza.getMutualParts("ab", ""),        ["", ""]);
			api.assertDeep(Aza.getMutualParts("", "ac"),        ["", ""]);
			api.assertDeep(Aza.getMutualParts("ab", "ac"),      ["a", ""]);
			api.assertDeep(Aza.getMutualParts("bc", "ac"),      ["", "c"]);
			api.assertDeep(Aza.getMutualParts("abc", "ab"),     ["ab", ""]);
			api.assertDeep(Aza.getMutualParts("abc", "ac"),     ["a", "c"]);
			api.assertDeep(Aza.getMutualParts("abd", "acd"),    ["a", "d"]);
			api.assertDeep(Aza.getMutualParts("abcd", "acd"),   ["a", "cd"]);
			api.assertDeep(Aza.getMutualParts("abcd", "cd"),    ["", "cd"]);
			api.assertDeep(Aza.getMutualParts("abcd", "ab"),    ["ab", ""]);
			api.assertDeep(Aza.getMutualParts("abcd", "abcd"),  ["abcd", ""]);
			api.assertDeep(Aza.getMutualParts("abfc", "abc"),   ["ab", "c"]);
			api.assertDeep(Aza.getMutualParts("abc", "abfc"),   ["ab", "c"]);
		});

		this.addTest("splitAroundPos", function(api) {
			api.assertDeep(Aza.splitAroundPos("", 5, ","),                  ["", "", ""]);
			api.assertDeep(Aza.splitAroundPos("ab, cd", 1, ","),            ["", "ab", " cd"]);
			api.assertDeep(Aza.splitAroundPos("ab, cd", 5, ","),            ["ab", " cd", ""]);
			api.assertDeep(Aza.splitAroundPos("ab, cd, ef", 5, ","),        ["ab", " cd", " ef"]);
			api.assertDeep(Aza.splitAroundPos("ab, cd, ef", 50, ","),       ["ab, cd", " ef", ""]);
			api.assertDeep(Aza.splitAroundPos("ab, cd, ef", 0, ","),        ["", "ab", " cd, ef"]);
			api.assertDeep(Aza.splitAroundPos("ab, cd, ef", -5, ","),       ["", "ab", " cd, ef"]);
			api.assertDeep(Aza.splitAroundPos("ab,,cd", 3, ","),            ["ab", "", "cd"]);
		});


		// objects and arrays

		this.addTest("advancedMerge: Simple", function(api) {
			var res = Aza.advancedMerge({
				param1: 1
			}, {
				param2: 2
			});

			api.assertDeep(res, {
				param1: 1,
				param2: 2
			});



			res = Aza.advancedMerge({
				param1: [1]
			}, {
				param1: [2]
			});

			api.assertDeep(res, {
				param1: [1,2]
			});



			res = Aza.advancedMerge({
				param1: {
					p1: [1]
				}
			}, {
				param1: {
					p1: [2]
				}
			});

			api.assertDeep(res, {
				param1: {
					p1: [1,2]
				}
			});



			res = Aza.advancedMerge({
				param1: [1]
			}, {
				param1: {
					p1: [2]
				}
			});

			api.assertDeep(res, {
				param1: {
					p1: [2]
				}
			});
		});

		this.addTest("advancedMerge: Prefixes", function(api) {
			var res = Aza.advancedMerge({
				param1: [1]
			}, {
				"!param1": [2]
			});

			api.assertDeep(res, {
				param1: [2]
			});



			res = Aza.advancedMerge({
				param1: {
					p1: [1]
				}
			}, {
				"param1": {
					"!p1": [2]
				}
			});

			api.assertDeep(res, {
				param1: {
					p1: [2]
				}
			});



			res = Aza.advancedMerge({
				param1: [1]
			}, {
				"^param1": 1
			});

			api.assertDeep(res, {});



			res = Aza.advancedMerge({
				param1: {
					p1: [1]
				}
			}, {
				"^param1": {
					"!p1": [2]
				}
			});

			api.assertDeep(res, {});
		});

		this.addTest("flextend", function(api) {
			var flextend = Aza.flextend,
				obj1 = {
					prop1: {
						p111: "a",
						p112: "b"
					},
					prop2: {
						p121: "c",
						p122: "d",
						arr: [1,2,3,4],
						obj: {
							pr1: [9,8,1,2],
							pr2: [7,6]
						}
					}
				},
				obj2 = {
					prop1: {
						p211: "e",
						p212: "f"
					},
					prop2: {
						p221: "g",
						p222: "h",
						arr: [5,6],
						obj: {
							pr1: [5,4]
						}
					}
				};


			api.assertDeep(flextend("prop2", {}, obj1, obj2), {
				prop1: {
					p211: "e",
					p212: "f"
				},
				prop2: {
					p121: "c",
					p122: "d",
					p221: "g",
					p222: "h",
					arr: [5,6],
					obj: {
						pr1: [5,4]
					}
				}
			});


			api.assertDeep(flextend(["prop1", "prop2"], {}, obj1, obj2), {
				prop1: {
					p111: "a",
					p112: "b",
					p211: "e",
					p212: "f"
				},
				prop2: {
					p121: "c",
					p122: "d",
					p221: "g",
					p222: "h",
					arr: [5,6],
					obj: {
						pr1: [5,4]
					}
				}
			});


			api.assertDeep(flextend({prop1:null, prop2:null}, {}, obj1, obj2), {
				prop1: {
					p111: "a",
					p112: "b",
					p211: "e",
					p212: "f"
				},
				prop2: {
					p121: "c",
					p122: "d",
					p221: "g",
					p222: "h",
					arr: [5,6],
					obj: {
						pr1: [5,4]
					}
				}
			});


			api.assertDeep(flextend({prop1:null, prop2:"arr obj"}, {}, obj1, obj2), {
				prop1: {
					p111: "a",
					p112: "b",
					p211: "e",
					p212: "f"
				},
				prop2: {
					p121: "c",
					p122: "d",
					p221: "g",
					p222: "h",
					arr: [5,6,3,4],
					obj: {
						pr1: [5,4],
						pr2: [7,6]
					}
				}
			});


			api.assertDeep(flextend({prop1:null, prop2:{arr:null, obj:"pr1"}}, {}, obj1, obj2), {
				prop1: {
					p111: "a",
					p112: "b",
					p211: "e",
					p212: "f"
				},
				prop2: {
					p121: "c",
					p122: "d",
					p221: "g",
					p222: "h",
					arr: [5,6,3,4],
					obj: {
						pr1: [5,4,1,2],
						pr2: [7,6]
					}
				}
			});
		});

		this.addTest("getPath", function(api) {
			var getPath = Aza.getPath,

				testObj = {
					prop1: 111,
					prop2: function() { },
					prop3: {
						prop3_1: 222,
						prop3_2: ["a","b","c","d","e"],
						prop3_3: {
							prop3_3_1: 333,
							prop3_3_2: ["aa","bb","cc","dd","ee"]
						}
					}
				};


			// Basic usage

			api.assertDeep(getPath(testObj, "prop1"), testObj.prop1);

			api.assertDeep(getPath(testObj, "prop2"), testObj.prop2);

			api.assertDeep(getPath(testObj, "prop3"), testObj.prop3);

			api.assertDeep(
				getPath(testObj, "prop3.prop3_3"),
				testObj.prop3.prop3_3
			);

			api.assertDeep(
				getPath(testObj, "prop3.prop3_3.prop3_3_2"),
				testObj.prop3.prop3_3.prop3_3_2
			);

			api.assertDeep(
				getPath(testObj, "prop3.prop3_3.prop3_3_2.1"),
				testObj.prop3.prop3_3.prop3_3_2[1]
			);


			// Wrong path

			api.assertDeep(getPath(testObj, ""), testObj);

			api.assertDeep(getPath(testObj, "some"), undefined);

			api.assertDeep(getPath(testObj, "some"), undefined);

			api.assertDeep(getPath(testObj, "prop1.some"), undefined);

			api.assertDeep(getPath(testObj, "prop2.some"), undefined);


			// Wrong usage

			api.assertDeep(getPath(), undefined);

			api.assertDeep(getPath(testObj), testObj);

			api.assertDeep(getPath(testObj, function() {}), undefined);
		});

		this.addTest("setPath", function(api) {
			var setPath = Aza.setPath,

				origObj = {
					prop1: 111,
					prop2: function() { },
					prop3: {
						prop3_1: 222,
						prop3_2: ["a","b","c","d","e"],
						prop3_3: {
							prop3_3_1: 333,
							prop3_3_2: ["aa","bb","cc","dd","ee"]
						}
					}
				},

				testObj = Aza.extend(true, {}, origObj);


			// Tesing return value

			api.assertSame(setPath(testObj, "prop1", 111), testObj);


			// Rewriting existing params

			setPath(testObj, "prop1", 111111);
			api.assertSame(testObj.prop1, 111111);

			setPath(testObj, "prop3.prop3_3.prop3_3_2.2", "cccccc");
			api.assertSame(testObj.prop3.prop3_3.prop3_3_2[2], "cccccc");

			setPath(testObj, "prop3.prop3_3.prop3_3_1", 333333);
			api.assertSame(testObj.prop3.prop3_3.prop3_3_1, 333333);


			// Extending not object

			testObj = Aza.extend(true, {}, origObj);

			setPath(testObj, "propX", "x");
			api.assertSame(testObj.propX, "x");

			setPath(testObj, "propX.propX_X", "x_x");
			api.assertSame(testObj.propX.propX_X, "x_x");

			setPath(testObj, "propX.propX_X.propX_X_X", "x_x_x");
			api.assertSame(testObj.propX.propX_X.propX_X_X, "x_x_x");

			setPath(testObj, "propXX.propXX_X", "xx_x");
			api.assertSame(testObj.propXX.propXX_X, "xx_x");

			setPath(testObj, "propXXX.propXXX_X.propXXX_X_X", "xxx_x_x");
			api.assertSame(testObj.propXXX.propXXX_X.propXXX_X_X, "xxx_x_x");


			// Extending arrays

			setPath(testObj, "propA.propA_A", ["a","b","c"]);
			api.assertDeep(testObj.propA.propA_A, ["a","b","c"]);

			setPath(testObj, "propA.propA_A.1", "d");
			api.assertDeep(testObj.propA.propA_A, ["a","d","c"]);

			setPath(testObj, "propA.propA_A.3", "e");
			api.assertDeep(testObj.propA.propA_A, ["a","d","c","e"]);

			setPath(testObj, "propA.propA_A.5", "g");
			api.assertDeep(testObj.propA.propA_A, ["a","d","c","e",undefined,"g"]);


			// Wrong usage

			testObj = Aza.extend(true, {}, origObj);

			setPath(testObj);
			api.assertDeep(testObj, origObj);

			setPath(testObj, "");
			api.assertDeep(testObj, origObj);

			setPath(testObj, "", 123);
			api.assertDeep(testObj, origObj);
		});

		this.addTest("fillObject", function(api) {
			var fillObject = Aza.fillObject;


			api.assertDeep(
				fillObject({
					raw: {p1:12, p2:34},
					keys: "p1 p2",
					data: [45, 67]
				}),
				{p1:45, p2:67}
			);

			api.assertDeep(
				fillObject({
					keys: "p1 p2",
					data: [45, 67]
				}),
				{p1:45, p2:67}
			);

			api.assertDeep(
				fillObject({
					keys: "p1 p2",
					data: [45, 67]
				}),
				{p1:45, p2:67}
			);

			api.assertDeep(
				fillObject({
					raw: {p1:12, p2:34},
					keys: "p1 p2",
					data: [45]
				}),
				{p1:45, p2:34}
			);

			api.assertDeep(
				fillObject({
					raw: {p2:12},
					keys: "p1 p2",
					data: [34],
					defaults: {p1:56, p2:78}
				}),
				{p1:34, p2:12}
			);

			api.assertDeep(
				fillObject({
					keys: "p1 p2",
					data: [45]
				}),
				{p1:45}
			);

			api.assertDeep(
				fillObject({
					keys: "p1 p2",
					data: [45],
					defaults: {p1:78, p2:90}
				}),
				{p1:45, p2:90}
			);

			api.assertDeep(
				fillObject({
					keys: "p1 p2",
					data: {p1:45},
					defaults: {p1:78, p2:90}
				}),
				{p1:45, p2:90}
			);

			api.assertDeep(
				fillObject({
					keys: "p1 p2",
					data: [45,67,12],
					defaults: {p1:78, p2:90}
				}),
				{p1:45, p2:67}
			);

			api.assertDeep(
				fillObject({
					keys: "p1 p2",
					data: {p1:45, p3:456},
					defaults: {p1:78, p2:90}
				}),
				{p1:45, p2:90}
			);

			api.assertDeep(
				fillObject({
					keys: "p1",
					data: {p1:undefined},
					defaults: {p1:78}
				}),
				{p1:78}
			);

			api.assertDeep(
				fillObject({
					keys: "p1",
					data: {p1:null},
					defaults: {p1:78}
				}),
				{p1:null}
			);

			api.assertDeep(
				fillObject("p1 p2", {p1:12, p2:34}),
				{p1:12, p2:34}
			);

			api.assertDeep(
				fillObject(["p1", "p2"], {p1:12, p2:34}),
				{p1:12, p2:34}
			);

			api.assertDeep(
				fillObject("p1 p2 p3", {p1:12, p2:34}),
				{p1:12, p2:34}
			);
		});

		this.addTest("slice", function(api) {
			var slice = Aza.slice;


			api.assertDeep(
				slice([123,456,789]),
				[123,456,789],
				"Aza.slice([123,456,789])"
			);

			api.assertDeep(
				slice([123,456,789], 0, 1),
				[123],
				"Aza.slice([123,456,789], 0, 1)"
			);

			api.assertDeep(
				slice([123,456,789], 1, 1),
				[],
				"Aza.slice([123,456,789], 1, 1)"
			);

			api.assertDeep(
				slice([123,456,789], undefined),
				[123,456,789],
				"Aza.slice([123,456,789], undefined)"
			);
		});

		this.addTest("splice", function(api) {
			var splice = Aza.splice;


			(function(desrc) {
				var arr = [123,456,789],
					res = splice(arr);

				api.assertDeep(
					arr,
					[456,789],
					desrc + " >>> arr"
				);

				api.assertDeep(
					res,
					[123],
					desrc + " >>> res"
				);
			})("Aza.splice([123,456,789])");

			(function(desrc) {
				var arr = [123,456,789],
					res = splice(arr, 1);

				api.assertDeep(
					arr,
					[123,789],
					desrc + " >>> arr"
				);

				api.assertDeep(
					res,
					[456],
					desrc + " >>> res"
				);
			})("Aza.splice([123,456,789], 1)");

			(function(desrc) {
				var arr = [123,456,789],
					res = splice(arr, 1, 2);

				api.assertDeep(
					arr,
					[123],
					desrc + " >>> arr"
				);

				api.assertDeep(
					res,
					[456,789],
					desrc + " >>> res"
				);
			})("Aza.splice([123,456,789], 1, 2)");

			(function(desrc) {
				var arr = [123,456,789],
					res = splice(arr, 1, 2, 654, 321);

				api.assertDeep(
					arr,
					[123,654,321],
					desrc + " >>> arr"
				);

				api.assertDeep(
					res,
					[456,789],
					desrc + " >>> res"
				);
			})("Aza.splice([123,456,789], 1, 2, 654, 321)");

			(function(desrc) {
				var arr = [123,456,789],
					res = splice(arr, 1, 0);

				api.assertDeep(
					arr,
					[123,456,789],
					desrc + " >>> arr"
				);

				api.assertDeep(
					res,
					[],
					desrc + " >>> res"
				);
			})("Aza.splice([123,456,789], 1, 0)");
		});

		this.addTest("clearObject", function(api) {
			var clearObject = Aza.clearObject,
				testObj = {p1:12, p2:34};


			api.assertTrue(clearObject(testObj) === testObj, "return value");

			(function(descr) {
				var obj = {some:123, other:456, oneMore:789};

				clearObject(obj);

				api.assertDeep(
					obj,
					{},
					descr
				)
			})("Aza.clearObject({some:123, other:456, oneMore:789})");

			(function(descr) {
				var obj = {length:321};

				clearObject(obj);

				api.assertDeep(
					obj,
					{},
					descr
				)
			})("Aza.clearObject({length:321})");

			(function(descr) {
				var obj = {};

				clearObject(obj);

				api.assertDeep(
					obj,
					{},
					descr
				)
			})("Aza.clearObject({})");
		});

		this.addTest("clearArray", function(api) {
			var obj;


			obj = [1, 2, 3];

			api.assertTrue(Aza.clearArray(obj) === obj, "return value");


			api.assertDeep(Aza.clearArray([123,456,789]), []);

			api.assertDeep(Aza.clearArray([]), []);


			obj = {
				0: "val0",
				1: "val1",
				2: "val2",
				length: 3,
				p1: 123,
				p2: 456
			};

			api.assertDeep(Aza.clearArray(obj), {
				length: 0,
				p1: 123,
				p2: 456
			});


			obj = {
				0: "val0",
				1: "val1",
				2: "val2",
				3: "val3",
				length: 3,
				p1: 123,
				p2: 456
			};

			api.assertDeep(Aza.clearArray(obj), {
				3: "val3",
				length: 0,
				p1: 123,
				p2: 456
			});
		});

		this.addTest("firstItem", function(api) {
			var firstItem = Aza.firstItem;


			api.assertDeep(
				firstItem({}),
				undefined,
				"Aza.firstItem({})"
			);

			api.assertDeep(
				firstItem({some: {}}),
				{},
				"Aza.firstItem({some: {}})"
			);

			api.assertDeep(
				firstItem({some: {}}, 2),
				undefined,
				"Aza.firstItem({some: {}}, 2)"
			);

			api.assertDeep(
				firstItem({}, true),
				undefined,
				"Aza.firstItem({})"
			);

			api.assertDeep(
				firstItem({some: {}}, true),
				undefined,
				"Aza.firstItem({some: {}}, true)"
			);

			api.assertDeep(
				firstItem({some:{other:123}}),
				{other:123},
				"Aza.firstItem({some:{other:123}})"
			);

			api.assertDeep(
				firstItem({some:{other:123}}, 2),
				123,
				"Aza.firstItem({some:{other:123}}, 2)"
			);

			api.assertDeep(
				firstItem({some:{other:123}}, true),
				123,
				"Aza.firstItem({some:{other:123}}, true)"
			);

			api.assertDeep(
				firstItem({some:123}, true),
				123,
				"Aza.firstItem({some:123}, true)"
			);

			api.assertDeep(
				firstItem({some:{other:"text"}}, true),
				"text",
				"Aza.firstItem({some:{other:'text'}}, true)"
			);

			api.assertDeep(
				firstItem([123,456,789]),
				123,
				"Aza.firstItem([123,456,789])"
			);

			api.assertDeep(
				firstItem([123,456,789], 2),
				undefined,
				"Aza.firstItem([123,456,789], 2)"
			);

			api.assertDeep(
				firstItem([["some", "other"],456,789], true),
				"some",
				"Aza.firstItem([['some', 'other'],456,789], true)"
			);

			api.assertDeep(
				firstItem([123,456,789], true),
				123,
				"Aza.firstItem([123,456,789], true)"
			);

			api.assertDeep(
				firstItem([]),
				undefined,
				"Aza.firstItem([])"
			);

			api.assertDeep(
				firstItem([], true),
				undefined,
				"Aza.firstItem([], true)"
			);
		});

		this.addTest("hasProp", function(api) {
			var hasProp = Aza.hasProp,
				num = 1;


			api.assertTrue(hasProp({some: 123, other: 456}, "other"),					num++);
			api.assertTrue(hasProp({some: 123, other: 456}, "some", "another"),			num++);
			api.assertTrue(hasProp([123, 456], "0", "5"),								num++);
			api.assertTrue(hasProp([123, 456], 0, 5),									num++);

			api.assertFalse(hasProp([], "join"),											num++);
			api.assertFalse(hasProp([], 0),												num++);
			api.assertFalse(hasProp("some", "hd"),										num++);
			api.assertFalse(hasProp({some: 123, other: 456}, "another"),					num++);
		});

		this.addTest("hasAllProp", function(api) {
			var hasAllProp = Aza.hasAllProp,
				num = 1;


			api.assertTrue(hasAllProp({some: 123, other: 456}, "some"),						num++);
			api.assertTrue(hasAllProp({some: 123, other: 456}, "some", "other"),			num++);
			api.assertTrue(hasAllProp([123, 456], "0", "1"),								num++);
			api.assertTrue(hasAllProp([123, 456], 0),										num++);
			api.assertTrue(hasAllProp([123, 456], 0, 1),									num++);

			api.assertFalse(hasAllProp({some: 123, other: 456}, "some", "another"),			num++);
			api.assertFalse(hasAllProp([], "join"),											num++);
			api.assertFalse(hasAllProp([], 0),												num++);
			api.assertFalse(hasAllProp("some", "hd"),										num++);
			api.assertFalse(hasAllProp({some: 123, other: 456}, "another"),					num++);
		});

		this.addTest("proxyCollector", 13, function(api) {
			var proxyCollector = Aza.proxyCollector,

				obj1 = {
					m1: function() {
						api.assertTrue(this === obj1, "obj1 m1: this");
						api.assertSame(arguments.length, 0, "obj1 m1: arguments.length");
					},
					m2: function(p1, p2) {
						api.assertTrue(this === obj1, "obj1 m1: this");
						api.assertSame(arguments.length, 2, "obj1 m1: arguments.length");
						api.assertSame(p1, 123, "obj1 m1: p1");
						api.assertSame(p2, 456, "obj1 m1: p2");
					},

					p1: "a",
					p2: "b",

					p3: 11111,
					p4: 22222
				},

				keys = ["m1", "m2", "p1", "p2"],
				res = proxyCollector(obj1, keys),
				keysCount = 0;


			for (var key in res) if (res.hasOwnProperty(key)) {
				api.assertTrue(Aza.inArray(key, keys) > -1, "search for key '" + key + "'");
				keysCount++;
			}

			api.assertSame(keysCount, 4, "keysCount");


			res.m1();
			res.m2(123, 456);


			api.assertSame(res.p1, "a", "p1");
			api.assertSame(res.p2, "b", "p2");
		});


		// type checkers

		this.addTest("isNumeric", function(api) {
			api.assertTrue(Aza.isNumeric(0),				"Number 0");
			api.assertTrue(Aza.isNumeric(1),				"Number 1");
			api.assertTrue(Aza.isNumeric(2),				"Number 2");
			api.assertTrue(Aza.isNumeric(-1),				"Number -1");
			api.assertTrue(Aza.isNumeric(-2),				"Number -2");
			api.assertTrue(Aza.isNumeric(0.1),				"Number 0.1");
			api.assertTrue(Aza.isNumeric(-0.1),			    "Number -0.1");
			api.assertTrue(Aza.isNumeric(.1),				"Number .1");

			api.assertTrue(Aza.isNumeric("0"),				"String 0");
			api.assertTrue(Aza.isNumeric("1"),				"String 1");
			api.assertTrue(Aza.isNumeric("2"),				"String 2");
			api.assertTrue(Aza.isNumeric("-1"),			    "String -1");
			api.assertTrue(Aza.isNumeric("-2"),			    "String -2");
			api.assertTrue(Aza.isNumeric("0.1"),			"String 0.1");
			api.assertTrue(Aza.isNumeric("-0.1"),			"String -0.1");
			api.assertTrue(Aza.isNumeric(".1"),			    "String .1");

			api.assertFalse(Aza.isNumeric([]),				"[]");
			api.assertFalse(Aza.isNumeric([123]),			"[123]");
			api.assertFalse(Aza.isNumeric([123,456]),		"[123,456]");
			api.assertFalse(Aza.isNumeric({}),				"{}");
			api.assertFalse(Aza.isNumeric({123:456}),		"{123:456}");
			api.assertFalse(Aza.isNumeric("test"),			"'test'");
			api.assertFalse(Aza.isNumeric("1test"),		    "'1test'");
		});

		this.addTest("isFunction", function(api) {
			/**
			 * Примечание:
			 * Такие нативные функции как, например, alert() или getAttribute() у DOM-элемента
			 * могут быть неверно распознаны в Internet Explorer.
			 */

			api.assertTrue(Aza.isFunction(function() { }),			"function() { }");

			api.assertTrue(Aza.isFunction(Aza.isFunction),			"Aza.isFunction");
			api.assertTrue(Aza.isFunction(Aza.norm),				"Aza.norm");
			api.assertTrue(Aza.isFunction(String.prototype.trim),	"String.prototype.trim");
			api.assertTrue(Aza.isFunction(Array.prototype.join),	"Array.prototype.join");

			api.assertFalse(Aza.isFunction(123),					"123");
			api.assertFalse(Aza.isFunction([]),						"[]");
			api.assertFalse(Aza.isFunction([function() { }]),		"[function() { }]");
			api.assertFalse(Aza.isFunction({}),						"{}");
			api.assertFalse(Aza.isFunction("test"),					"'test'");
			api.assertFalse(Aza.isFunction(/\w/),					"/\\w/");
		});

		this.addTest("isArguments", function(api) {
			var noop = Aza.noop,
				DOMElem = document.createElement("div"),
				DOMElem2 = document.createElement("div"),
				DOMElem3 = document.createElement("div"),
				DOMElem4 = document.createElement("div");

			DOMElem2.callee = true;

			DOMElem3.callee = true;
			DOMElem3.length = 123;

			DOMElem4.callee = function() { };
			DOMElem4.length = 123;

			api.assertFalse(Aza.isArguments([]),						"Aza.isArguments([])");
			api.assertFalse(Aza.isArguments([123,456,789]),				"Aza.isArguments([123,456,789])");
			api.assertFalse(Aza.isArguments({}),						"Aza.isArguments({})");
			api.assertFalse(Aza.isArguments({callee:123}),				"Aza.isArguments({callee:123})");
			api.assertFalse(Aza.isArguments({length:123}),				"Aza.isArguments({length:123})");
			api.assertFalse(Aza.isArguments({callee:123, length:123}),	"Aza.isArguments({callee:123, length:123})");
			api.assertFalse(Aza.isArguments({callee:noop, length:123}),	"Aza.isArguments({callee:noop, length:123})");
			api.assertFalse(Aza.isArguments(1),							"Aza.isArguments(1)");
			api.assertFalse(Aza.isArguments(true),						"Aza.isArguments(true)");
			api.assertFalse(Aza.isArguments(null),						"Aza.isArguments(null)");
			api.assertFalse(Aza.isArguments(undefined),					"Aza.isArguments(undefined)");
			api.assertFalse(Aza.isArguments("text"),					"Aza.isArguments('text')");
			api.assertFalse(Aza.isArguments(DOMElem),					"Aza.isArguments(DOMElem)");
			api.assertFalse(Aza.isArguments(DOMElem2),					"Aza.isArguments(DOMElem2)");
			api.assertFalse(Aza.isArguments(DOMElem3),					"Aza.isArguments(DOMElem3)");
			api.assertFalse(Aza.isArguments(DOMElem4),					"Aza.isArguments(DOMElem4)");

			(function() {
				api.assertTrue(Aza.isArguments(arguments), "Aza.isArguments(arguments)");
			})(123,456,789);

			(function() {
				api.assertTrue(Aza.isArguments(arguments), "Aza.isArguments(arguments)");
			})();

			function fn(obj) {
				api.assertTrue(Aza.isArguments(arguments), "Aza.isArguments(arguments)");
			}

			fn();

			fn(123);

			fn(123, 456);

			fn.call(null);

			fn.apply(null, [123,456]);
		});


		// type converters

		this.addTest("toBool", function(api) {
			api.assertSame(Aza.toBool(true),			true,		"true");
			api.assertSame(Aza.toBool(false),			false,		"false");
			api.assertSame(Aza.toBool(null),			false,		"null");
			api.assertSame(Aza.toBool(undefined),		false,		"undefined");
			api.assertSame(Aza.toBool(NaN),			    false,		"NaN");

			api.assertSame(Aza.toBool(0),				false,		"0");
			api.assertSame(Aza.toBool(1),				true,		"1");
			api.assertSame(Aza.toBool(2),				true,		"2");
			api.assertSame(Aza.toBool(-1),				true,		"-1");
			api.assertSame(Aza.toBool(-2),				true,		"-2");

			api.assertSame(Aza.toBool("true"),			true,		"'true'");
			api.assertSame(Aza.toBool("false"),		    false,		"'false'");
			api.assertSame(Aza.toBool("null"),			false,		"'null'");
			api.assertSame(Aza.toBool("undefined"),	    false,		"'undefined'");
			api.assertSame(Aza.toBool("NaN"),			false,		"'NaN'");
		});

		this.addTest("toNumber", function(api) {
			api.assertSame(Aza.toNumber(0),					0,		"Number 0");
			api.assertSame(Aza.toNumber(1),					1,		"Number 1");
			api.assertSame(Aza.toNumber(2),					2,		"Number 2");
			api.assertSame(Aza.toNumber(10),				10,		"Number 10");
			api.assertSame(Aza.toNumber(-1),				-1,		"Number -1");
			api.assertSame(Aza.toNumber(-2),				-2,		"Number -2");
			api.assertSame(Aza.toNumber(-10),				-10,	"Number -10");
			api.assertSame(Aza.toNumber(05),				5,		"Number 05");
			api.assertSame(Aza.toNumber(-05),				-5,		"Number -05");

			api.assertSame(Aza.toNumber(0.0),				0,		"Number 0.0");
			api.assertSame(Aza.toNumber(-0.0),				0,		"Number -0.0");
			api.assertSame(Aza.toNumber(0.1),				0.1,	"Number 0.1");
			api.assertSame(Aza.toNumber(1.4),				1.4,	"Number 1.4");
			api.assertSame(Aza.toNumber(-1.4),				-1.4,	"Number -1.4");

			api.assertSame(Aza.toNumber("0"),				0,		"String 0");
			api.assertSame(Aza.toNumber("0.1"),				0.1,	"String 0.1");
			api.assertSame(Aza.toNumber("-0.1"),			-0.1,	"String -0.1");
			api.assertSame(Aza.toNumber("1"),				1,		"String 1");
			api.assertSame(Aza.toNumber("2"),				2,		"String 2");
			api.assertSame(Aza.toNumber("-1"),				-1,		"String -1");
			api.assertSame(Aza.toNumber("-2"),				-2,		"String -2");
			api.assertSame(Aza.toNumber("-12.3"),			-12.3,	"String -12.3");
			api.assertSame(Aza.toNumber("-12,3"),			-12.3,	"String -12,3");

			api.assertSame(Aza.toNumber(true),				1,		"true");
			api.assertSame(Aza.toNumber(false),				0,		"false");
			api.assertSame(Aza.toNumber(null),				0,		"null");
			api.assertSame(Aza.toNumber(undefined),			0,		"undefined");
			api.assertSame(Aza.toNumber([]),				0,		"[]");
			api.assertSame(Aza.toNumber([123]),				123,	"[123]");
			api.assertSame(Aza.toNumber([123,456]),			0,		"[123,456]");
			api.assertSame(Aza.toNumber(["some"]),			0,		"['some']");
			api.assertSame(Aza.toNumber({}),				0,		"{}");
			api.assertSame(Aza.toNumber({123:456}),			0,		"{123:456}");
			api.assertSame(Aza.toNumber("test"),			0,		"'test'");
			api.assertSame(Aza.toNumber("te123st"),			123,	"'te123st'");
			api.assertSame(Aza.toNumber("te12.3st"),		12.3,	"'te12.3st'");
			api.assertSame(Aza.toNumber("te-12.3st"),		-12.3,	"'te-12.3st'");
			api.assertSame(Aza.toNumber("t,e-12,3st"),		-12.3,	"'t,e-12,3st'");
			api.assertSame(Aza.toNumber("te12a3st"),		12,		"'te12a3st'");
		});

		this.addTest("toArray", function(api) {
			api.assertDeep(Aza.toArray([]),					[],					"[]");
			api.assertDeep(Aza.toArray([123]),				[123],				"[123]");

			api.assertDeep(Aza.toArray({}),					[{}],				"{}");
			api.assertDeep(Aza.toArray({p1:123}),			[{p1:123}],			"{p1:123}");

			api.assertDeep(Aza.toArray(123),				[123],				"123");
			api.assertDeep(Aza.toArray("test"),				["test"],			"'test'");
			api.assertDeep(Aza.toArray(Aza.norm),			[Aza.norm],			"Aza.norm");


			(function(p1, p2, p3) {
				api.assertDeep(Aza.toArray(arguments),		[123, "test", {}],	"arguments");
			})(123, "test", {});
		});


		// others

		this.addTest("guid", function(api) {
			var guid = Aza.guid();

			function makeObj(val) {
				var obj = {};
				obj[Aza.expando] = val;
				return obj;
			}

			api.assertSame(
					Aza.guid(),
					++guid,
					"Без параметров"
			);

			api.assertSame(
					Aza.guid({}),
					++guid,
					"Aza.guid({})"
			);

			api.assertSame(
					Aza.guid(makeObj(123)),
					123,
					"Aza.guid({expando: 123})"
			);

			api.assertSame(
					Aza.guid({}, 1),
					false,
					"Aza.guid({}, 1)"
			);

			api.assertSame(
					Aza.guid(makeObj(123), 1),
					123,
					"Aza.guid({expando: 123}, 1)"
			);

			api.assertSame(
					Aza.guid({}, 2),
					++guid,
					"Aza.guid({}, 2)"
			);

			api.assertSame(
					Aza.guid(makeObj(123), 2),
					++guid,
					"Aza.guid({expando: 123}, 2)"
			);
		});

		this.addTest("processConfig", function(api) {
			var res = Aza.processConfig({
				branch1: {
					branch11: {
						branch111: 111,
						branch112: 112,
						branch113: [1,2,3]
					}
				},
				branch2: {
					branch21: 21,
					branch22: {
						branch221: "${../../branch21}"
					}
				},
				branch3: {
					branch31: 31,
					branch32: "${../../branch1.branch11.branch113}",
					branch33: "${../branch31} ${../../branch2.branch21}",
					branch34: "${../../branch1.branch11.branch113} is array"
				},
				branch4: {
					branch41: "${branch1.branch11.branch111}",
					branch42: "${branch1.branch11.branch111} ${../branch41}",
					branch43: "${../../branch3.branch31}"
				}
			});

			api.assertDeep(res, {
				branch1: {
					branch11: {
						branch111: 111,
						branch112: 112,
						branch113: [1,2,3]
					}
				},
				branch2: {
					branch21: 21,
					branch22: {
						branch221: 21
					}
				},
				branch3: {
					branch31: 31,
					branch32: [1,2,3],
					branch33: "31 21",
					branch34: "1,2,3 is array"
				},
				branch4: {
					branch41: 111,
					branch42: "111 111",
					branch43: 31
				}
			});
		});
	});
});

