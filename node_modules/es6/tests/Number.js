require('../ES6.js');
require('./suitest.js');

/**
 * ------------------------------------------------------------
 * Number
 * ------------------------------------------------------------
**/

/*
 Number.EPSILON
*/

new Suitest('Number.EPSILON')

.test('Number.EPSILON', function()
{
	this
		.exec(Number.EPSILON, 2.220446049250313e-16)
		.done();
});

/*
 Number.MAX_INTEGER
*/
new Suitest('Number.MAX_INTEGER')

.test('Number.EPSILON', function()
{
	this
		.exec(Number.MAX_INTEGER, 9007199254740991)
		.done();
});

/*
 Number.parseInt
*/

new Suitest('Number.parseInt')

.test('Number.parseInt: E+2*', function()
{
	this
		.describe("Number.parseInt(1000000000000000000000) is 1e+21")
		.exec(1000000000000000000000, 1e+21)
		.done();
})

.test('Number.parseInt: 32 radix', function()
{
	this
		.describe("Number.parseInt((10).toString(32), 32) is 10")
		.exec(Number.parseInt((10).toString(32), 32), 10)
		.done();
})

.test('Number.parseInt: 16 radix', function()
{
	this
		.describe("Number.parseInt((10).toString(16), 16) is 10")
		.exec(Number.parseInt((10).toString(16), 16), 10)
		.done();
})

.test('Number.parseInt: 10', function()
{
	this
		.describe("Number.parseInt(10) is 10")
		.exec(Number.parseInt(10), 10)
		.done();
})

.test('Number.parseInt: 8 radix', function()
{
	this
		.describe("Number.parseInt((10).toString(8), 8) is 10")
		.exec(Number.parseInt((10).toString(8), 8), 10)
		.done();
})

.test('Number.parseInt: 2 radix', function()
{
	this
		.describe("Number.parseInt((10).toString(2) is 10")
		.exec(Number.parseInt((10).toString(2), 2), 10)
		.done();
})

.test('Number.parseInt: int', function()
{
	this
		.describe("Number.parseInt('10px') is 10")
		.exec(Number.parseInt('10px'), 10)
		.done();
})

.test('Number.parseInt: float', function()
{
	this
		.describe("Number.parseInt(10.1) is 10")
		.exec(Number.parseInt(10.1), 10)
		.done();
})

.test('Number.parseInt: E+', function()
{
	this
		.describe("Number.parseInt(0.100E+2) is 10")
		.exec(Number.parseInt(0.100E+2), 10)
		.done();
})

.test('Number.parseInt: E-', function()
{
	this
		.describe("Number.parseInt(10.1) is 10")
		.exec(Number.parseInt(1000E-2), 10)
		.done();
})

.test('Number.parseInt: NaN', function()
{
	this
		.describe("Number.parseInt('i10') is NaN")
		.exec(Number.parseInt('i10'), NaN, 'eg')
		.done();
});

/*
 Number.parseFloat
*/

new Suitest('Number.parseFloat')

.test('Number.parseInt: E+2*', function()
{
	this
		.describe("Number.parseFloat(1000000000000000000000) is 1e+21")
		.exec(1000000000000000000000, 1e+21)
		.done();
})

.test('Number.parseFloat: 10', function()
{
	this
		.describe("Number.parseFloat(10) is 10")
		.exec(Number.parseFloat(10), 10)
		.done();
})

.test('Number.parseFloat: int', function()
{
	this
		.describe("Number.parseFloat('10px') is 10")
		.exec(Number.parseFloat('10px'), 10)
		.done();
})

.test('Number.parseFloat: float', function()
{
	this
		.describe("Number.parseFloat(10.1) is 10")
		.exec(Number.parseFloat(10.1), 10.1)
		.done();
})

.test('Number.parseInt: E+', function()
{
	this
		.describe("Number.parseFloat(0.100E+2) is 10")
		.exec(Number.parseInt(0.100E+2), 10)
		.done();
})

.test('Number.parseFloat: E-', function()
{
	this
		.describe("Number.parseFloat(10.1) is 10")
		.exec(Number.parseFloat(1000E-2), 10)
		.done();
});

/*
 Number.isNaN
*/

new Suitest('Number.isNaN')

.test('Number.isNaN: int', function()
{
	this
		.describe("Number.isNaN(10) is not a number")
		.exec(!Number.isNaN(10))
		.done();
})

.test('Number.isNaN: NaN', function()
{
	this
		.describe("Number.isNaN(NaN) is a number")
		.exec(Number.isNaN(NaN))
		.done();
})

.test('Number.isNaN: []', function()
{
	this
		.describe("Number.isNaN([]) is a number")
		.exec(!Number.isNaN([]))
		.done();
});

/*
 Number.isFinite
*/

new Suitest('Number.isFinite')

.test('Number.isFinite: int', function()
{
	this
		.describe("Number.isFinite(10) is a finite number")
		.exec(Number.isFinite(10))
		.done();
})

