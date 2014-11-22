'use strict';

var path = require('path');
var spawn = require('child_process').spawn;

var pkg = require('./package.json');
var test = require('tape');

test('stripDirs()', function(t) {
  t.plan(13);

  var stripDirs = require('./');

  t.equal(
    stripDirs('a/b.c', 1), 'b.c',
    'should remove path components by count.'
  );
  t.equal(
    stripDirs('./a/b', 1), 'b',
    'should remove path components taking care of leading `./`.'
  );
  t.equal(
    stripDirs('a/../', 1), '.',
    'should return current directory when the path is current directory.'
  );
  t.equal(
    stripDirs('a/././/b/./', 1), 'b',
    'should normalize the path taking care of redundant `./` and `/`.'
  );
  t.equal(
    stripDirs('a/b/', 0), path.normalize('a/b'),
    'should not remove path components when the second argument is `0`.'
  );
  t.equal(
    stripDirs('a/b', 2), 'b',
    'should keep the last path component.'
  );
  t.throws(
    stripDirs.bind(null, 'a/b'),
    'should throw an error when it takes less than two arguments.'
  );
  t.throws(
    stripDirs.bind(null, ['a/b'], 1),
    'should throw an error when the first argument is not a string.'
  );
  t.throws(
    stripDirs.bind(null, '/a/b', 1),
    'should throw an error when the path is absolute path.'
  );
  t.throws(
    stripDirs.bind(null, 'C:/a', 1),
    'should throw an error when the path is Windows absolute path.'
  );
  t.throws(
    stripDirs.bind(null, 'a/b', 1.5),
    'should throw an error when the second argument is not an integer.'
  );
  t.throws(
    stripDirs.bind(null, 'a/b', -1),
    'should throw an error when the second argument is a negative number.'
  );
  t.throws(
    stripDirs.bind(null, 'a/b', 2, {narrow: true}),
    'should accept `narrow` option.'
  );

  t.end();
});

test('"strip-dirs" command inside a TTY context', function(t) {
  t.plan(14);

  var stripDirs = function(args) {
    var cp = spawn('node', [pkg.bin].concat(args), {
      stdio: [process.stdin, null, null]
    });
    cp.stdout.setEncoding('utf-8');
    cp.stderr.setEncoding('utf-8');
    return cp;
  };

  stripDirs(['a/.b', '--count', '1'])
  .stdout.on('data', function(output) {
    t.equal(output, '.b\n', 'should remove path components by count.');
  });

  stripDirs(['a/././/b/./', '--c', '1'])
  .stdout.on('data', function(output) {
    t.equal(output, 'b\n', 'should use -c as an alias of --count.');
  });

  stripDirs(['--version'])
  .stdout.on('data', function(output) {
    t.equal(
      output, pkg.version + '\n',
      'should print module version with `--version.'
    );
  });

  stripDirs(['-v'])
  .stdout.on('data', function(output) {
    t.equal(output, pkg.version + '\n', 'should use -v as an alias of --version.');
  });

  stripDirs(['--help'])
  .stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should print help with `--help` flag.');
  });

  stripDirs(['--h'])
  .stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should use -h as an alias of --help.');
  });

  var narrowErr = '';
  stripDirs(['a/b', '--count', '2', '--narrow'])
  .on('close', function(code) {
    t.notEqual(code, 0, 'should accept `--narrow` flag.');
    t.ok(
      /Cannot strip more directories/.test(narrowErr),
      'should print the error message `narrow` option produces.'
    );
  })
  .stderr.on('data', function(output) {
    narrowErr += output;
  });

  var nErr = '';
  stripDirs(['a/b', '--count', '2', '-n'])
  .on('close', function() {
    t.ok(
      /Cannot strip more directories/.test(nErr),
      'should use -n as an alias of --narrow.'
    );
  })
  .stderr.on('data', function(output) {
    nErr += output;
  });

  stripDirs([])
  .stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should print help when the path isn\'t specified.');
  });

  var noCountErr = '';
  stripDirs(['a'])
  .on('close', function(code) {
    t.notEqual(code, 0, 'should fail when `--count` isn\'t specified.');
    t.equal(
      noCountErr, '`--count` option required.\n',
      'should print error message to stderr when `--count` isn\'t specified.'
    );
  })
  .stderr.on('data', function(output) {
    noCountErr += output;
  });

  var absolutePathErr = '';
  stripDirs(['/a/b', '--count', '1'])
  .on('close', function(code) {
    t.notEqual(code, 0, 'should fail when the path is an absolute path.');
    t.ok(absolutePathErr, 'should print error message of index.js to stderr.');
  })
  .stderr.on('data', function(output) {
    absolutePathErr += output;
  });
});

test('"strip-dirs" command outside a TTY context', function(t) {
  t.plan(3);

  var stripDirsPipe = function(args) {
    return spawn('node', [pkg.bin].concat(args), {
      stdio: ['pipe', null, null]
    });
  };

  var cp = stripDirsPipe(['--count', '1']);
  cp.stdout.on('data', function(data) {
    t.equal(data.toString(), 'b\n', 'should recieve stdin.');
  });
  cp.stdin.end('a/b');

  var cpError = stripDirsPipe([]);
  cpError.stderr.on('data', function(data) {
    t.equal(
      data.toString(), '`--count` option required.\n',
      'should print message to stderr when `--count` isn\'t specified.'
    );
  });
  cpError.stdin.end('a/b');

  var cpEmpty = stripDirsPipe([]);
  cpEmpty.stdout.on('data', function(data) {
    t.equal(
      data.toString(), '.\n',
      'should print current directory when stdin is empty.'
    );
  });
  cpEmpty.stdin.end('');
});
