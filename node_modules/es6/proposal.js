// -*- coding: utf-8; indent-tabs-mode: nil; tab-width: 4; c-basic-offset: 4; -*-

/**
 * Implementation of ECMAScript 6 (Draft)
 * @requires: ECMAScript 5
 * @author: Alexander Guinness <monolithed@gmail.com>
 * @version:  0.0.1
 * @license:  MIT
 * @date:     Thu Nov 1 00:08:00 2011
 **/


void function(__object__, __array__, __global__)
{
	'use strict';

	var define = function(name)
	{
		var __own__ = __object__.hasOwnProperty;

		if (__own__.call(this, name))
			return 0;

		var set = function(name, value, descriptor)
		{
			Object.defineProperty(this, name, descriptor || {
				value: value,
				configurable: true,
				enumerable:   false,
				writable:     true
			});
		};

		if (__object__.toString.call(name) === '[object Object]')
		{
			for (var key in name) {
				if (__own__.call(name, key))
					set.call(this, key, name[key]);
			}
		}
		else
			set.apply(this, arguments);
	};

	/*
	 * ------------------------------------------------------------
	 *  Object
	 * ------------------------------------------------------------
	 */


	/**
	 * Object.getOwnPropertyDescriptors
	 * @edition proposal
	 *
	 * Returns a property descriptor of the specified object, including object’s prototype chain
	 * @param {Object} object
	 * Object.getOwnPropertyDescriptor, Array.prototype.forEach
	 * @throws {TypeError}
	 * @return {Object}
	 *
	 * @example:
	 *
	 * var object = {};
	 *
	 * Object.defineProperty(object, 'a', {
	 *   value: 1,
	 *   configurable: false,
	 *   enumerable:   false,
	 *   writable:     false
	 * });
	 *
	 * Object.defineProperty(object, 'b', {
	 *   value:2,
	 *   configurable: true,
	 *   enumerable:   true,
	 *   writable:     true
	 * });
	 *
	 * Object.getOwnPropertyDescriptors(object);
	 *
	 * a: {
	 *   value: 1,
	 *   configurable: false,
	 *   enumerable:   false,
	 *   writable:     false
	 * },
	 *
	 * b: {
	 *   value: 2,
	 *   configurable: true,
	 *   enumerable:   true,
	 *   writable:     true
	 * }
	**/
	define.call(Object, 'getOwnPropertyDescriptors', function(object)
	{
		if (__object__.toString.call(object) !== '[object Object]')
			throw new TypeError('Object.getOwnPropertyDescriptors: ' + object + ' is not an Object!');

		var descriptors = {};

		__array__.forEach.call(Object.getOwnPropertyNames(object), function (property)
		{
			Object.defineProperty(descriptors, property, {
				value: Object.getOwnPropertyDescriptor(object, property),
				configurable: false,
				enumerable:   true,
				writable:     false
			});
		});

		return descriptors;
	});


	/**
	 * Object.getPropertyDescriptor
	 * @edition proposal
	 *
	 * Returns a property descriptor of the specified object, including object’s prototype chain
	 * @param {Object} object
	 * @param {String} name - The name of the property
	 * @throws {TypeError}
	 * @return {Object}
	 *
	 * @example:
	 *
	 * Object.getPropertyDescriptor({}, 'toString');
	 *
	 * {
	 *    value: [Function: toString],
	 *    writable: true,
	 *    enumerable: false,
	 *    configurable: true
	 * }
	**/
	define.call(Object, 'getPropertyDescriptor', function(object, name)
	{
		if (__object__.toString.call(object) !== '[object Object]')
			throw new TypeError('Object.getPropertyDescriptor: ' + object + ' is not an Object!');

		var descriptor = Object.getOwnPropertyDescriptor(object, name),
		__proto__ = Object.getPrototypeOf(object);

		while (descriptor === undefined && __proto__ !== null) {
			descriptor = Object.getOwnPropertyDescriptor(__proto__, name);
			__proto__ = Object.getPrototypeOf(__proto__);
		}

		return descriptor;
	});

	/**
	 * Object.getPropertyNames
	 * Returns an array of all the names of the properties
	 * @param {Object} object
	 * @throws {TypeError}
	 * @edition proposal
	 * @return {Array}
	 *
	 * @example:
	 *
	 * Object.getPropertyNames({});
	 *
	 * [
	 *  'toString',
	 *  'toLocaleString',
	 *  'hasOwnProperty',
	 *  'valueOf',
	 *  'constructor',
	 *  'propertyIsEnumerable',
	 *  'isPrototypeOf',
	 *  ]
	**/
	define.call(Object, 'getPropertyNames', function(object)
	{
		if (__object__.toString.call(object) !== '[object Object]')
			throw new TypeError('Object.getPropertyNames: ' + object + ' is not an Object!');

		var properies = Object.getOwnPropertyNames(object),
			__proto__ = Object.getPrototypeOf(object);

		while (__proto__ !== null)
		{
			__array__.forEach.call(Object.getOwnPropertyNames(__proto__), function(property) {
				if (properies.indexOf(property) === -1)
					properies.push(property);
			});

			__proto__ = Object.getPrototypeOf(__proto__);
		}

		return properies;
	});

	/**
	 * Object.isnt
	 * Opposed to the Object.isnt
	 * @param {*} - first generic value for egal comparison
	 * @param {*} - second generic value for egal comparison
	 * @requires Object.is
	 * @return {Boolean}
	 *
	 * @example:
	 *
	 * Object.isnt(0, 0) // false
	**/
	define.call(Object, 'isnt', function(x, y) {
		return !Object.is(x, y);
	});

}
(Object.prototype, Array.prototype, function() {
	return this;
}());
