
define(["../Class","../Events"], function(Class, Events)
{
	var Dispatcher = Class.extend(function() {
		Events.eventalize(this);
	});

	return Dispatcher;
});
