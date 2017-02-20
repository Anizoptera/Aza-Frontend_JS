
define([
	"jquery",
	"../Core", "../Events",
	"./ACondition"
], function($, Aza, Events, ACondition)
{
	return function(router, opts, conditions, handler) {
		var api = Aza.extend(this, {
				conditions: conditions,
				options: opts,
				id: opts.id
			}),
			handlers = [],
			condInstances = {};

		Events.eventalize(api);


		api.check = function() {
			var args = [],
				code, res, i;

			for (code in condInstances)
				if (condInstances.hasOwnProperty(code)) {
					if (res = condInstances[code].check())
						args.push.apply(args, res);
					else return false;
				}

			for (code in condInstances)
				if (condInstances.hasOwnProperty(code))
					condInstances[code].beforeRouteLaunch();

			for (i = 0; i < handlers.length; i++)
				handlers[i].apply(api, args);

			return true;
		};

		api.addHandler = function(handler) {
			if (Aza.inArray(handler, handlers) < 0)
				handlers.push(handler);
			return api;
		};


		(function(conditionClasses) {
			var code, ConditionClass;

			for (code in conditions)
				if (conditions.hasOwnProperty(code)) {
					if (!conditionClasses[code])
						throw new Error("SingleRoute: Condition '"+code+"' not found");

					ConditionClass = conditionClasses[code].ConditionClass;

					condInstances[code] = new (ConditionClass.extend(function() {
						//noinspection JSReferencingMutableVariableFromClosure
						ConditionClass.apply(this, [conditions[code]].concat(conditionClasses[code].args));
					}))();

					condInstances[code].on(ACondition.EV_MIGHT_CHANGED, Aza.proxy(api.check, api));
				}

		})(router.conditionClasses);


		api.addHandler(handler);
	};
});
