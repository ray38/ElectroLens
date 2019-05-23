// -*- coding: utf-8; indent-tabs-mode: nil; tab-width: 4; c-basic-offset: 4; -*-

require('../proposal.js');
require('./suitest.js');

/**
 * ------------------------------------------------------------
 * Object
 * ------------------------------------------------------------
**/

void function(__is__, object)
{
	/*
	 Object.getOwnPropertyDescriptors
	*/

	Object.defineProperty(object, 'a', {
		value: 0,
		configurable: false,
		enumerable:   false,
		writable:     false
	});

	Object.defineProperty(object, 'b', {
		value: 1,
		configurable: true,
		enumerable:   true,
		writable:     true
	});

	new Suitest('Object.getOwnPropertyDescriptors')

	.test('Object.getOwnPropertyDescriptors: returns Object', function()
	{
		this
			.describe("type of Object.getOwnPropertyDescriptors({}) is '[object Object]'")
			.exec(__is__.call(Object.getOwnPropertyDescriptors({})), '[object Object]')
			.done();
	})

	.test('Object.getOwnPropertyDescriptors: check the object keys', function()
	{
		this
			.describe("Object.keys(Object.getOwnPropertyDescriptors({ a:1, b:1 })) is 'b,a'")
			.exec(Object.keys(Object.getOwnPropertyDescriptors(object)).toString().replace(/\s/g, ''), 'b,a')
			.done();
	})

	.test('Object.getOwnPropertyDescriptors: get a property descriptor values of the specified object', function()
	{
		var value_1 = [],
			value_2 = [];

		Object.getOwnPropertyNames(object).forEach(function(key)
		{
			Object.keys(Object.getOwnPropertyDescriptor(object, key)).forEach(function(descriptor)
			{
				value_1.push(Object.getOwnPropertyDescriptor(object, key)[descriptor]);
				value_2.push(Object.getOwnPropertyDescriptors(object)[key][descriptor]);
			});
		});

		this
			.describe("Object.getOwnPropertyDescriptor(object, key)[descriptor] is Object.getOwnPropertyDescriptors(object)[key][descriptor]")
			.exec(value_1.toString(), value_2.toString())
			.done();
	});

	/*
	 Object.getPropertyNames
	*/

	new Suitest('Object.getPropertyNames')

	.test('Object.getPropertyNames: returns Object', function()
	{
		this
			.describe("type of Object.getPropertyNames({}) is '[object Array]'")
			.exec(__is__.call(Object.getPropertyNames({})), '[object Array]')
			.done();
	})

	.test('Object.getPropertyNames: get all the names of the properties', function()
	{
		this
			.describe('Object.getPropertyNames(object) in object')
			.exec(Object.getPropertyNames(object).every(function(a) {
				return a in object;
			}))
			.done();
	});

	/*
	 Object.isnt
	*/

	new Suitest('Object.isnt')

	.test('Object.isnt: negative zero', function()
	{
		this
			.describe('0 is not -0')
			.exec(Object.isnt(0, -0))
			.done();
	})

	.test('Object.isnt: numbers and strings', function()
	{
		this
			.describe('"0" is not 0')
			.exec(Object.isnt('0', 0))
			.done();
	})

	.test('Object.isnt: equivalent numbers', function()
	{
		this
			.describe('0 is 0')
			.exec(!Object.isnt(0, 0))
			.done();
	})

	.test('Object.isnt: NaN', function()
	{
		this
			.describe('NaN is NaN')
			.exec(!Object.isnt(NaN, NaN))
			.done();
	});

}(Object.prototype.toString, {});
