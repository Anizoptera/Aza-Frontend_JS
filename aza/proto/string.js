
define(["../Core"], function(Aza)
{
	var StringProto = String.prototype;


	// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	if (!StringProto.trim)
		StringProto.trim = function() {
			// Space, BOM, non-breaking space
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
		};


	// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
	if (!StringProto.startsWith)
		StringProto.startsWith = function(searchString, position) {
			position = position || 0;
			return this.lastIndexOf(searchString, position) === position;
		};


	StringProto.hd = function() {
		return Aza.hd.apply(Aza, [this].concat(Aza.slice(arguments)));
	};


	return StringProto;
});
