
define(function()
{
	var Events = {};


	function on(types, data, handler) {
		var bindings = this.events.bindings,
			type, i;

		types = types.split(' ');

		for (i = 0; i < types.length; i++) {
			type = types[i];
			(bindings[type] || (bindings[type] = [])).push({
				type: type,
				data: handler ? data : null,
				handler: handler || data
			});
		}

		return this;
	}

	function off(type, handler) {
		var bindings = this.events.bindings[type] || [];

		for (var i = 0, k = 0, len = bindings.length; i < len; i++) {
			if (bindings[i].handler === handler) {
				bindings.splice(k, 1);
			}
			else {
				k = i;
			}
		}

		return this;
	}

	function trigger(type, args) {
		var bindings = this.events.bindings[type] || [], i;

		for (i = 0; i < bindings.length; i++) {
			bindings[i].handler.apply(this, [bindings[i]].concat(args || []));
		}

		return this;
	}

	function clear() {
		var bindings = this.events.bindings, key;
		for (key in bindings) {
			if (bindings.hasOwnProperty(key)) {
				delete bindings[key];
			}
		}
		return this;
	}


	Events.eventalize = function(object) {
		object.on = on;
		object.off = off;
		object.trigger = trigger;
		object.events = {
			bindings: {},
			on: on,
			off: off,
			trigger: trigger,
			clear: clear
		};

		return object;
	};

	Events.eventalize(Events);


	return Events;
});
