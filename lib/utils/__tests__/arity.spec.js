const arity = require('../arity');

describe('Arity Helper', () => {
  it('should return a function', () => {
    expect(typeof arity(() => undefined, 3)).toBe('function');
  });

  it('wrapped function should call original', () => {
    const fn = jest.fn();

    const fn5 = arity(fn, 5);

    fn5(5, 4, 3, 2, 1);

    expect(fn).toBeCalledWith(5, 4, 3, 2, 1);
  });

  it('should keep context', () => {
    const fn = jest.fn().mockReturnThis();
    const fn1 = arity(fn, 1);

    const ctx = {
      test: 1
    };
    expect(fn1.call(ctx, 10)).toBe(ctx);

    expect(fn.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    10,
  ],
]
`);
  });

  it('should fix arguments length', () => {
    expect(arity(() => undefined, 3).length).toBe(3);
  });

  it('should allow arbitrary args length', () => {
    expect(arity(() => undefined, 31).length).toBe(31);
  });

  test.each`
    n    | expected
    ${0} | ${0}
    ${1} | ${1}
    ${2} | ${2}
    ${3} | ${3}
  `('returns function of $expected arity when $n', ({n, expected}) => {
    const fn = jest.fn();
    const wrapped = arity(fn, n);
    expect(wrapped.length).toBe(expected);

    const args = Array.from(Array(n), (_, i) => i);
    wrapped(...args);

    expect(fn).toBeCalledWith(...args);
  });
});
