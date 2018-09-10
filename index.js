'use strict';

const {join, normalize, sep, posix: {isAbsolute: posixIsAbsolute}, win32: {isAbsolute: win32IsAbsolute}} = require('path');
const util = require('util');

const isNaturalNumber = require('is-natural-number');

module.exports = function stripDirs(...args) {
	const argLen = args.length;

	if (argLen !== 2 && argLen !== 3) {
		throw new RangeError(`Expected 2 or 3 arguments (<string>, <integer>[, <Object>]), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	const [pathStr, count, option = {disallowOverflow: false}] = args;

	if (typeof pathStr !== 'string') {
		throw new TypeError(`${util.inspect(pathStr)} is not a string. First argument to strip-dirs must be a path string.`);
	}

	if (posixIsAbsolute(pathStr) || win32IsAbsolute(pathStr)) {
		throw new Error(`${pathStr} is an absolute path. strip-dirs requires a relative path.`);
	}

	if (!isNaturalNumber(count, {includeZero: true})) {
		throw new Error(`The Second argument of strip-dirs must be a natural number or 0, but received ${
			util.inspect(count)
		}.`);
	}

	if (argLen === 3) {
		if (typeof option !== 'object') {
			throw new TypeError(`${util.inspect(option)
			} is not an object. Expected an object with a boolean \`disallowOverflow\` property.`);
		}

		if (Array.isArray(option)) {
			throw new TypeError(`${util.inspect(option)
			} is an array. Expected an object with a boolean \`disallowOverflow\` property.`);
		}

		if ('disallowOverflow' in option && typeof option.disallowOverflow !== 'boolean') {
			throw new TypeError(`${util.inspect(option.disallowOverflow)
			} is neither true nor false. \`disallowOverflow\` option must be a Boolean value.`);
		}
	}

	const pathComponents = normalize(pathStr).split(sep);

	if (pathComponents.length > 1 && pathComponents[0] === '.') {
		pathComponents.shift();
	}

	if (count > pathComponents.length - 1) {
		if (option.disallowOverflow) {
			throw new RangeError('Cannot strip more directories than there are.');
		}

		return normalize(pathComponents[pathComponents.length - 1]);
	}

	return join(...pathComponents.slice(count));
};
