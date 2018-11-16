module.exports = (fn, ctx) => {
  fn = typeof fn === 'string' ? ctx[fn] : fn;

  return (...args) =>
    new Promise((resolve, reject) => {
      fn.call(ctx, ...args, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
};
