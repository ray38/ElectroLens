require('../ES6.js');
require('./suitest.js');

/**
 * ------------------------------------------------------------
 * String
 * ------------------------------------------------------------
**/

/*
 String.fromCodePoint
*/

new Suitest('String.fromCodePoint')

.test('String.fromCodePoint: 0x', function()
{
	this
		.describe("0x21 is '!'")
		.exec(String.fromCodePoint(0x21), '!')
		.done();
})

.test('String.fromCodePoint: unicode values', function()
{
	this
		.describe("107 is 'k'")
		.exec(String.fromCodePoint(107), 'k')
		.done();
})

.test('String.fromCodePoint: 0', function()
{
	this
		.describe("0 is empty string")
		.exec(String.fromCodePoint(0), String.fromCharCode(0))
		.done();
});

/*
 String.codePointAt
*/

new Suitest('codePointAt')

.test('String.codePointAt', function()
{
	this
		.describe("'A'.codePointAt(0) is 65")
		.exec('A'.codePointAt(0), 65)
		.done();
})

.test('String.codePointAt', function()
{
	this
		.describe("String.fromCodePoint(65).codePointAt(0) is 'A'.codePointAt(0)")
		.exec(String.fromCodePoint(65).codePointAt(0), 'A'.codePointAt(0))
		.done();
});

/*
 String.prototype.repeat
*/

new Suitest('String.prototype.repeat')

.test('String.prototype.repeat', function()
{
	this
		.describe("'A'.repeat(2) is 'AA'")
		.exec('A'.repeat(2), 'AA')
		.done();
});

/*
 String.prototype.startsWith
*/

new Suitest('String.prototype.startsWith')

.test('String.prototype.startsWith', function()
{
	this
		.describe("'Hello'.startsWith('He') is true")
		.exec('Hello'.startsWith('He'))
		.done();
})

.test('String.prototype.startsWith', function()
{
	this
		.describe("'Hello'.startsWith('HE') is false")
		.exec(!'Hello'.startsWith('HE'))
		.done();
});

/*
 String.prototype.endsWith
*/

new Suitest('String.prototype.endsWith')

.test('String.prototype.endsWith', function()
{
	this
		.describe("'Hello'.endsWith('lo') is true")
		.exec('Hello'.endsWith('lo'))
		.done();
})

.test('String.prototype.endsWith', function()
{
	this
		.describe("'Hello'.endsWith('Lo') is false")
		.exec(!'Hello'.endsWith('Lo'))
		.done();
});

/*
 String.prototype.contains
*/

new Suitest('String.prototype.contains')

.test('String.prototype.contains', function()
{
	this
		.describe("'Hello'.contains('He') is true")
		.exec('Hello'.contains('He'))
		.done();
})

.test('String.prototype.contains', function()
{
	this
		.describe("'Hello'.contains('HE') is false")
		.exec(!'Hello'.contains('HE'))
		.done();
});

/*
 String.prototype.toArray
*/

new Suitest('String.prototype.toArray')

.test('String.prototype.toArray: returns array', function()
{
	this
		.describe("'type of Hello'.toArray() is [object Array]")
		.exec(Object.prototype.toString.call('Hello'.toArray()), '[object Array]')
		.done();
})

.test('String.prototype.toArray', function()
{
	this
		.describe("'Hello'.toArray() is ['H', 'e', 'l', 'l', 'o']")
		.exec('Hello'.toArray().toString(), ['H', 'e', 'l', 'l', 'o'].toString())
		.done();
});

