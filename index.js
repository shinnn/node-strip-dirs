/*!
 * strip-dirs | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/node-strip-dirs
*/
'use strict';

const path = require('path');
const util = require('util');

const isNaturalNumber = require('is-natural-number');

module.exports = function stripDirs(pathStr, count, option) {
  option = option || {narrow: false};

  if (typeof pathStr !== 'string') {
    throw new TypeError(
      util.inspect(pathStr) +
      ' is not a string. First argument to strip-dirs must be a path string.'
    );
  }

  if (path.posix.isAbsolute(pathStr) || path.win32.isAbsolute(pathStr)) {
    throw new TypeError(`${pathStr} is an absolute path. strip-dirs requires a relative path.`);
  }

  if (!isNaturalNumber(count, {includeZero: true})) {
    throw new Error(
      'The Second argument of strip-dirs must be a natural number or 0, but received ' +
      util.inspect(count) +
      '.'
    );
  }

  const pathComponents = path.normalize(pathStr).split(path.sep);
  if (pathComponents.length > 1 && pathComponents[0] === '.') {
    pathComponents.shift();
  }

  if (count > pathComponents.length - 1) {
    if (option.narrow) {
      throw new RangeError('Cannot strip more directories than there are.');
    }
    count = pathComponents.length - 1;
  }

  return path.join.apply(null, pathComponents.slice(count));
};