.test('Number.isFinite: float', function()
{
	this
		.describe("Number.isFinite(10.1) is a finite number")
		.exec(Number.isFinite(10.1))
		.done();
})

.test('Number.isFinite: string', function()
{
	this
		.describe("Number.isFinite('10') is not a finite number")
		.exec(!Number.isFinite('10'))
		.done();
})

.test('Number.isFinite: NaN', function()
{
	this
		.describe("Number.isFinite(+Infinity) is not a finite number")
		.exec(!Number.isFinite(+Infinity))
		.done();
})

.test('Number.isFinite: -Infinity', function()
{
	this
		.describe("Number.isFinite(-Infinity) is not a finite number")
		.exec(!Number.isFinite(-Infinity))
		.done();
})

.test('Number.isFinite: NaN', function()
{
	this
		.describe("Number.isFinite(NaN) is not a finite number")
		.exec(!Number.isFinite(NaN))
		.done();
})

/*
 Number.isInteger
*/

new Suitest('Number.isInteger')

.test('Number.isInteger: int', function()
{
	this
		.describe("Number.isInteger(10) is integer")
		.exec(Number.isInteger(10))
		.done();
})

.test('Number.isInteger: float', function()
{
	this
		.describe("Number.isInteger(10.1) is integer")
		.exec(Number.isFinite(10.1))
		.done();
})

.test('Number.isInteger: string', function()
{
	this
		.describe("Number.isInteger('10') is not integer")
		.exec(!Number.isInteger('10'))
		.done();
})

.test('Number.isInteger: NaN', function()
{
	this
		.describe("Number.isInteger(NaN) is not integer")
		.exec(!Number.isInteger(NaN))
		.done();
})

.test('Number.isInteger: {}', function()
{
	this
		.describe("Number.isInteger({}) is not integer")
		.exec(!Number.isInteger({}))
		.done();
});

/*
 Number.toInteger
*/

new Suitest('Number.toInteger')

.test('Number.toInteger: int', function()
{
	this
		.describe("Number.toInteger(10) is 10")
		.exec(Number.toInteger(10))
		.done();
})

.test('Number.toInteger: float', function()
{
	this
		.describe("Number.toInteger(10.1) is 10.1")
		.exec(Number.toInteger(10.1))
		.done();
})

.test('Number.toInteger: string', function()
{
	this
		.describe("Number.toInteger('10') is 10")
		.exec(Number.toInteger('10'))
		.done();
})

.test('Number.toInteger: NaN', function()
{
	this
		.describe("Number.toInteger(NaN) is 0")
		.exec(Number.toInteger(NaN), 0)
		.done();
})

.test('Number.toInteger: undefined', function()
{
	this
		.describe("Number.toInteger(undefined) is 0")
		.exec(Number.toInteger(undefined), 0)
		.done();
})

.test('Number.toInteger: null', function()
{
	this
		.describe("Number.toInteger(null) is 0")
		.exec(Number.toInteger(null), 0)
		.done();
})

.test('Number.toInteger: {}', function()
{
	this
		.describe("Number.toInteger({}) is 0")
		.exec(Number.toInteger({}), 0)
		.done();
})

.test('Number.toInteger: function', function()
{
	this
		.describe("Number.toInteger({}) is 0")
		.exec(Number.toInteger(function(){}), 0)
		.done();
})

.test('Number.toInteger: +0', function()
{
	this
		.describe("Number.toInteger(+0) is int")
		.exec(Number.toInteger(0), 0)
		.done();
})

.test('Number.toInteger: -0', function()
{
	this
		.describe("Number.toInteger(-0) is int")
		.exec(Number.toInteger(-0), -0)
		.done();
})

.test('Number.toInteger: -Infinity', function()
{
	this
		.describe("Number.toInteger(+Infinity) is int")
		.exec(Number.toInteger(+Infinity), +Infinity)
		.done();
})

.test('Number.toInteger: -Infinity', function()
{
	this
		.describe("Number.toInteger(-Infinity) is int")
		.exec(Number.toInteger(-Infinity), -Infinity)
		.done();
});

/*
 Number.prototype.clz
*/

new Suitest('Number.prototype.clz')

.test('Number.prototype.clz: +int', function()
{
	this
		.describe("000010000000.clz() is 10")
		.exec(000010000000.clz(), 10)
		.done();
})

.test('Number.prototype.clz: -int', function()
{
	this
		.describe("-000010000000.clz() is -10")
		.exec(-000010000000.clz(), -10)
		.done();
})

.test('Number.prototype.clz: +float', function()
{
	this
		.describe("0.1.clz() is 31")
		.exec(0.1.clz(), 31)
		.done();
})

.test('Number.prototype.clz: -float', function()
{
	this
		.describe("0.1.clz() is 31")
		.exec(-0.1.clz(), -31)
		.done();
});