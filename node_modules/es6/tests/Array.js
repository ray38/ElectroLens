require('../ES6.js');
require('./suitest.js');

/**
 * ------------------------------------------------------------
 * Array
 * ------------------------------------------------------------
**/

void function(__is__)
{
	/*
	 Array.of
	*/

	var isEmptyArray = function(array) {
		return Object.prototype.toString.call(array) == '[object Array]' && !array.length;
	};

	new Suitest('Array.of')

	.test('Array.of: returns Array', function()
	{
		this
			.describe("type of Array.of(0, 1) is '[object Array]'")
			.exec(__is__.call(Array.of(0, 1)), '[object Array]')
			.done();
	})

	.test('Array.of: converting a variable number of argument to array', function()
	{
		this
			.describe("Array.of(0, 1) are equal [0, 1]'")
			.exec((Array.of(0, 1).toString()), [0, 1].toString()).done();
	});

	/*
	 Array.from
	*/

	new Suitest('Array.from')

	.test('Array.from: returns Array', function()
	{
		this
			.describe("type of Array.from('01') is [object Array]'")
			.exec(__is__.call(Array.from('01')), '[object Array]').done();
	})

	.test('Array.from: converting a string to array', function()
	{
		this
			.describe("Array.from('01') is [0, 1]'")
			.exec(Array.from('01').toString(), [0, 1].toString()).done();
	})

	.test('Array.from: array from arguments', function()
	{
		this
			.describe("Array.from(arguments) converted to [0, 1]")
			.exec(function() {
				return Array.from(arguments);
		}(0, 1), [0, 1].toString()).done();
	})

	.test('Array.from: [ callback [ value ] ]', function()
	{
		this
			.exec(Array.from('12', function(value) {
				return value;
			}), '1,2').done();
	})

	.test('Array.from: [ callback [ index ] ]', function()
	{
		this
			.exec(Array.from('12', function(value, index) {
				return index;
			}), '0,1').done();
	})

	.test('Array.from: [ callback [ object ] ]', function()
	{
		this
			.exec(Array.from('12', function(value, index, object) {
				return object;
			}), '12,12').done();
	})

	.test('Array.from: [ callback [ value, index ] ]', function()
	{
		this
			.exec(Array.from('12', function(value, index) {
				return value + index;
			}), '10,21').done();
	})

	.test('Array.from: [ callback [ value, index, object ] ]', function()
	{
		this
			.exec(Array.from('12', function(value, index, object) {
				return value + index + object;
			}), '1012,2112').done();
	})

	.test('Array.from: [callback, context ]', function()
	{
		var object = {0: 1, 1: 2};

		this
			.exec(Array.from('01', function(value) {
				return this[value];
			}, object), '1,2').done();
	})

	.test('Array.from: [callback, context ]', function()
	{
		var object = {0: 1, 1: 2};

		this
			.exec(Array.from('01', function(value) {
				return this[value];
			}, object), '1,2').done();
	})

	.test('Array.from: empty string value', function()
	{
		this
			.exec(isEmptyArray(Array.from(''))).done();
	})

	.test('Array.from: Boolean', function()
	{
		this
			.exec(isEmptyArray(Array.from(true))).done();
	})

	.test('Array.from: Object', function()
	{
		this
			.exec(isEmptyArray(Array.from({}))).done();
	})

	.test('Array.from: Array-like object', function()
	{
		this
			.exec(Array.from({0: 1, 1: 2, length: 2}).toString(), '1,2').done();
	})

}(Object.prototype.toString);
