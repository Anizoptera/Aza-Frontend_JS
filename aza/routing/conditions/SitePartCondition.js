
define(["../ACondition"], function(ACondition)
{
	var REX = /^(!)?(.*?)\/(.*)$/,
		STAR = "*";

	/**
	 * Checks controller and action,
	 * that are written in the global array named "site_part" having 2 elements:
	 * 1) site part, 2) page name.
	 *
	 * Examples:
	 *  window.site_part = ["UserProfile", "Settings"];
	 *  window.site_part = ["Admin", "Categories"];
	 *
	 * The route condition might be looking like:
	 *  "UserProfile/Settings"
	 *  "Admin/*"
	 *  "!UserProfile/Photos"
	 *  ["UserProfile/Settings", "Admin/*"]
	 *
	 * @param {string} params - Route condition
	 * @constructor
	 */
	return ACondition.extend(function(params) {
		ACondition.call(this);

		params = params.join ? params : [params];

		var api = this,
			matches = [], i;


		api.check = function() {
			var res, match, i;

			for (i = 0; i < matches.length; i++) {
				match = matches[i];
				res = checkRTE(match);
				if (!match[1] && res || match[1] && !res)
					return [];
			}

			return false;
		};


		function checkRTE(match) {
			//noinspection JSUnresolvedVariable
			return (window.site_part[0] === match[2] || match[2] === STAR)
					&& (window.site_part[1] === match[3] || match[3] === STAR);
		}


		for (i = 0; i < params.length; i++)
			if (!(matches[i] = params[i].match(REX)))
				throw new Error("SitePartCondition: Wrong routing ("+params[i]+")");
	});
});
