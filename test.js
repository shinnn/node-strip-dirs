'use strong';

const path = require('path');
const {spawn} = require('child_process');

const pkg = require('./package.json');
const test = require('tape');

test('stripDirs()', t => {
  t.plan(13);

  const stripDirs = require('.');

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
    /TypeError.*\[ 'a\/b' \] is not a string/,
    'should throw a type error when the first argument is not a string.'
  );

  t.throws(
    () => stripDirs('/a/b', 1),
    /Error.* is an absolute path. strip-dirs requires a relative path\./,
    'should throw an error when the path is absolute path.'
  );

  t.throws(
    () => stripDirs('C:/a', 1),
    /Error.*'C:\/a' is an absolute path. strip-dirs requires a relative path\./,
    'should throw an error when the path is Windows absolute path.'
  );

  t.throws(
    () => stripDirs('a/b', 1.5),
    /Error.*must be a natural number or 0, but received 1\.5/,
    'should throw an error when the second argument is not an integer.'
  );

  t.throws(
    () => stripDirs('a/b', -1),
    /Error.*must be a natural number or 0, but received -1/,
    'should throw an error when the second argument is a negative number.'
  );

  t.throws(
    () => stripDirs('a/b', 2, {narrow: true}),
    /RangeError.*Cannot strip more directories than there are/,
    'should accept `narrow` option.'
  );

  t.end();
});

test('"strip-dirs" command inside a TTY context', t => {
  t.plan(16);

  const stripDirs = args => {
    const cp = spawn('node', [pkg.bin].concat(args), {
      stdio: [process.stdin, null, null]
    });

    cp.stdout.setEncoding('utf8');
    cp.stderr.setEncoding('utf8');

    return cp;
  };

  stripDirs(['a/.b', '--count', '1'])
  .stdout.on('data', output => {
    t.equal(output, '.b\n', 'should remove path components by count.');
  });

  stripDirs(['a/././/b/./', '-c', '1'])
  .stdout.on('data', output => {
    t.equal(output, 'b\n', 'should use -c as an alias of --count.');
  });

  stripDirs(['--version'])
  .stdout.on('data', output => {
    t.equal(
      output, pkg.version + '\n',
      'should print module version with `--version.'
    );
  });

  stripDirs(['-v'])
  .stdout.on('data', output => {
    t.equal(output, pkg.version + '\n', 'should use -v as an alias of --version.');
  });

  stripDirs(['--help'])
  .stdout.on('data', output => {
    t.ok(/Usage/.test(output), 'should print help with `--help` flag.');
  });

  stripDirs(['-h'])
  .stdout.on('data', output => {
    t.ok(/Usage/.test(output), 'should use -h as an alias of --help.');
  });

  stripDirs(['a', '--count'])
  .on('close', code => {
    t.equal(code, 1, 'should fail when `--count` has no value.');
  })
  .stderr.on('data', output => {
    t.equal(
      output, '--count (or -c) option must be a number.\n',
      'should print error message to stderr when `--count` has no value.'
    );
  });

  stripDirs(['a/b', '--count', '2', '--narrow'])
  .on('close', code => {
    t.equal(code, 1, 'should accept `--narrow` flag.');
  })
  .stderr.on('data', output => {
    t.ok(
      /Cannot strip more directories/.test(output),
      'should print the error message `narrow` option produces.'
    );
  });

  stripDirs(['a/b', '--count', '2', '-n'])
  .stderr.on('data', output => {
    t.ok(
      /Cannot strip more directories/.test(output),
      'should use -n as an alias of --narrow.'
    );
  });

  stripDirs([])
  .stdout.on('data', output => {
    t.ok(/Usage/.test(output), 'should print help when the path isn\'t specified.');
  });

  stripDirs(['a'])
  .on('close', code => {
    t.equal(code, 1, 'should fail when `--count` isn\'t specified.');
  })
  .stderr.on('data', output => {
    t.equal(
      output, '--count (or -c) option required.\n',
      'should print error message to stderr when `--count` isn\'t specified.'
    );
  });

  stripDirs(['/a/b', '--count', '1'])
  .on('close', code => {
    t.equal(code, 1, 'should fail when the path is an absolute path.');
  })
  .stderr.on('data', output => {
    t.ok(output, 'should print error message of index.js to stderr.');
  });
});

test('"strip-dirs" command outside a TTY context', t => {
  t.plan(3);

  const stripDirsPipe = args => {
    return spawn('node', [pkg.bin].concat(args), {stdio: ['pipe', null, null]});
  };

  const cp = stripDirsPipe(['--count', '1']);
  cp.stdout.on('data', function(data) {
    t.equal(data.toString(), 'b\n', 'should recieve stdin.');
  });
  cp.stdin.end('a/b');

  const cpError = stripDirsPipe([]);
  cpError.stderr.on('data', data => {
    t.equal(
      data.toString(), '--count (or -c) option required.\n',
      'should print message to stderr when `--count` isn\'t specified.'
    );
  });
  cpError.stdin.end('a/b');

  const cpEmpty = stripDirsPipe([]);
  cpEmpty.stdout.on('data', data => {
    t.equal(
      data.toString(), '.\n',
      'should print current directory when stdin is empty.'
    );
  });
  cpEmpty.stdin.end('');
});
