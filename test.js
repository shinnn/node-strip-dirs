'use strict';

const {normalize} = require('path');

const stripDirs = require('.');
const test = require('tape');

test('stripDirs()', t => {
	t.equal(
		stripDirs('a/b.c', 1),
		'b.c',
		'should remove path components by count.'
	);

	t.equal(
		stripDirs('./a/b', 1),
		'b',
		'should remove path components taking care of leading `./`.'
	);

	t.equal(
		stripDirs('a/../', 1),
		'.',
		'should return current directory when the path is current directory.'
	);

	t.equal(
		stripDirs('a/././/b/./', 1),
		'b',
		'should normalize the path taking care of redundant `./` and `/`.'
	);

	t.equal(
		stripDirs('a/b/', 0),
		normalize('a/b'),
		'should not remove path components when the second argument is `0`.'
	);

	t.equal(
		stripDirs('a/b', 2),
		'b',
		'should keep the last path component.'
	);

	t.throws(
		() => stripDirs(['a/b'], 1),
		/^TypeError.*got a non-string value \[ 'a\/b' \] \(array\)\./u,
		'should throw a type error when the first argument is not a string.'
	);

	t.throws(
		() => stripDirs('/a/b', 1),
		/^Error.*Expected a relative file path, but got an absolute path '\/a\/b'\./u,
		'should throw an error when the path is a POSIX absolute path.'
	);

	t.throws(
		() => stripDirs('C:\\a', 1),
		/^Error.*Expected a relative file path, but got an absolute path 'C:\\\\a'\./u,
		'should throw an error when the path is an Windows absolute path.'
	);

	t.throws(
		() => stripDirs('a/b', Buffer.from('1')),
		/^TypeError.*Expected a non-negative integer, but got a non-number value <Buffer 31>\./u,
		'should throw an error when the second argument is not a number.'
	);

	t.throws(
		() => stripDirs('a/b', -1),
		/^RangeError.*Expected a non-negative integer, but got a negative value -1 \(number\)\./u,
		'should throw an error when the second argument is a negative number.'
	);

	t.throws(
		() => stripDirs('a/b', NaN),
		/^RangeError.*Expected a non-negative integer, but got NaN\./u,
		'should throw an error when the second argument is infinite.'
	);

	t.throws(
		() => stripDirs('a/b', Number.MAX_SAFE_INTEGER + 1),
		/^RangeError.*Expected a non-negative integer, but got an extremely large number 9007199254740992\./u,
		'should throw an error when the second argument is too large.'
	);

	t.throws(
		() => stripDirs('a/b', 1.5),
		/^RangeError.*Expected a non-negative integer, but got a non-integer number 1\.5\./u,
		'should throw an error when the second argument is not an integer.'
	);

	t.throws(
		() => stripDirs('a/b', Number.MAX_SAFE_INTEGER, Symbol('_')),
		/^TypeError.*Expected an option object to set strip-dirs option, but got Symbol\(_\)\./u,
		'should throw a type error when the third argument is not an object.'
	);

	t.throws(
		() => stripDirs('a/b', Number.MAX_SAFE_INTEGER, {disallowOverflow: new Int8Array()}),
		/^TypeError.*Expected `disallowOverflow` option to be a boolean, but got a non-boolean value Int8Array \[\]\./u,
		'should throw a type error when `disallowOverflow` option is not a Boolean.'
	);

	t.throws(
		() => stripDirs('a/b', 2, {disallowOverflow: true}),
		/^RangeError.*Cannot strip more directories than there are/u,
		'should accept `narrow` option.'
	);

	t.throws(
		() => stripDirs(),
		/^RangeError.*Expected 2 or 3 arguments \(<string>, <integer>\[, <Object>\]\), but got no arguments\./u,
		'should throw a type error when it takes no arguments.'
	);

	t.throws(
		() => stripDirs('.', 10, {}, {}),
		/^RangeError.*Expected 2 or 3 arguments \(<string>, <integer>\[, <Object>\]\), but got 4 arguments\./u,
		'should throw a type error when it takes too many arguments.'
	);

	t.end();
});
