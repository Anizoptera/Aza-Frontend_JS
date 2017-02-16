
define(["../Core"], function(Aza)
{
	var FIRST = 1000,       // z-indexes started from this number
		RANGES_LENGTHS = [  // Reserved z-index ranges TODO: Create constants
			1000,           // 0: Background objects (e.g. some static html-structures)
			3000,           // 1: Objects of middle depth (e.g. non-active chat or audio-player)
			5000,           // 2: Main interactive widgets (e.g. modals, overlays, plugins like "Crop")
			2000,           // 3: Higher objects (e.g. ui-elements: custom selects, manus, tooltips)
			1000            // 4: Systems objects (e.g. custom alerts, error modals)
		],
		DEFAULT_RANGE = 2,

		curr = FIRST,
		ranges = (function() {
			var ranges = [], i;
			for (i = 0; i < RANGES_LENGTHS.length; i++)
				ranges.push({
					maxTaken: curr - 1,
					min: curr,
					max: (curr += RANGES_LENGTHS[i]) - 1,
					items: []
				});
			return ranges;
		})();


	/**
	 * Useful z-index manager
	 *
	 * @constructor
	 * @param {Number}  length      Number of required z-index values
	 * @param {Number}  rangeNum    Widget type (id of z-index range)
	 */
	function ZIndex(length, rangeNum) {
		var api = Aza.extend(this, {
				length: length,
				rangeNum: rangeNum || DEFAULT_RANGE,
				first: 0,
				last: 0,
				isPseudo: false
			}),
			range, rangeItems;


		if (length === true) {
			api.isPseudo = length;

			api.first = rangeNum;
			api.last = arguments[2] || rangeNum;

			api.length = api.last - api.first + 1;
			api.rangeNum = -1;
		}


		api.capture = function() {
			if (!api.isPseudo && !api.captured) {
				api.captured = true;

				range = ranges[api.rangeNum];
				rangeItems = range.items;

				api.first = range.maxTaken + 1;
				api.last = (range.maxTaken += api.length);

				rangeItems.push(api);
			}

			return api;
		};

		api.release = function() {
			if (!api.isPseudo && api.captured) {
				api.captured = false;

				api.first = api.last = 0;

				rangeItems.splice(Aza.inArray(api, rangeItems), 1);
				updateMaxTaken(range);
			}

			return api;
		};

		api.eq = function(n) {
			api.capture();
			return Aza.norm(api.first + n, api.first, api.last);
		};
	}

	/**
	 * Creation helper
	 *
	 * ZIndex.create(1, 1) // Will return new ZIndex(1, 1)
	 * ZIndex.create(1, zi) // Will return 'zi' if it is already an instance of ZIndex
	 *
	 * @param {Number}          length
	 * @param {Number|ZIndex}   rangeNum
	 * @returns {ZIndex}
	 */
	ZIndex.create = function(length, rangeNum) {
		return rangeNum instanceof ZIndex
			? rangeNum
			: new ZIndex(length, rangeNum);
	};


	function updateMaxTaken(range) {
		var items = range.items,
			maxTaken = range.min - 1, i;

		for (i = 0; i < items.length; i++)
			if (items[i].captured)
				maxTaken = Math.max(maxTaken, items[i].last);

		range.maxTaken = maxTaken;
	}


	return ZIndex;
});
