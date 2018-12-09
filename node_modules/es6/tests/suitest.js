// -*- coding: utf-8; indent-tabs-mode: nil; tab-width: 4; c-basic-offset: 4; -*-

/**
 * Suitest is a powerful and easy-to-use JavaScript test suite
 * @author: Alexander Guinness
 * @version: 0.1.1
 * license: MIT
 * @date: ‎Sun Aug 12 03:30:00 2012
 **/

void function(__object__, __define__)
{
	var __global__ = this,
		__own__ = __object__.hasOwnProperty;

	'use strict';

	var __private__ = {
		info: {
			title:   'Suitest',
			author:  'Alexander Guinnes',
			email:   '<monolithed@gmail.com>',
			version: '0.1.0',
			license: 'MIT',
			year:    2012
		},

		header: function() {
			var info = this.info;

			this.write
			(
				'\n', this.color('gray'), this.line, '\n ',

				// Title
				info.title,

				// Version
				' version: ', info.version,

				// Copyright
				'\n Copyright (c): ', info.author, ', ',

				// Author's e-mail
				info.email, ', ',

				// Release year
				info.year, '\n',

				this.line, this.color('reset')
			);
		},

		/**
		 * __private__.define
		 * It is used to add an own properties and set the descriptors:
		 * {
		 *    __config__urable: false,
		 *    enumerable: false,
		 *    writable: false
		 * }
		 * @param {Object} object
		 * @return {void}
		**/
		define: function(object)
		{
			var __set__ = function(name, value) {
				if (__define__)
					__define__(this, name, {
						value: value,
						writable: true
					});
				else
					this[name] = value;
			}

			for (var key in object) {
				if (__own__.call(object, key))
					__set__.call(this, key, object[key]);
			}
		},

		/**
		 * __private__.color
		 * Getting ASCII codes for coloring output text
		 * @param {String} color - color name
		 * @return {String} Unicode unit
		**/
		color: function(color)
		{
			if (__global__.toString() === '[object Window]')
				return '';

			return '\u001b[' + {
				red    : '31m',
				green  : '32m',
				yellow : '33m',
				blue   : '36m',
				gray   : '37m',
				reset  : '0m'
			}[color];
		},

		/**
		 * __private__.extend
		 * @param {Object} x
		 * @param {Object} y
		 * @return {void}
		**/
		extend: function(x, y) {
			for (var key in y)
				__own__.call(y, key) && (x[key] = y[key]);
		},

		/**
		 * __private__.init
		 * Holds the fist initialization status
		**/
		init: 0,

		/**
		 * __private__.is
		 * Determine the internal ECMAScript [[Class]] of an object.
		 * @param {Object} object
		 * @param {String} name
		 * @return {Boolean}
		**/
		is: function(object, name) {
			return __object__.toString.call(object) === '[object ' + name + ']';
		},

		/**
		 * __private__.line
		 * Dashed lines generator
		 * @return {void}
		**/
		line: Array(64).join('-'),

		/**
		 * __private__.time
		 * Getting total elapsed time
		 * @param {Array} array
		 * @return {Number} elapsed time in seconds
		**/
		time: function(array)
		{
			var result = 0,
			i = array.length >>> 0;

			while (i--)
				result += array[i];

			return result + 'ms';
		},

		/**
		 * __private__.write
		 * Output stream function
		 * @return {void}
		**/
		write: function()
		{
			/*
			* Object console is not part of ECMAScript standard,
			* so we'd check the one.
			* But there're some stupid problems in the engines:
			*
			* Object.prototype.toString.call(console):
			* [object Console] // Chrome
			* [object Object]  // NodeJS, Opera, IE
			*/
			var console = __global__.console;

			if (console && typeof console === 'object')
				console.log(Array.prototype.join.call(arguments, ''));
		}
	};

	/** @public */
	var __config__ = {
		indent: '     ', // Set indentation
		describe: 58,    // Max width for description section
		timeout:  25     // Timeout for the <time> callback
	};

	/**
	 * Object.is
	 * The internal comparison abstract operation SameValue(x, y),
	 * where x and y are ECMAScript language values, produces true or false (ECMAScript 5 9.12).
	 * @param {*} - first generic value for egal comparison
	 * @param {*} - second generic value for egal comparison
	 * @return {Boolean}
	 *
	 * @example:
	 *
	 * Object.is(0,-0)     // false
	 * Object.is('0', 0)   // false
	 * Object.is(0, 0)     // true
	 * Object.is(NaN, NaN) // true
	**/
	__private__.define.call(Object, {
		is: function(x, y)
		{
			// 0 === -0, NaN !== NaN, 0 = false, etc.
			if (x === y)
				return x !== 0 || 1 / x === 1 / y;

			// object !== object ([] !== [], {} !== {}, etc.)
			return x !== x && y !== y;
		}
	});

	/** @constructor */
	__global__.Suitest = function(name)
	{
		if (!(this instanceof Suitest))
			return new Suitest(name);

		/** @static */
		__private__.define.call(this, {
			/**
			 * Suitest.__log__
			 * Holds statistics
			**/
			__log__: {
				name:   name, // The module name
				data:   [],   // <exec> operands (x, y)
				info:   [],   // Result info
				time:   [],   // Elapsed time
				stack:  0,    // The Temporary property to get final callback
				total:  0,    // Total number of tests
				status: 0,    // The Temporary property to get a periodic test status
				failed: 0,    // Total number of failed tests
				passed: 0,    // Total number of passed tests
				params: 0,    // The <exec> parameters,
				context: {}   // <get> { test : context },
			}
		});
	};

	__private__.define.call(Suitest, {
		/**
		 * @static
		 * Suitest.config
		 * Register config
		**/
		config: function(object) {
			if (__private__.is(object, 'Object'))
				__private__.extend(__config__, object);
		}
	});

	__private__.define.call(Suitest.prototype, {
		/**
		 * Suitest.test
		 * Add a test to run
		 * @public
		 * @param {*} name - Test name
		 * @param {Function} callback
		 * @param {Object} context
		 * @return {Object} this
		 *
		 * @example:
		 * var unit = new Suitest;
		 *
		 * // test 1
		 * unit.test('test 1', function(unit) {
		 *    unit.exec(true, 1, '=='); // true
		 *    unit.done();
		 * });
		**/
		test: function(name, callback, context)
		{
			if (!name || !__private__.is(callback, 'Function'))
				throw new TypeError('Suitest.test ( name, callback, [, context ] );');

			// The callbacks will be set as properties for <test>
			var data = {
				name: name,
				done: this.done,
				exec: this.exec,
				stop: this.stop,
				get:  this.get,
				is:   this.is,
				describe: this.describe,
				__log__: this.__log__
			};

			// Set context
			this.__log__.context[name] = data;

			var apply = function()
			{
				// Set start time
				data.time = +new Date;
				callback.call(data || context, data);
			},

			timeout = __global__.setTimeout;

			// Apply callback
			if (__private__.is(timeout, 'Function'))
				timeout(apply, __config__.timeout);

			else apply();

			// Display headline
			if (__private__.init++ === 1)
				__private__.header();

			this.__log__.stack++;
			this.__log__.total++;

			return this;
		},

		/**
		 * Suitest.text
		 * Add test description
		 * @public
		 * @param {String} text - Test description
		 * @return {Object} this
		 *
		 * @example:
		 *
		 * unit.test('test 1', function(unit) {
		 *    unit.text('Compare two values');
		 *    unit.exec(true, 1);
		 *    unit.done();
		 * });
		**/
		describe: function(text) {
			this.__log__.text = text;
			return this;
		},

		/**
		 * Suitest.done
		 * Register a callback to fix test result
		 * @public
		 * @param {Function} [ callback ]
		 * @param {Object} [ context ]
		 * @return {Object} this
		 *
		 * @example:
		 * var unit = new Suitest;
		 *
		 * // test 1
		 * unit.test('test 1', function(unit) {
		 *    unit.exec(true, 1); // true
		 *    unit.done();
		 * });
		 *
		 * // test 2
		 * unit.test('test 2', function(unit) {
		 *    setTimeout(function() {
		 *        unit.exec(true, 1); // true
		 *        unit.done();
		 *    }, 2000);
		 * });
		**/
		done: function(callback, context)
		{
			// Elapsed time
			var time = +new Date - this.time,
				__log__ = this.__log__;

			var text = __log__.text || '',
				values = '';

			// Display the <text> section
			if (text)
				text = '\n' + __config__.indent + 'Description: ' + text;

			// Display the extended statistics if the <exec> passed more than two parameters
			if (__log__.params >= 2)
				values = '\n' + __config__.indent + 'Expected: ' + __log__.data[0] +
						 '\n' + __config__.indent + 'Actual:   ' + __log__.data[1];

			var status = __log__.status;

			// Periodic reports (body)
			__log__.info.push
			(
				// Test name
				'\n', __private__.color('blue'), '<', this.name, '>', __private__.color('reset'),

				// Test description
				text.replace(new RegExp('.{' + __config__.describe + '}', 'g'), '$&\n' + __config__.indent),

				// Extended statistics ( Expected | Actual )
				values,

				// Test status color
				'\n', __config__.indent, 'Status:   ', status == 'passed' ? __private__.color('green') :

				// Test status ( passed | failed )
				__private__.color('red'), status.toUpperCase(), __private__.color('reset'),

				// Elapsed time
				'\n', __config__.indent, 'Time:     ', time, 'ms\n'
			);

			// Keep timers
			__log__.time.push(time);

			// Total statistics by the module
			if (--__log__.stack === 0 || __log__.stop)
			{
				var total_time = __private__.time(__log__.time),
					passed = __log__.passed,
					failed = __log__.failed,
					total  = __log__.total;

				__log__.info.push
				(
					'\n', __private__.color('gray'), __private__.line, '\n',

					// Total number of tests
					' Total: ', total, ' tests, ',

					// Total number of passed tests
					passed, ' passed, ',

					// Total number of failed tests
					failed, ' failed, ',

					// Total time elapsed
					'time: ', total_time, '\n',

					// Line
					__private__.line, __private__.color('reset')
				);

				// Apply <finish> callback
				if (__private__.is(__log__.finish, 'Function'))
				{
					__log__.finish({
						total:  total,
						failed: failed,
						passed: passed,
						time:   total_time
					});

					__log__.finish = null;
				}

				// Add the module name
				__log__.info.unshift('\n[' + __log__.name + ']\n');

				// Show test result
				__private__.write.apply(null, __log__.info);
			}

			// Erase the <text> section
			__log__.text = '';

			// Set default values
			__log__.data = [];

			// The <done> callback
			if (__private__.is(callback, 'Function'))
			{
				callback.call(this || context, {
					status: status,
					time:   time
				});
			}

			// Stop all tests
			if (__log__.stop)
				throw new Error('Stopped test execution!');

			return this;
		},

		/**
		 * Suitest.exec
		 * A comparison assertion
		 * @public
		 * @param {*} x - First operand
		 * @param {*} y - Second operand
		 * @param {String} [ operator ] - Default operation is ==
		 * @return {Object} this
		 *
		 * @example:
		 * var unit = new Suitest;
		 *
		 * // test 1
		 * unit.test('test 1', function(unit) {
		 *    unit.exec(true, 1); // true
		 *    unit.done();
		 * });
		 *
		 * // test 2
		 * unit.test('test 2', function(unit) {
		 *    unit.exec(true, 1, '==='); // false
		 *    unit.done();
		 * });
		 *
		 * // test 3
		 * unit.test('test 3', function(unit) {
		 *    var compare = true == 1;
		 *    unit.exec(compare); // true
		 *    unit.done();
		 * });
		**/
		exec: function(x, y, operator)
		{
			var length = arguments.length,
				status = x;

			if (!length)
				throw new TypeError('Suitest.exec ( x, [, y, context ] );');

			// Apply operations to operands x, y
			if (length >= 2)
			{
				status = {
					'==' : x ==  y,
					'===': x === y,
					'!==': x !== y,
					'!=' : x !=  y,
					'<'  : x  <  y,
					'>'  : x  >  y,
					'<=' : x <=  y,
					'>=' : x >=  y,
					'eg' : Object.is(x, y) // Egal comparison
				}[operator || '=='];
			}

			status = status ? 'passed' : 'failed';

			var __log__ = this.__log__;

			// Set <exec> arguments length
			__log__.params = length;

			// Set test status
			__log__.status = status;

			// Counting status
			__log__[status]++;

			// Set <exec> values
			__log__.data = [x, y];

			return this;
		},

		/**
		 * Suitest.finish
		 * Register a final callback whenever all the tests have finished running
		 * @public
		 * @exports Suitest.finish as __private__.finish
		 * @param {Function} callback - Register for object properties:
		 *    total  - The total number of tests
		 *    filed  - The number of failures,
		 *    passed - The number of tests that passed assertions,
		 *    time   - The total time in milliseconds for all tests
		 *
		 * @return {Object} this
		 *
		 * @example:
		 *
		 * unit.test('test 1', function() {
		 *     this.exec(true).done();
		 * });
		 *
		 * unit.test('test 2', function(unit) {
		 *    this.exec(true).done();
		 * });
		 *
		 * unit.finish(function(data) {
		 *     console.log('Total:', total, 'Filed: ', filed, 'Passed: ', passed, 'Time: ', time);
		 * });
		 *
		 * // Total: 6, Filed: 2, Passed: 4, Time: 1.00
		 *
		**/
		finish: function(callback) {
			this.__log__.finish = callback;
			return this;
		},

		/**
		 * Suitest.get
		 * Register outline function callbacks
		 * @public
		 * @param {String} name
		 * @return {Object} { test : context }
		 *
		 * @example:
		 *
		 * // Simple using
		 * var set = function() {
		 *     return unit
		 *        .get('test')
		 *        .exec(true, 1)
		 *        .done();
		 * };
		 *
		 * unit.test('test', function(unit) {
		 *    set(); // true
		 * });
		 *
		 * // Using with asynchronous code
		 * var set = function() {
		 *     return unit
		 *        .get('test')
		 *        .exec(true, 1)
		 *        .done();
		 * };
		 *
		 * unit.test('test', function(unit) {
		 *    setTimeout(set, 2000); // true
		 * });
		**/
		get: function(name) {
			return this.__log__.context[name];
		},

		/**
		 * Suitest.is
		 * A boolean assertion
		 * @public
		 * @return {Boolean}
		 *
		 *  @example:
		 *
		 * // Simple using
		 * unit.test('test 1', function(unit) {
		 *    unit.exec(true, 1);
		 *    if (!unit.is())
		 *      unit.stop();
		 * });
		 *
		 * // Convenient using
		 * unit.test('test 2', function(unit) {
		 *    if (!unit.exec(true, 1).is())
		 *      unit.stop();
		 * });
		**/
		is: function() {
			return this.__log__.status == 'passed';
		},

		/**
		 * Suitest.stop
		 * Throws an exception when test run and stop all next tests
		 * @public
		 * @return {Object} this
		 *
		 *  @example:
		 *
		 * unit.test('test 1', function(unit) {
		 *    if (x > y)
		 *      unit.stop();
		 * });
		**/
		stop: function() {
			this.__log__.stop = true;
			return this;
		}
	});

	return Suitest;

}(Object.prototype, Object.defineProperty);

// server-side support
try { module.exports = Suitest; } catch(error) {}