
// TODO: Check out the nice API of EventEmitter:
// https://github.com/guardian/scribe/wiki/Components#event-emitter
define(["./Core"], function(Aza)
{
	var Events = {},

		REX_EVENT		= /^(?:(\w+|\*)?:)?(\w+|\*)?(?:\.(\w+))?$/,
		REX_SPACES		= /\s+/,

		STAR			= "*";


	function splitEvents(events) {
		return events != null
					? (events.join ? events : Aza.trim(events).split(REX_SPACES))
					: events;
	}


	function on(events, data, fn) {
		var object = this,
			bindings = object.events.bindings,
			selector, match,
			nspace, room, type,
			i = 0;


		events = splitEvents(events);
		if (!events)
			return object;


		if (arguments.length < 3) {
			fn = data;
			data = null;
		}

		if (data === undefined)
			data = null;


		while (selector = events[i++]) {
			match = REX_EVENT.exec(selector) || [];

			room	= match[1] || STAR;
			type	= match[2] || STAR;
			nspace	= match[3] || false;

			(bindings[type] || (bindings[type] = [])).push({
				selector: selector,
				room: room,
				type: type,
				namespace: nspace,

				data: data,
				target: object,
				handler: fn,

				toString: Aza.returner("[object HandleObject]")
			});
		}


		return object;
	}

	function off(events, fn) {
		var object = this,
			bindings = object.events.bindings,
			selector, match,
			room, type, nspaces,
			bindingsSector = {},
			i = 0;


		events = splitEvents(events);
		if (!events)
			return object;


		while (selector = events[i++]) {
			match = REX_EVENT.exec(selector) || [];

			room	= match[1] || STAR;
			type	= match[2] || STAR;
			nspaces	= match[3] || false;

			if (nspaces)
				nspaces = new RegExp("\\b(" + nspaces.replace(".", "|") + ")\\b");

			if (type !== STAR) {
				if (!bindings[type]) continue;
				bindingsSector[type] = bindings[type];
			}
			else {
				bindingsSector = bindings;
			}

			Aza.each(bindingsSector, function(tp, evs) {
				var event,
					j = 0;

				for ( ; j < evs.length; j++) {
					event = evs[j];

					if (type !== STAR && event.type !== type)
						continue;

					if (room !== STAR && event.room !== room)
						continue;

					if (nspaces && (!event.namespace || !nspaces.test(event.namespace)))
						continue;

					if (fn && event.handler !== fn)
						continue;

					evs.splice(j--, 1);
				}

				if (!evs.length)
					delete bindings[tp];
			})
		}


		return object;
	}

	function trigger(events, data) {
		var object = this,
			bindings = object.events.bindings,
			selector, match,
			room, type,
			bindingsToLaunch,
			i = 0;


		events = splitEvents(events);
		if (!events)
			return object;


		data = data != null ? Aza.makeArray(data) : [];


		while (selector = events[i++]) {
			match = REX_EVENT.exec(selector) || [];

			room	= match[1] || STAR;
			type	= match[2] || STAR;

			bindingsToLaunch = {};
			if (type !== STAR) {
				if (bindings[STAR])
					bindingsToLaunch[STAR] = bindings[STAR];

				if (bindings[type])
					bindingsToLaunch[type] = bindings[type];
			}
			else {
				bindingsToLaunch = bindings;
			}

			Aza.each(bindingsToLaunch, function(tp, evs) {
				var handleObj, handler,
					event = {
						selector: selector,
						type: type,
						room: room,

						target: object,

						timeStamp: Aza.now(),

						stopPropagation: function() {
							this.isPropagationStopped = Aza.returner(true);
						},
						isPropagationStopped: Aza.returner(false),

						toString: Aza.returner("[object Event]")
					},
					j = 0;

				for ( ; j < evs.length; j++) {
					handleObj = evs[j];

					if (handleObj.room !== STAR && handleObj.room !== room)
						continue;

					if (handler = handleObj.handler) {
						event.data = handleObj.data;
						event.handleObj = handleObj;

						if (handler.apply(object, [event].concat(data)) === false)
							event.stopPropagation();

						if (event.isPropagationStopped())
							return false;
					}
				}
			})
		}


		return object;
	}

	function clear() {
		Aza.clearObject(this.bindings);
		return this;
	}


	Events.eventalize = function(object) {
		return Aza.extend(object, {
			on: on,
			off: off,
			trigger: trigger,

			events: {
				bindings: {},

				on: on,
				off: off,
				trigger: trigger,
				clear: clear
			}
		});
	};

	Events.prepareNSpace = function(namespace) {
		return namespace ? "." + namespace.replace(/^\./, "") : "";
	};

	Events.addNSpace = function(eventString, namespace) {
		return Aza.trim(eventString.split(REX_SPACES).concat("").join(Events.prepareNSpace(namespace) + " "));
	};


	Events.eventalize(Events);


	return Events;
});
