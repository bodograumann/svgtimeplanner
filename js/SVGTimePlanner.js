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

			/** milliseconds per svg user user unit */
			this.scaling = 60*60*1000 / 30;
		}

		/**
		 * Get horizontal offset for a point in time
		 *
		 * @param {Date} date
		 *
		 * @return {Number}
		 */
		getOffset(date)
		{
			return (date - this.start) / this.scaling;
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
			const group = paper.g().addClass('TimeScale');

			const day_group = paper.g().addClass('Days').prependTo(group);
			for (const [start, end] of this.days()) {
				const middle = (Number(start) + Number(end)) / 2;
				paper.text(
					this.getOffset(middle),
					0,
					start.getDate() + '.' + String(start.getMonth()+1).padStart(2, '0') + '.'
				)
					.appendTo(day_group);

				if (start > this.start) {
					const x = this.getOffset(start);
					paper.line(x, 0, x, '1em')
						.appendTo(day_group);
					paper.line(x, '2.2em', x, '100%')
						.appendTo(day_group);
				}
			}

			const hour_group = paper.g().addClass('Hours').prependTo(group);
			for (const tick of this.hours()) {
				paper.text(
					this.getOffset(tick),
					0,
					tick.getHours() + ':' + String(tick.getMinutes()).padStart(2, '0')
				)
					.appendTo(hour_group);
				const x = this.getOffset(tick);
				paper.line(x, '1.2em', x, '100%')
					.appendTo(hour_group);
			}

			return group;
		}

		/**
		 * Iterate over all days in the time interval
		 *
		 * @yield {[Date, Date]} day start and end restricted to interval
		 */
		*days()
		{
			const first = new Date(this.start).setHours(0, 0, 0, 0);
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
			const first = new Date(this.start).setMinutes(0, 0, 0);
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

	class TaskList extends Array
	{
		/**
		 * Create new list of tasks
		 *
		 * @param {Paper} Snap.svg paper
		 */
		constructor(paper)
		{
			super();

			this._row_height = 20;

			this.paper = paper;
			this.head = paper.g().addClass('TaskList');
			this.body = paper.g().addClass('TimeSlotGrid');

			paper.prepend(this.head);
			paper.append(this.body);
		}

		/**
		 * Create a new list element at a certain position
		 *
		 * @param {Number} position
		 *
		 * @return {Object} new row with keys 'head' and 'body'
		 */
		insertNew(position = Infinity)
		{
			const elements = {
				head: this.paper.g(),
				body: this.paper.g()
			};

			this.paper.rect(0, 0, '100%', this.row_height)
				.addClass('Background')
				.appendTo(elements.head);

			if (position >= this.length) {
				position = this.length;
				elements.head.appendTo(this.head);
				elements.body.appendTo(this.body);
				super.push(elements);
			} else {
				position = Math.max(0, position);
				elements.head.insertBefore(this[position].head);
				elements.body.insertBefore(this[position].body);
				super.splice(position, 0, elements);
			}

			this._updateOffsets(position, this.length - 1);

			return elements;
		}

		/**
		 * Get height of one row
		 *
		 * @return {Number}
		 */
		get row_height()
		{
			return this._row_height;
		}

		/**
		 * Calculate vertical offset of row in svg user units
		 *
		 * @param {Number} position - defaults to last row
		 *
		 * @return {Number} vertical offset
		 */
		getOffset(position = this.length - 1)
		{
			return position * this.row_height;
		}

		/**
		 * Set offsets on a range of rows
		 *
		 * @param {Number} start - first row
		 * @param {Number} end - last row
		 */
		_updateOffsets(start, end)
		{
			for (let idx = start; idx <= end; idx++) {
				const transformation = `t0,${idx*this.row_height}`;
				this[idx].head.transform(transformation);
				this[idx].body.transform(transformation);
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
					const content = $(element).text();
					$(element).text('');
					const planner = new Canaaerus.SVGTimePlanner(
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

			this.scale = new TimeScale(start, end);
			this.diagram.append(this.scale.draw(this.diagram));

			this.tasks = new TaskList(this.diagram);

			this.deadlines = this.diagram.g()
				.addClass('Deadlines')
				.appendTo(this.diagram);
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
			for (const task of data.tasks || []) {
				this.addTask(String(task.name));

				for (const slot of task.slots || []) {
					this.addTimeSlot(
						new Date(slot.from),
						new Date(slot.to),
						Number(slot.effort || 1)
					);
				}

				for (const deadline of task.deadlines || []) {
					this.addDeadline(
						new Date(deadline.at),
						undefined,
						undefined,
						deadline.type
					);
				}
			}

			for (const deadline of data.deadlines || []) {
				this.addDeadline(
					new Date(deadline.at),
					deadline.tasks[0],
					deadline.tasks[1],
					deadline.type
				);
			}
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
			const task = this.tasks.insertNew();
			task.name = name;
			this.diagram.text(0, 0, name)
				.appendTo(task.head);
		}

		/**
		 * Add a time slot to a task
		 *
		 * @param {Date} start - Start of the time slot; defaults to start of plan
		 * @param {Date} end - Start of the time slot; defaults to end of plan
		 * @param {Number} effort - Required effort for the task, e.g. headcount
		 * @param {Number} task_position - Position of the task; defaults to last one
		 */
		addTimeSlot(start = -Infinity, end = Infinity, effort = 1, task_position = Infinity)
		{
			const task = this.tasks[Math.max(0, Math.min(task_position, this.tasks.length - 1))];
			const middle = this.tasks.row_height / 2;
			const φ = (1+Math.sqrt(5))/2;
			const interval = this.tasks.row_height / φ / Math.max(effort - 1, φ);

			for (let idx = 0; idx < effort; idx++) {
				const y = middle + (idx - (effort - 1)/2) * interval;

				/** Note the 1.125 correction terms for rounded linecaps, depending on the css */
				this.diagram.line(
					this.scale.getOffset(start) + 1.125,
					y,
					this.scale.getOffset(end) - 1.125,
					y
				).appendTo(task.body);
			}
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
			from_task = Math.max(0, Math.min(from_task, this.tasks.length - 1));
			to_task = Math.max(from_task, Math.min(to_task, this.tasks.length - 1));

			var x = this.scale.getOffset(deadline);
			this.diagram.line(
				x,
				this.tasks.getOffset(from_task),
				x,
				this.tasks.getOffset(to_task + 1)
			).addClass(type + 'Deadline')
				.appendTo(this.deadlines);
		}
	};

	/** Invoke autoload */
	$(Canaaerus.SVGTimePlanner.autoload);

})(window.Canaaerus = window.Canaaerus || {}, jQuery, Snap);
