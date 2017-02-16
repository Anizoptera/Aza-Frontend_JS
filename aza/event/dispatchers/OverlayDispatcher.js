
define(["../../Events"], function(Events)
{
	var Overlay = {
			EV_SHOW:        "ovrlShow",
			EV_SHOWFIRST:   "ovrlShowFirst",
			EV_HIDE:        "ovrlHide",
			EV_HIDELAST:    "ovrlHideLast"
		},
		shownCount = 0;


	Events.eventalize(Overlay);


	Overlay.on(Overlay.EV_SHOW, function() {
		shownCount || Overlay.trigger(Overlay.EV_SHOWFIRST);
		shownCount++;
	});

	Overlay.on(Overlay.EV_HIDE, function() {
		shownCount = Math.max(--shownCount, 0);
		shownCount || Overlay.trigger(Overlay.EV_HIDELAST);
	});


	return Overlay;
});
