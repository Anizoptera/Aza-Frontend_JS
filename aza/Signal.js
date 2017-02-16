
define(function()
{
	function Signal(name) {
		var api = this,
			callbacks = [];


		api.name = name;


		api.on = function(callback) {
			if (callbacks.indexOf(callback) < 0)
				callbacks.push(callback);
		};

		api.off = function(callback) {
			if (callback) {
				var idx = callbacks.indexOf(callback);
				if (idx >= 0)
					callbacks.splice(idx, 1);
			}
			else callbacks.splice(0, callbacks.length);
		};

		api.trigger = function(args) {
			for (var i = 0; i < callbacks.length; i++)
				callbacks[i].apply(api, arguments);
		};

		api.toString = function() {
			return "Signal("+(name != null ? name : "")+")";
		};
	}

	return Signal;
});
