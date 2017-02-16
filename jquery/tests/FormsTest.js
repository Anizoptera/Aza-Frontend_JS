
define(["unitjs/TestCase", "jquery", "../forms"], function(TestCase, $)
{
	return TestCase.extend("Forms", function()
	{
		this.addTest("serializeObject", function(api) {
			// Encoded string:
			// token=123abc123&title=title+value&tag=tag1&tag=tag2&tag=tag3&content=some+text&simpleSelect=val2&multSelect=val2&multSelect=val3&checker2=on&checker4=val2&radiobtn=on&radiobtn2=val2

			var formHTML =
					'<div>' +
						'<input name="hid" type="hidden" value="123abc123"/>' +
						'<input name="title" type="text" value="title value"/>' +

						'<input name="tag" type="text" value="tag1"/>' +
						'<input name="tag" type="text" value="tag2"/>' +
						'<input name="tag" type="text" value="tag3"/>' +

						'<textarea name="content">some text</textarea>' +
						'<select name="simpleSelect">' +
							'<option value="val1">opt 1</option>' +
							'<option value="val2" selected>opt 2</option>' +
							'<option value="val3">opt 3</option>' +
						'</select>' +
						'<select name="multSelect" multiple="multiple">' +
							'<option value="val1">opt 1</option>' +
							'<option value="val2" selected>opt 2</option>' +
							'<option value="val3" selected>opt 3</option>' +
						'</select>' +
						'<input type="checkbox" name="checker1"/>' +
						'<input type="checkbox" name="checker2" checked="checked"/>' +
						'<input type="checkbox" name="checker3" value="val1"/>' +
						'<input type="checkbox" name="checker4" value="val2" checked="checked"/>' +
						'<br/>' +
						'<input type="radio" name="radiobtn"/>' +
						'<input type="radio" name="radiobtn" checked/>' +
						'<input type="radio" name="radiobtn"/>' +
						'<br/>' +
						'<input type="radio" name="radiobtn2" value="val1"/>' +
						'<input type="radio" name="radiobtn2" value="val2" checked/>' +
						'<input type="radio" name="radiobtn2" value="val3"/>' +
						'<br/>' +
						'<input type="radio" name="radiobtn3"/>' +
						'<input type="radio" name="radiobtn3"/>' +
						'<input type="radio" name="radiobtn3"/>' +
						'<br/>' +
						'<input type="radio" name="radiobtn4" value="val1"/>' +
						'<input type="radio" name="radiobtn4" value="val2"/>' +
						'<input type="radio" name="radiobtn4" value="val3"/>' +
					'<div>',
				$form = $(formHTML),
				exp = {
					hid: "123abc123",
					title: "title value",
					tag: ["tag1","tag2","tag3"],
					content: "some text",
					simpleSelect: "val2",
					multSelect: ["val2", "val3"],
					checker2: "on",
					checker4: "val2",
					radiobtn: "on",
					radiobtn2: "val2"
				};


			api.assertDeep($form.serializeObject(), exp);


			var expExc = $.extend({}, exp);
			delete expExc.hid;
			delete expExc.checker2;

			api.assertDeep($form.serializeObject(["token", "checker2"]), expExc);
		});
	});
});
