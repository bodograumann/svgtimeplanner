/* globals jQuery, Snap */

(function(Canaerus, $, Snap)
{
	'use strict';

	class ScrollSynchronizer
	{
		/**
		 * Synchronize the scroll offsets of some DOM Elements
		 *
		 * @param {Boolean} vertical - Synchronize vertical scroll offset
		 * @param {Boolean} horizontal - Synchronize horizontal scroll offset
		 * @param {HTMLElement[]} elements - DOM Elements
		 */
		constructor(vertical, horizontal, ...elements)
		{
			throw 'Not implemented';
		}

		/**
		 * Handle scroll events
		 *
		 * @param {Event} event - scroll event
		 */
		_onScroll(event)
		{
			throw 'Not implemented';
		}
	}

	Canaerus.SVGTimePlanner = class SVGTimePlanner extends HTMLElement
	{
		/**
		 * Create a new empty planner
		 *
		 * The start must lie before the end.
		 *
		 * @param {Date} start
		 * @param {Date} end
		 * @param {Boolean} editor - Enable editor controls
		 */
		constructor(start, end, editor = false)
		{
			if (start >= end) {
				throw 'Invalid parameters: start must lie before end';
			}

			if (editor) {
				throw 'Not implemented';
			}

			super();

			throw 'Not implemented';
		}

		/**
		 * Load data from a plain object as returned by saveData
		 *
		 * @param {Object} data
		 */
		loadData(data)
		{
			throw 'Not implemented';
		}

		/**
		 * Return all data as plain object, which can be stored as JSON string e.g.
		 *
		 * @return {Object}
		 */
		saveData()
		{
			throw 'Not implemented';
		}

		/**
		 * Reset plan to an empty state
		 */
		reset()
		{
			throw 'Not implemented';
		}

		/**
		 * Download planner as standalone HTML file
		 */
		download()
		{
			throw 'Not implemented';
		}

		/**
		 * Add a new row to the planner representing a task
		 *
		 * @param {String} name
		 * @param {Number} position - Desired insert position; defaults to end
		 *
		 * @return {Number} Position of the new task
		 */
		addTask(name, position = Infinity)
		{
			throw 'Not implemented';
		}

		/**
		 * Add a time slot to a task
		 *
		 * @param {Date} start - Start of the time slot; defaults to start of plan
		 * @param {Date} end - Start of the time slot; defaults to end of plan
		 * @param {Number} effort - Required effort for the task, e.g. headcount
		 * @param {Number} task - Position of the task; defaults to last one
		 */
		addTimeSlot(start = -Infinity, end = Infinity, effort = 1, task = Infinity)
		{
			throw 'Not implemented';
		}

		/**
		 * Add a deadline
		 *
		 * It can stretch over a range of tasks.
		 *
		 * @param {Date} deadline
		 * @param {Number} from_task - start of task range; defaults to last task
		 * @param {Number} to_task - end of task range; optional
		 * @param {String} type - Type of deadline, i.e. 'Hard' or 'Soft'
		 */
		addDeadline(deadline, from_task = Infinity, to_task = from_task, type = 'Hard')
		{
			throw 'Not implemented';
		}
	};

})(window.Canaerus = window.Canaerus || {}, jQuery, Snap);
