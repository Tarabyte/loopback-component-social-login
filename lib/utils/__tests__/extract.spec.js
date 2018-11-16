const extract = require('../extract');

describe('extract data from objects', () => {
  it('should return value by path', () => {
    expect(extract({a: [{c: 'test'}]}, 'a.0.c')).toBe('test');
  });

  it('should use defaults if some property is null', () => {
    const defaults = jest.fn().mockReturnValue('test');
    const obj = {
      a: {
        b: null
      }
    };

    const path = 'a.b.c';

    expect(extract(obj, path, defaults)).toBe('test');
    expect(defaults).toBeCalledWith(obj, path);
  });

  it('should return defaults if it is not a function', () => {
    const defaults = {};
    const obj = {
      a: {
        b: null
      }
    };

    const path = 'a.b.c';

    expect(extract(obj, path, defaults)).toBe(defaults);
  });
});
