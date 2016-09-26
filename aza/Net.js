
define(["jquery", "jquery/forms", "./Core"], function($, $$f, Aza)
{
	var Net = {};

	Net.METHOD_GET      = "GET";
	Net.METHOD_POST     = "POST";
	Net.METHOD_PUT      = "PUT";
	Net.METHOD_CREATE   = "CREATE";
	Net.METHOD_DELETE   = "DELETE";

	Net.FORMAT_ANY      = "*";
	Net.FORMAT_TEXT     = "text";
	Net.FORMAT_XML      = "xml";
	Net.FORMAT_HTML     = "html";
	Net.FORMAT_SCRIPT   = "script";
	Net.FORMAT_JSON     = "json";
	Net.FORMAT_JSONP    = "jsonp";


	/**
	 * Performs an asynchronous HTTP (Ajax) request
	 * http://api.jquery.com/jQuery.ajax/
	 *
	 * @param {String|Object} url
	 * @param {Object=} opts
	 * @returns {Object} jqXHR
	 */
	Net.ajax = function(url, opts) {
		if (typeof url === "object") {
			opts = url;
			url = undefined;
		}

		opts = opts || {};
		opts.method = opts.type || Net.METHOD_POST;
		opts.url = url || opts.url || location.href.replace(/\?.*/, "");
		opts.timeout = opts.timeout || 10000;

		return $.ajax(opts);
	};

	/**
	 * Sets default values for future Ajax requests
	 * http://api.jquery.com/jQuery.ajaxSetup/
	 *
	 * @param {Object} options
	 */
	Net.ajaxSetup = function(options) {
		$.ajaxSetup(options);
	};


	/**
	 * Sends a form or any contaier of inputs
	 *
	 * @param {jquery} $form
	 * @param {string=} url
	 * @param {Object=} opts
	 *
	 * @return {Object} jqXHR
	 */
	Net.sendForm = function($form, url, opts) {
		if (typeof url === 'object') {
			opts = url;
			url = "";
		}

		opts = Aza.extend({}, opts);

		var oData = opts.data,
			dataString = $form.serializeObject();

		opts.data = dataString + (oData != null && typeof oData !== 'object' ? '&' + oData : $.param(oData || {}));
		opts.url = url || opts.url || $form.attr('action');
		opts.type = opts.type || $form.attr('method') || Net.METHOD_POST;

		return Net.ajax(opts);
	};


	return Net;
});
