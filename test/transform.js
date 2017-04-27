const fs = require('fs');
const tap = require('tap');
const path = require('path');
const through = require('through2');

tap.test('transform', function (test) {
  test.plan(2);

  let transform = require('../src');

  test.test('should return original source when filter test fails', function (t) {
    let file = path.resolve('test/fixtures/not-transformed/index.js');
    let data = null;

    let opts = {
      loaders: [
        {
          filter: /(.*)\/foo.js/,
          worker: function(module, content, done) {
            content = 'let bar = \'bar\';\n' + content;

            done(content);
          }
        }
      ]
    };

    fs.createReadStream(file)
      .pipe(transform(file, opts))
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/not-transformed/wanted.js'), function (err, readData) {
          t.same(data, readData.toString());

          t.end();
        });
      })
      .on('error', function (err) {
          t.fail(err);

          t.end();
        }
      );
  });

  test.test('should return transformed source when filter test succeeds', function (t) {
    let file = path.resolve('test/fixtures/transformed/index.js');
    let data = null;

    let opts = {
      loaders: [
        {
          filter: /(.*)\/*.js/,
          worker: function(module, content, done) {
            content = 'let bar = \'bar\';\n' + content;

            done(content);
          }
        }
      ]
    };

    fs.createReadStream(file)
      .pipe(transform(file, opts))
      .pipe(through(function (chunk, enc, cb) {
        data = chunk.toString();

        cb();
      }))
      .on('finish', function () {
        fs.readFile(path.resolve('test/fixtures/transformed/wanted.js'), function (err, readData) {
          t.same(data, readData.toString());

          t.end();
        });
      })
      .on('error', function (err) {
          t.fail(err);

          t.end();
        }
      );
  });
});