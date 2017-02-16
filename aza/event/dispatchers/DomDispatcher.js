
define(["../../Events"], function(Events)
{
	var Dom = {
		EV_DOM_ADD: "domAdd",
		EV_DOM_REMOVE: "domRemove"
	};

	Events.eventalize(Dom);

	return Dom;
});
