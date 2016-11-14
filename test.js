'use strict';

const path = require('path');

const stripDirs = require('.');
const test = require('tape');

test('stripDirs()', t => {
  t.strictEqual(stripDirs.name, 'stripDirs', 'should have a function name.');

  t.strictEqual(
    stripDirs('a/b.c', 1),
    'b.c',
    'should remove path components by count.'
  );

  t.strictEqual(
    stripDirs('./a/b', 1),
    'b',
    'should remove path components taking care of leading `./`.'
  );

  t.strictEqual(
    stripDirs('a/../', 1),
    '.',
    'should return current directory when the path is current directory.'
  );

  t.strictEqual(
    stripDirs('a/././/b/./', 1),
    'b',
    'should normalize the path taking care of redundant `./` and `/`.'
  );

  t.strictEqual(
    stripDirs('a/b/', 0),
    path.normalize('a/b'),
    'should not remove path components when the second argument is `0`.'
  );

  t.equal(
    stripDirs('a/b', 2),
    'b',
    'should keep the last path component.'
  );

  t.throws(
    () => stripDirs(['a/b'], 1),
    /^TypeError.*\[ 'a\/b' \] is not a string/,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    () => stripDirs('/a/b', 1),
    /^Error.*\/a\/b is an absolute path. strip-dirs requires a relative path\./,
    'should throw an error when the path is absolute path.'
  );

  t.throws(
    () => stripDirs('C:/a', 1),
    /^Error.*C:\/a is an absolute path. strip-dirs requires a relative path\./,
    'should throw an error when the path is Windows absolute path.'
  );

  t.throws(
    () => stripDirs('a/b', 1.5),
    /^Error.*must be a natural number or 0, but received 1\.5/,
    'should throw an error when the second argument is not an integer.'
  );

  t.throws(
    () => stripDirs('a/b', -1),
    /^Error.*must be a natural number or 0, but received -1/,
    'should throw an error when the second argument is a negative number.'
  );

  t.throws(
    () => stripDirs('a/b', Number.MAX_SAFE_INTEGER, function foo() {}),
    /^TypeError.*\[Function: foo\] is not an object\. Expected an object with a boolean `disallowOverflow` property/,
    'should throw a type error when the third argument is not an object.'
  );

  t.throws(
    () => stripDirs('a/b', Number.MAX_SAFE_INTEGER, [NaN]),
    /^TypeError.*\[ NaN \] is an array\. Expected an object with a boolean `disallowOverflow` property/,
    'should throw a type error when the third argument is an array.'
  );

  t.throws(
    () => stripDirs('a/b', Number.MAX_SAFE_INTEGER, {disallowOverflow: new Buffer('true')}),
    /^TypeError.*<Buffer .*> is neither true nor false\. `disallowOverflow` option must be a Boolean value/,
    'should throw a type error when `disallowOverflow` option is not a Boolean.'
  );

  t.throws(
    () => stripDirs('a/b', 2, {disallowOverflow: true}),
    /^RangeError.*Cannot strip more directories than there are/,
    'should accept `narrow` option.'
  );

  t.throws(
    () => stripDirs(),
    /^TypeError.*undefined is not a string\. /,
    'should throw a type error when it takes no arguments.'
  );

  t.end();
});
