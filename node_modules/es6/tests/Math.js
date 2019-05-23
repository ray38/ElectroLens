require('../ES6.js');
require('./suitest.js');

/**
 * ------------------------------------------------------------
 * Math
 * ------------------------------------------------------------
**/

/*
 Math.log10
*/

new Suitest('Math.log10')

.test('Math.log10: > 0', function()
{
	this
		.exec(Math.ceil(Math.log10(10)), 1)
		.done();
})

.test('Math.log10: < 0', function()
{
	this
		.exec(Math.log10(-10), NaN, 'eg')
		.done();
})

.test('Math.log10: NaN', function()
{
	this
		.exec(Math.log10(NaN), NaN, 'eg')
		.done();
})

.test('Math.log10: +0', function()
{
	this
		.exec(Math.log10(0), -Infinity)
		.done();
})

.test('Math.log10: -0', function()
{
	this
		.exec(Math.log10(-0), -Infinity)
		.done();
})

.test('Math.log10: 1', function()
{
	this
		.exec(Math.log10(1), 0)
		.done();
})

.test('Math.log10: +Infinity', function()
{
	this
		.exec(Math.log10(Infinity), Infinity)
		.done();
});

/*
 Math.log2
*/

new Suitest('Math.log2')

.test('Math.log2: > 0', function()
{
	this
		.exec(Math.ceil(Math.log2(10)), 4)
		.done();
})

.test('Math.log2: < 0', function()
{
	this
		.exec(Math.log2(-10), NaN, 'eg')
		.done();
})

.test('Math.log2: NaN', function()
{
	this
		.exec(Math.log2(NaN), NaN, 'eg')
		.done();
})

.test('Math.log2: +0', function()
{
	this
		.exec(Math.log2(0), -Infinity)
		.done();
})

.test('Math.log2: -0', function()
{
	this
		.exec(Math.log2(-0), -Infinity)
		.done();
})

.test('Math.log2: 1', function()
{
	this
		.exec(Math.log2(1), 0)
		.done();
})

.test('Math.log2: +Infinity', function()
{
	this
		.exec(Math.log2(Infinity), Infinity)
		.done();
});

/*
 Math.log1p
*/

new Suitest('Math.log1p')

.test('Math.log1p: > 0', function()
{
	this
		.exec(Math.ceil(Math.log1p(10)), 3)
		.done();
})

.test('Math.log1p: < -1', function()
{
	this
		.exec(Math.log1p(-10), NaN, 'eg')
		.done();
})

.test('Math.log1p: NaN', function()
{
	this
		.exec(Math.log1p(NaN), NaN, 'eg')
		.done();
})

.test('Math.log1p: +0', function()
{
	this
		.exec(Math.log1p(0), 0, 'eg')
		.done();
})

.test('Math.log1p: -0', function()
{
	this
		.exec(Math.log1p(-0), -0, 'eg')
		.done();
})

.test('Math.log1p: +Infinity', function()
{
	this
		.exec(Math.log1p(Infinity), Infinity)
		.done();
});

/*
 Math.expm1
*/

new Suitest('Math.expm1')

.test('Math.expm1: NaN', function()
{
	this
		.exec(Math.expm1(NaN), NaN, 'eg')
		.done();
})

.test('Math.expm1: +0', function()
{
	this
		.exec(Math.expm1(0), 0, 'eg')
		.done();
})

.test('Math.expm1: -0', function()
{
	this
		.exec(Math.expm1(-0), -0, 'eg')
		.done();
})

.test('Math.expm1: +Infinity', function()
{
	this
		.exec(Math.expm1(Infinity), Infinity)
		.done();
})

.test('Math.expm1: -Infinity', function()
{
	this
		.exec(Math.expm1(-Infinity), -1)
		.done();
});

/*
 Math.cosh
*/

new Suitest('Math.cosh')

.test('Math.cosh: NaN', function()
{
	this
		.exec(Math.cosh(NaN), NaN, 'eg')
		.done();
})

.test('Math.cosh: +0', function()
{
	this
		.exec(Math.expm1(0), 0, 'eg')
		.done();
})

