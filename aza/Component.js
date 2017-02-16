
define(["./Core", "./Class", "./Events"], function(Aza, Class, Events)
{
	var namesCounts = {};


	var Component = Class.extend(function(opts) {
		Class.apply(this, arguments);

		var api = this,
			Constr = api.constructor,
			name = Constr.componentName || "Component",
			count = namesCounts[name] = ++namesCounts[name] || 1;

		api.componentName = name;
		api.namespace = name + count;

		api.options = Constr.compileOpts(opts);

		Events.eventalize(api);
	});


	Component.componentName = "Component";

	Component.defaults = {};


	Component.extendDefaults = function(opts) {
		Aza.advancedMerge(this.defaults, opts);
		return this;
	};

	Component.compileOpts = function(opts) {
		opts = Aza.advancedMerge({}, this.defaults, opts);
		return Aza.processConfig(opts);
	};


	Component.extend = function(Constr) {
		Aza.inherit(this, Constr);

		// Clone defaults
		Constr.defaults = Aza.extend({}, this.defaults);

		return Constr;
	};


	return Component;
});
