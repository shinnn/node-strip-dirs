#!/usr/bin/env node
'use strict';

var getStdin = require('get-stdin');

var argv = require('minimist')(process.argv.slice(2));
var stripDirs = require('./index.js');
var version = require('./package.json').version;

function help() {
  console.log(
    'strip-dirs v' + version + '\n' +
    'Remove leading directory components from a path, ' +
    'such as tar\'s --strip-components option.\n' +
    '\n' +
    'Usage 1: $ strip-dirs <string> --count(or -c) <number> [--narrow(or -n)]\n' +
    'Usage 2: $ echo <string> | strip-dirs --count(or -c) <number> [--narrow(or -n)]\n' +
    '\n' +
    '--count,  -c: Number of directories to strip from the path\n' +
    '--narrow, -n: Disallow surplus count of directory level'
  );
}

function run(path) {
  var count;
  if (argv.count !== undefined) {
    count = +argv.count;
  } else if (argv.c !== undefined) {
    count = +argv.c;
  }

  if (path) {
    if (count === undefined) {
      console.error('`--count` option required.');
      return;
    }

    var option = {
      narrow: argv.n || argv.narrow
    };

    try {
      console.log(stripDirs(String(path).trim(), count, option));
    } catch (e) {
      console.error(e.message);
    }
  } else {
    help();
  }
}

if (argv.version || argv.v) {
  console.log(version);
} else if (argv.help || argv.h) {
  help();
} else if (process.stdin.isTTY) {
  run(argv._[0]);
} else {
  getStdin(run);
}