.test('Math.cosh: -0', function()
{
	this
		.exec(Math.cosh(-0), -0, 'eg')
		.done();
})

.test('Math.cosh: +Infinity', function()
{
	this
		.exec(Math.cosh(Infinity), Infinity)
		.done();
})

.test('Math.cosh: -Infinity', function()
{
	this
		.exec(Math.cosh(-Infinity), -Infinity)
		.done();
});

/*
 Math.sinh
*/

new Suitest('Math.sinh')

.test('Math.sinh: NaN', function()
{
	this
		.exec(Math.sinh(NaN), NaN, 'eg')
		.done();
})

.test('Math.sinh: +0', function()
{
	this
		.exec(Math.sinh(0), 0, 'eg')
		.done();
})

.test('Math.sinh: -0', function()
{
	this
		.exec(Math.sinh(-0), -0, 'eg')
		.done();
})

.test('Math.sinh: +Infinity', function()
{
	this
		.exec(Math.sinh(Infinity), Infinity)
		.done();
})

.test('Math.sinh: -Infinity', function()
{
	this
		.exec(Math.sinh(-Infinity), -Infinity)
		.done();
});

/*
 Math.tanh
*/

new Suitest('Math.tanh')

.test('Math.tanh: NaN', function()
{
	this
		.exec(Math.tanh(NaN), NaN, 'eg')
		.done();
})

.test('Math.tanh: +0', function()
{
	this
		.exec(Math.tanh(0), 0, 'eg')
		.done();
})

.test('Math.tanh: -0', function()
{
	this
		.exec(Math.tanh(-0), -0, 'eg')
		.done();
})

.test('Math.tanh: +Infinity', function()
{
	this
		.exec(Math.tanh(+Infinity), 1, 'eg')
		.done();
})

.test('Math.tanh: -Infinity', function()
{
	this
		.exec(Math.tanh(-Infinity), -1, 'eg')
		.done();
})

.test('Math.tanh: > 0', function()
{
	this
		.exec(Math.ceil(Math.tanh(10)), 1)
		.done();
})

.test('Math.tanh: < 0', function()
{
	this
		.exec(Math.ceil(Math.tanh(-10)), 0)
		.done();
});

/*
 Math.acosh
*/

new Suitest('Math.acosh')

.test('Math.acosh: NaN', function()
{
	this
		.exec(Math.acosh(NaN), NaN, 'eg')
		.done();
})

.test('Math.acosh: < 1', function()
{
	this
		.exec(Math.acosh(0), NaN, 'eg')
		.done();
})

.test('Math.tanh: 1', function()
{
	this
		.exec(Math.acosh(1), +0, 'eg')
		.done();
})

.test('Math.acosh: +Infinity', function()
{
	this
		.exec(Math.acosh(+Infinity), +Infinity, 'eg')
		.done();
})

.test('Math.acosh: > 0', function()
{
	this
		.exec(Math.ceil(Math.acosh(10)), 3)
		.done();
});

/*
 Math.asinh
*/

new Suitest('Math.asinh')

.test('Math.asinh: NaN', function()
{
	this
		.exec(Math.asinh(NaN), NaN, 'eg')
		.done();
})

.test('Math.asinh: +0', function()
{
	this
		.exec(Math.asinh(0), 0, 'eg')
		.done();
})

.test('Math.asinh: -0', function()
{
	this
		.exec(Math.asinh(-0), -0, 'eg')
		.done();
})

.test('Math.asinh: +Infinity', function()
{
	this
		.exec(Math.asinh(+Infinity), +Infinity, 'eg')
		.done();
})

.test('Math.asinh: -Infinity', function()
{
	this
		.exec(Math.asinh(-Infinity), -Infinity, 'eg')
		.done();
})

.test('Math.asinh: > 0', function()
{
	this
		.exec(Math.ceil(Math.asinh(10)), 3)
		.done();
})

.test('Math.asinh: < 0', function()
{
	this
		.exec(Math.ceil(Math.asinh(-10)), -2)
		.done();
});


/*
 Math.atanh
*/

new Suitest('Math.atanh')

