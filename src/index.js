const through = require('through2');

module.exports = function (file, opts) {
  let content = '';

  function transform(chunk, enc, cb) {
    content += chunk;

    cb();
  }

  function flush(cb) {
    let self = this;

    let loaders = opts.loaders;
    let workers = [];

    let done = function(data) {
      self.push(data);

      cb();
    };

    loaders.forEach(function(loader) {
      /**
       * @var RegExp regex
       */
      let filter = loader.filter;

      if (filter.test(file)) {
        let worker = loader.worker;

        workers.push(worker);
      }
    });

    if (workers.length > 0) {
      workers.forEach(function(worker) {
        worker.call(this, file, content, done);
      });
    }
    else {
      done(content);
    }
  }

  return through(transform, flush);
};