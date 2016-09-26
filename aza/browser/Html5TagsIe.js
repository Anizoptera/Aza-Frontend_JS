/**
 * Helper to make IE8 handle HTML5-tags properly.
 */
define(["aza/browser/Detector"], function(Detector)
{
	var ALL_THE_TAGS = "abbr article aside audio canvas datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video".split(" ");

	return function(tags) {
		if (Detector.msie8lt) {
			tags = tags
				? tags.join ? tags : tags.split(' ')
				: ALL_THE_TAGS;

			for (var i = 0; i < tags.length; i++)
				$("body").append(document.createElement(tags[i]));
		}
	}
});
