
define([
	"../Core", "../Events",
	"./SingleRoute"
], function(Aza, Events, SingleRoute)
{
	function Router() {
		var api = Aza.extend(this, {
				conditionClasses: {},
				routes: {},
				isStarted: false
			}),
			cid = 0;

		Events.eventalize(api);


		api.registerCondition = function(code, ConditionClass, args) {
			api.conditionClasses[code] = {
				code: code,
				ConditionClass: ConditionClass,
				args: args || []
			};
			return api;
		};


		api.add = function(opts, conditions, handler) {
			if (!handler) {
				handler = conditions;
				conditions = opts;
				opts = {};
			}

			if (typeof opts === "string")
				opts = {id: opts};

			if (opts.id == null)
				opts.id = cid++;

			var sr = api.routes[opts.id] = new SingleRoute(api, opts, conditions, handler);

			api.isStarted && sr.check();

			return api;
		};

		api.addHandler = function(id, handler) {
			if (api.routes[id])
				api.routes[id].addHandler(handler);
			return api;
		};

		api.start = function() {
			api.isStarted = true;

			for (var id in api.routes)
				if (api.routes.hasOwnProperty(id))
					api.routes[id].check();

			return api;
		};
	}

	return Router;
});
