const arity = require('./arity');

module.exports = (fn, n = fn.length + 1) =>
  // keep function arity
  arity((...args) => {
    const done = args.pop();

    return Promise.resolve(fn(...args))
      .then(res => done(null, res))
      .catch(err => done(err));
  }, n);
