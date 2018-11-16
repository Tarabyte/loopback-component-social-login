const cps = require('../cps');

describe('cps', () => {
  it('should return a function', () => {
    expect(cps(jest.fn())).toBeInstanceOf(Function);
  });

  it('should make async function', () => {
    const fn = jest.fn();
    const wrapped = cps(fn);

    expect(wrapped()).toBeInstanceOf(Promise);
  });

  it('should pass through arguments', () => {
    const fn = jest.fn();
    const wrapped = cps(fn);

    wrapped(1, 2, 3);

    expect(fn).toBeCalledWith(1, 2, 3, expect.any(Function));
  });

  it('should allow to call methods', async () => {
    const fn = jest.fn().mockImplementation(function(cb) {
      cb(null, this); // eslint-disable-line no-invalid-this
    });

    const ctx = {};

    const wrapped = cps(fn, ctx);

    expect(await wrapped()).toBe(ctx);
  });

  it('should allow to pass method  name as a string', () => {
    const fn = jest.fn();

    const ctx = {fn};

    const wrapped = cps('fn', ctx);

    wrapped();

    expect(fn).toBeCalled();
  });

  it('should return error as the first argument', async () => {
    const error = new Error('test error');
    const fn = jest.fn().mockImplementation(done => done(error));

    const wrapped = cps(fn);

    await expect(wrapped()).rejects.toEqual(error);
  });
});
