
define([
	"jquery","jquery/mainElems",
	"../Condition",
	"../../event/dispatchers/DomDispatcher"], function($, $me, Condition, DomDispatcher)
{
	var flagPath = "__RoutingSelectorCondition_used_",
		condCount = 0;

	/**
	 * Checks selectors
	 * @type {*}
	 */
	return Condition.extend(function(params) {
		function updateMatched($fragment) {
			$fragment = $fragment || $.docElem;
			matched = [];

			for (var i = 0, $res; i < params.length; i++) {
				$res = $fragment.find(params[i]).filter(function() {
					return !this[path];
				});

				if ($res.length)
					matched[i] = $res;
				else {
					matched = [];
					return;
				}
			}
		}

		function onDomAdd(e, $fragment) {
			updateMatched($fragment);
			api.trigger(Condition.EV_MIGHT_CHANGED);
		}


		Condition.call(this);

		params = params.join ? params : [params];

		var api = this,
			cid = condCount++,
			path = flagPath + cid,
			matched = [];


		api.check = function() {
			return !!matched.length && matched;
		};

		api.beforeRouteLaunch = function() {
			for (var i = 0; i < matched.length; i++)
				matched[0].each(function(i, elem) {
					elem[path] = true;
				});

			matched = [];
		};


		updateMatched();


		DomDispatcher.on(DomDispatcher.EV_DOM_ADD, onDomAdd);
	});
});
