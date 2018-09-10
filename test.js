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
		/^TypeError.*\[ 'a\/b' \] is not a string/u,
		'should throw a type error when the first argument is not a string.'
	);

	t.throws(
		() => stripDirs('/a/b', 1),
		/^Error.*\/a\/b is an absolute path\. strip-dirs requires a relative path\./u,
		'should throw an error when the path is absolute path.'
	);

	t.throws(
		() => stripDirs('C:/a', 1),
		/^Error.*C:\/a is an absolute path\. strip-dirs requires a relative path\./u,
		'should throw an error when the path is Windows absolute path.'
	);

	t.throws(
		() => stripDirs('a/b', 1.5),
		/^Error.*must be a natural number or 0, but received 1\.5/u,
		'should throw an error when the second argument is not an integer.'
	);

	t.throws(
		() => stripDirs('a/b', -1),
		/^Error.*must be a natural number or 0, but received -1/u,
		'should throw an error when the second argument is a negative number.'
	);

	t.throws(
		() => stripDirs('a/b', Number.MAX_SAFE_INTEGER, Map),
		/^TypeError.*\[Function: Map\] is not an object\. Expected an object with a boolean `disallowOverflow` property/u,
		'should throw a type error when the third argument is not an object.'
	);

	t.throws(
		() => stripDirs('a/b', Number.MAX_SAFE_INTEGER, [NaN]),
		/^TypeError.*\[ NaN \] is an array\. Expected an object with a boolean `disallowOverflow` property/u,
		'should throw a type error when the third argument is an array.'
	);

	t.throws(
		() => stripDirs('a/b', Number.MAX_SAFE_INTEGER, {disallowOverflow: Buffer.from('true')}),
		/^TypeError.*<Buffer .*> is neither true nor false\. `disallowOverflow` option must be a Boolean value/u,
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
		'should throw a type error when it takes no arguments.'
	);

	t.end();
});
