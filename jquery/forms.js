
define(["jquery"], function($)
{
	/**
	 * Encodes form elements.
	 * Properly works with any kind of containers, not only with FORMs.
	 * @see http://api.jquery.com/serialize/
	 * @returns {string} URL-encoded notation
	 */
	$.fn.serializeObject = function() {
		if (this[0].tagName.toUpperCase() === "FORM")
			return this.serialize();

		// Selects all input, textarea, select and button elements.
		return this.find(":input").serialize();
	};

	return $;
});
