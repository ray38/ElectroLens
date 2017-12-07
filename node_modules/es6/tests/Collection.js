require('../ES6.js');
require('./suitest.js');

/**
 * ------------------------------------------------------------
 * Map
 * ------------------------------------------------------------
**/

var map = new Map();

new Suitest('Map')

.test('Map.set: -0', function()
{
	map.set(-0, 0);

	this
		.exec(map.get(-0), -0)
		.done();
})

.test('Map.set: +0', function()
{
	map.set(+0,  1);

	this
		.exec(map.get(+0), 1)
		.done();
})

.test('Map.set: string', function()
{
	map.set('b', 2);

	this
		.describe("map.get('b'), 2")
		.exec(map.get('b'), 2)
		.done();
})

.test('Map.set: override key', function()
{
	map.set('a', 3);
	map.set('a', 4);

	this
		.describe("map.set('a', 4)")
		.exec(map.get('a'), 4)
		.done();
})

.test('Map.set: Array', function()
{
	map.set(Array, 5);

	this
		.describe("map.set(Array, 5)")
		.exec(map.get(Array), 5)
		.done();
})

.test('Map.set: []', function()
{
	map.set([], 6);

	this
		.describe("map.get([]), undefined")
		.exec(map.get([]), undefined)
		.done();
})

.test('Map.set: NaN', function()
{
	map.set(NaN, 7);

	this
		.describe("map.set(NaN, 7)")
		.exec(map.get(NaN), 7)
		.done();
})

.test('Map.set: function', function()
{
	map.set(function() {}, 8);

	this
		.describe("map.set(function() {}, 8)")
		.exec(map.get(function() {}), undefined)
		.done();
})

.test('Map.set: .delete()', function()
{
	map.delete('a');

	this
		.describe("map.delete('a')")
		.exec(map.get('a'), undefined)
		.done();
})

.test('Map.set: .has()', function()
{
	map.has(-0);

	this
		.describe("map.has(-0)")
		.exec(map.has(-0))
		.done();
})

.test('Map.set: .size()', function()
{
	map.size();

	this
		.exec(map.size(), 7)
		.done();
})


.test('Map.set: __iterator__', function()
{
	var count = 0;

	map.__iterator__(function(key, value) {
		count++;
	});

	this
		.describe("map.size()")
		.exec(map.size(), count)
		.done();
})


.test('Map.set: .clear()', function()
{
	map.clear();

	this
		.exec(map.size(), 0)
		.done();
})


/**
 * ------------------------------------------------------------
 * Set
 * ------------------------------------------------------------
**/
var set = new Set();

new Suitest('Set')

.test('Map.set: -0', function()
{
	set.add(-0);

	this
		.describe("map.add(-0)")
		.exec(set.has(-0))
		.done();
})

.test('Map.set: +0', function()
{
	set.add(+0);

	this
		.describe("map.add(+0)")
		.exec(set.has(+0))
		.done();
})


.test('Map.set: string', function()
{
	set.add('a');

	this
		.describe("map.add('a')")
		.exec(set.has('a'))
		.done();
})

.test('Map.set: Array', function()
{
	set.add(Array);

	this
		.describe("map.add(Array)")
		.exec(set.has(Array))
		.done();
})

.test('Map.set: []', function()
{
	set.add([]);

	this
		.describe("map.add([])")
		.exec(!set.has([]))
		.done();
})

.test('Map.set: NaN', function()
{
	set.add(NaN);

	this
		.describe("map.add(NaN)")
		.exec(set.has(NaN))
		.done();
})

.test('Map.set: function', function()
{
	set.add(function() {});

	this
		.describe("map.add(function() {})")
		.exec(!set.has(function() {}))
		.done();
})

.test('Map.set: .delete()', function()
{
	set.delete(-0);

	this
		.describe("map.delete(-0)")
		.exec(!set.has(-0))
		.done();
})

.test('Map.set: .size()', function()
{
	set.size();

	this
		.describe("map.size()")
		.exec(set.size(), 6)
		.done();
})

.test('Map.set: __iterator__', function()
{
	var count = 0;

	set.__iterator__(function(value) {
		count++;
	});

	this
		.describe("set.size()")
		.exec(set.size(), count)
		.done();
})
