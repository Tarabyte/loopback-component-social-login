const socialLogin = require('../');
const makeApp = require('loopback-app');

describe('Authenticate', () => {
  let app = null;

  beforeAll(() => {
    app = makeApp();
    socialLogin(app);
  });

  it('should be a function', () => {
    expect(typeof app.socialLogin.authenticate).toBe('function');
  });

  it('should throw if name is empty', () => {
    expect(() =>
      app.socialLogin.authenticate({})
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expectng name to be non-empty string. Got \\"[object Object]\\" instead."`
    );
  });
});
