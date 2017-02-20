
define(["../event/Dispatcher"], function(Dispatcher)
{
	var ACondition = Dispatcher.extend(function(params) {
		Dispatcher.call(this);

		/**
		 * Should return the result of checking conditions
		 * @returns {boolean}
		 */
		this.check = function() {};

		/**
		 * Is being called before performing handlers
		 * if all the conditions in the SingleRoute returned 'true'
		 */
		this.beforeRouteLaunch = function() {}
	});

	/**
	 * Event fires when the Condition decides that routing should be re-checked.
	 * @type {string}
	 */
	ACondition.EV_MIGHT_CHANGED = "mightChanged";

	return ACondition;
});

