const handler = require('../asyncHandler');

describe('Async Handler Helper', () => {
  it('should return a function', () => {
    expect(typeof handler(() => undefined)).toBe('function');
  });

  it('should keep arity + 1 (for callback)', () => {
    const fn = handler((a, b, c) => [a, b, c]);
    expect(fn.length).toBe(4);
  });

  it('should return call cb when success', async () => {
    const fn = jest
      .fn()
      .mockImplementation((a, b, c) => Promise.resolve([a, b, c]));

    const done = jest.fn();
    const wrapped = handler(fn, 4);

    await wrapped(1, 2, 3, done);

    expect(fn).toBeCalledWith(1, 2, 3);
    expect(done).toBeCalledWith(null, [1, 2, 3]);
  });

  it('should catch an error and call cb with error', async () => {
    const e = new Error('test');
    const fn = () => Promise.reject(e);

    const done = jest.fn();
    const wrapped = handler(fn);

    await wrapped(done);

    expect(done).toBeCalledWith(e);
  });
});
