const arity = require('./arity');

module.exports = (fn, n = fn.length, {spread = false} = {}) =>
  arity((...args) => {
    const done = args.pop();
    const success = spread ? res => done(null, ...res) : res => done(null, res);
    const fail = err => done(err);

    return Promise.resolve(fn(...args))
      .then(success)
      .catch(fail);
  }, n + 1);
