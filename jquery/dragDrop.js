
define(["jquery"], function($)
{
	/*
	 Nice solution that doesn't generate dragenter/dragleave events on mouse move.
	 Based on: http://stackoverflow.com/a/14878009/4899346
	 */
	$.fn.fileDropListener = function(opts) {
		var DELAY = 100,
			timer = 0;

		function onTimer() {
			timer = 0;
			opts.dragleave && opts.dragleave();
		}

		// Note that we must prevent the 'ondragover' event to make the 'drop' event occur
		//noinspection JSUnusedGlobalSymbols
		this.on({
			dragover: function(e) {
				if (timer > 0) {
					clearTimeout(timer);
					//noinspection JSUnusedAssignment
					timer = setTimeout(onTimer, DELAY);
					return false;
				}

				var dataTransfer = e.originalEvent.dataTransfer,
					types = dataTransfer.types;

				// Handling drag-events only if they contain the "Files" type of data
				typesLoop: {
					for (var i = 0; i < types.length; i++)
						if (types[i] === "Files")
							break typesLoop;

					return false;
				}

				// Set this flag to make the OS show the user a "copy" icon
				// instead of "move" during the dragging
				dataTransfer.dropEffect = "copy";

				timer = setTimeout(onTimer, DELAY);

				opts.dragenter && opts.dragenter();
				return false;
			},
			drop: function(e) {
				clearTimeout(timer);
				timer = 0;

				opts.drop && opts.drop(e.originalEvent.dataTransfer.files);
				return false;
			}
		});
	};
});