.test('Math.atanh: NaN', function()
{
	this
		.exec(Math.atanh(NaN), NaN, 'eg')
		.done();
})

.test('Math.atanh: < -1', function()
{
	this
		.exec(Math.atanh(-10), NaN, 'eg')
		.done();
})

.test('Math.atanh: > 1', function()
{
	this
		.exec(Math.atanh(10), NaN, 'eg')
		.done();
})

.test('Math.atanh: -1', function()
{
	this
		.exec(Math.atanh(-1), -Infinity, 'eg')
		.done();
})

.test('Math.atanh: +1', function()
{
	this
		.exec(Math.atanh(+1), +Infinity, 'eg')
		.done();
})

.test('Math.atanh: +0', function()
{
	this
		.exec(Math.atanh(0), 0, 'eg')
		.done();
})

.test('Math.atanh: -0', function()
{
	this
		.exec(Math.atanh(-0), -0, 'eg')
		.done();
});

/*
 Math.hypot
*/

new Suitest('Math.hypot')

.test('Math.hypot: +Infinity', function()
{
	this
		.exec(Math.hypot(+Infinity, 1), +Infinity, 'eg')
		.done();
})

.test('Math.hypot: -Infinity', function()
{
	this
		.exec(Math.hypot(-Infinity, 1), -Infinity, 'eg')
		.done();
})

.test('Math.hypot: NaN', function()
{
	this
		.exec(Math.hypot(NaN, 1), NaN, 'eg')
		.done();
})

.test('Math.hypot: +0', function()
{
	this
		.exec(Math.hypot(0, 0), 0, 'eg')
		.done();
})

.test('Math.hypot: -0', function()
{
	this
		.exec(Math.hypot(-0, -0), 0, 'eg')
		.done();
});

/*
 Math.trunc
*/

new Suitest('Math.trunc')

.test('Math.trunc: NaN', function()
{
	this
		.exec(Math.trunc(NaN), NaN, 'eg')
		.done();
})

.test('Math.trunc: +0', function()
{
	this
		.exec(Math.trunc(+0), +0, 'eg')
		.done();
})

.test('Math.trunc: -0', function()
{
	this
		.exec(Math.trunc(-0), -0, 'eg')
		.done();
})

.test('Math.trunc: +Infinity', function()
{
	this
		.exec(Math.trunc(+Infinity), +Infinity, 'eg')
		.done();
})

.test('Math.trunc: -Infinity', function()
{
	this
		.exec(Math.trunc(-Infinity), -Infinity, 'eg')
		.done();
})

.test('Math.trunc: float', function()
{
	this
		.exec(Math.trunc(0.1), 0, 'eg')
		.done();
});

/*
 Math.trunc
*/

new Suitest('Math.sign')

.test('Math.sign: NaN', function()
{
	this
		.exec(Math.sign(NaN), NaN, 'eg')
		.done();
})

.test('Math.sign: +0', function()
{
	this
		.exec(Math.sign(+0), +0, 'eg')
		.done();
})

.test('Math.trunc: -0', function()
{
	this
		.exec(Math.sign(-0), -0, 'eg')
		.done();
})

.test('Math.sign: +1', function()
{
	this
		.exec(Math.sign(+1), +1, 'eg')
		.done();
})

.test('Math.sign: -1', function()
{
	this
		.exec(Math.sign(-1), -1, 'eg')
		.done();
});

/*
 Math.cbrt
*/

new Suitest('Math.cbrt')

.test('Math.cbrt: NaN', function()
{
	this
		.exec(Math.cbrt(NaN), NaN, 'eg')
		.done();
})

.test('Math.cbrt: +0', function()
{
	this
		.exec(Math.cbrt(+0), +0, 'eg')
		.done();
})

.test('Math.cbrt: -0', function()
{
	this
		.exec(Math.cbrt(-0), -0, 'eg')
		.done();
})

.test('Math.cbrt: +Infinity', function()
{
	this
		.exec(Math.cbrt(+Infinity), +Infinity, 'eg')
		.done();
})

.test('Math.cbrt: -Infinity', function()
{
	this
		.exec(Math.cbrt(-Infinity), -Infinity, 'eg')
		.done();
});
