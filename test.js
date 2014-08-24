'use strict';

var path = require('path');
var spawn = require('child_process').spawn;

var test = require('tape');

test('stripDirs()', function(t) {
  var stripDirs = require('require-main')();

  t.plan(13);

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

test('"strip-dirs" command', function(t) {
  var pkg = require('./package.json');
  var stripDirs = function(args) {
    return spawn('node', [pkg.bin].concat(args), {
      stdio: [process.stdin, null, null]
    });
  };

  t.plan(12);

  stripDirs(['a/.b', '--count', '1'])
  .stdout.on('data', function(data) {
    t.equal(data.toString(), '.b\n', 'should remove path components by count.');
  });

  stripDirs(['a/././/b/./', '--c', '1'])
  .stdout.on('data', function(data) {
    t.equal(data.toString(), 'b\n', 'should accept `-c` alias.');
  });

  stripDirs(['--version'])
  .stdout.on('data', function(data) {
    t.equal(
      data.toString(), pkg.version + '\n',
      'should print module version with `--version` flag.'
    );
  });

  stripDirs(['-v'])
  .stdout.on('data', function(data) {
    t.equal(data.toString(), pkg.version + '\n', 'should accept `-v` alias.');
  });

  stripDirs(['--help'])
  .stdout.on('data', function(data) {
    t.ok(/Usage/.test(data.toString()), 'should print help with `--help` flag.');
  });

  stripDirs(['--h'])
  .stdout.on('data', function(data) {
    t.ok(/Usage/.test(data.toString()), 'should accept `-h` alias.');
  });

  stripDirs(['a/b', '--count', '2', '--narrow'])
  .stderr.on('data', function(data) {
    t.ok(data.toString(), 'should accept `--narrow` flag.');
  });

  stripDirs(['a/b', '--count', '2', '--n'])
  .stderr.on('data', function(data) {
    t.ok(data.toString(), 'should accept `-n` alias.');
  });

  stripDirs([])
  .stdout.on('data', function(data) {
    t.ok(
      /Usage/.test(data.toString()),
      'should print help when the path isn\'t specified.'
    );
  });

  stripDirs(['a'])
  .stderr.on('data', function(data) {
    t.equal(
      data.toString(), '`--count` option required.\n',
      'should print message to stderr when `--count` isn\'t specified.'
    );
  });

  stripDirs(['/a/b', '--count', '1'])
  .stderr.on('data', function(data) {
    t.ok(data.toString(), 'should print the error of index.js to stderr.');
  });

  t.test('"strip-dirs" command with pipe (`|`)', function(st) {
    st.plan(3);

    var stripDirsPipe = function(args) {
      return spawn('node', [pkg.bin].concat(args), {
        stdio: ['pipe', null, null]
      });
    };

    var cp = stripDirsPipe(['--count', '1']);
    cp.stdout.on('data', function(data) {
      st.equal(data.toString(), 'b\n', 'should recieve stdin.');
    });
    cp.stdin.write('a/b');
    cp.stdin.end();

    var cpError = stripDirsPipe([]);
    cpError.stderr.on('data', function(data) {
      st.equal(
        data.toString(), '`--count` option required.\n',
        'should print message to stderr when `--count` isn\'t specified.'
      );
    });
    cpError.stdin.write('a/b');
    cpError.stdin.end();

    var cpEmpty = stripDirsPipe([]);
    cpEmpty.stdout.on('data', function(data) {
      st.equal(
        data.toString(), '.\n',
        'should print current directory when stdin is empty.'
      );
    });
    cpEmpty.stdin.write('');
    cpEmpty.stdin.end();
  });
});
