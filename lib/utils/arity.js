/* eslint-disable no-invalid-this */
const builders = {
  0: fn =>
    function() {
      return fn.call(this);
    },
  1: fn =>
    function(a) {
      return fn.call(this, a);
    },
  2: fn =>
    function(a, b) {
      return fn.call(this, a, b);
    },
  3: fn =>
    function(a, b, c) {
      return fn.call(this, a, b, c);
    }
};

const params = n => Array.from(Array(n), (_, i) => `_${i}`).join(',');

module.exports = (fn, n) => {
  const builder =
    builders[n] ||
    (builders[n] = new Function( // eslint-disable-line  no-new-func
      'fn',
      `return function(${params(n)}) { return fn.apply(this, arguments);}`
    ));

  return builder(fn);
};
