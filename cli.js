#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    c: 'count',
    n: 'narrow',
    h: 'help',
    v: 'version'
  },
  string: ['_'],
  boolean: ['narrow', 'help', 'version']
});

function help() {
  var chalk = require('chalk');
  var pkg = require('./package.json');

  console.log([
    chalk.cyan(pkg.name) + chalk.gray(' v' + pkg.version),
    pkg.description + '.',
    '',
    'Usage 1: $ strip-dirs <string> --count(or -c) <number> [--narrow(or -n)]',
    'Usage 2: $ echo <string> | strip-dirs --count(or -c) <number> [--narrow(or -n)]',
    '',
    'Options:',
    chalk.yellow('--count,   -c') + '  Number of directories to strip from the path',
    chalk.yellow('--narrow,  -n') + '  Disallow surplus count of directory level',
    chalk.yellow('--version, -v') + '  Print version',
    chalk.yellow('--help,    -h') + '  Print usage information'
  ].join('\n'));
}

function run(path) {
  if (path) {
    var count;
    if (argv.count !== undefined) {
      count = +argv.count;
    } else {
      console.warn('`--count` option required.');
      process.exit(1);
    }

    var stripDirs = require('./');
    console.log(stripDirs(path.trim(), count, {narrow: argv.narrow}));

  } else if (!process.stdin.isTTY) {
    console.log('.');
  } else {
    help();
  }
}

if (argv.version) {
  console.log(require('./package.json').version);
} else if (argv.help) {
  help();
} else if (process.stdin.isTTY) {
  run(argv._[0]);
} else {
  require('get-stdin')(run);
}
