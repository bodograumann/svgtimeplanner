/* globals jQuery, Snap */

(function(Canaaerus, $, Snap)
{
	'use strict';

	class TimeScale
	{
		/**
		 * Create a new time scale with adaptive labels
		 *
		 * @param {Date} start
		 * @param {Date} end
		 */
		constructor(start, end)
		{
			this.start = start;
			this.end = end;
		}

		/**
		 * Create svg elements
		 *
		 * @param {Paper} Snap.svg paper
		 *
		 * @return {Element}
		 */
		draw(paper)
		{
			/** milliseconds per svg user user unit */
			const scaling = 60*60*1000 / 30;

			var group = paper.g().addClass('TimeScale');

			var day_group = paper.g().addClass('Days').appendTo(group);
			for (let [start, end] of this.days()) {
				let middle = (Number(start) + Number(end)) / 2;
				paper.text(
					(middle - this.start) / scaling,
					0,
					start.getDate() + '.' + String(start.getMonth()+1).padStart(2, '0') + '.'
				)
					.appendTo(day_group);
			}

			var hour_group = paper.g().addClass('Hours').appendTo(group);
			for (let tick of this.hours()) {
				paper.text(
					(tick - this.start) / scaling,
					0,
					tick.getHours() + ':' + String(tick.getMinutes()).padStart(2, '0')
				)
					.appendTo(hour_group);
			}
		}

		/**
		 * Iterate over all days in the time interval
		 *
		 * @yield {[Date, Date]} day start and end restricted to interval
		 */
		*days()
		{
			var first = new Date(this.start).setHours(0, 0, 0, 0);
			var start = this.start, end;

			for (
				let idx = 1;
				(end = new Date(first + idx*24*60*60*1000)) < this.end;
				idx++
			) {
				yield [start, end];
				start = end;
			}
			yield [start, this.end];
		}

		/**
		 * Iterate over whole hours in the time interval
		 *
		 * @yield {Date} hour tick
		 */
		*hours()
		{
			var first = new Date(this.start).setMinutes(0, 0, 0);
			var tick;
			for (
				let idx = first >= this.start ? 0 : 1;
				(tick = new Date(first + idx*60*60*1000)) <= this.end;
				idx++
			) {
				yield tick;
			}
		}
	}

	Canaaerus.SVGTimePlanner = class SVGTimePlanner
	{
		/**
		 * Autoload planners where the SVGTimePlanner css class is set
		 */
		static autoload()
		{
			$('.SVGTimePlanner').each(
				(index, element) => {
					let content = $(element).text();
					$(element).text('');
					let planner = new Canaaerus.SVGTimePlanner(
						new Date(element.dataset.start),
						new Date(element.dataset.end),
						Boolean(element.dataset.edit),
						element
					);

					if (content) {
						planner.loadData(JSON.parse(content));
					}
				}
			);
		}

		/**
		 * Create a new empty planner
		 *
		 * The start must lie before the end.
		 *
		 * @param {Date} start
		 * @param {Date} end
		 * @param {Boolean} editor - Enable editor controls
		 */
		constructor(start, end, editor = false, container = null)
		{
			if (start >= end) {
				$.error('Invalid parameters: start must lie before end');
			}

			if (editor) {
				$.error('Not implemented');
			}

			this._container = $(container || '<div>');
			this._container.addClass('SVGTimePlanner');

			this.diagram = Snap(1800, 1112);
			this._container.get(0).appendChild(this.diagram.node);

			this.scale = new TimeScale(start, end).draw(this.diagram);
			this.diagram.append(this.scale);
		}

		/**
		 * Get the DOM container element
		 *
		 * @return {HTMLElement}
		 */
		get container()
		{
			return this._container;
		}

		/**
		 * Load data from a plain object as returned by saveData
		 *
		 * @param {Object} data
		 */
		loadData(data)
		{
			$.error('Not implemented');
		}

		/**
		 * Return all data as plain object, which can be stored as JSON string e.g.
		 *
		 * @return {Object}
		 */
		saveData()
		{
			$.error('Not implemented');
		}

		/**
		 * Reset plan to an empty state
		 */
		reset()
		{
			$.error('Not implemented');
		}

		/**
		 * Download planner as standalone HTML file
		 */
		download()
		{
			$.error('Not implemented');
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
			$.error('Not implemented');
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
			$.error('Not implemented');
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
			$.error('Not implemented');
		}
	};

	/** Invoke autoload */
	$(Canaaerus.SVGTimePlanner.autoload);

})(window.Canaaerus = window.Canaaerus || {}, jQuery, Snap);
