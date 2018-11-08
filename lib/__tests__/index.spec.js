const socialLogin = require('../');
const makeApp = require('app');

describe('Social Login Component', () => {
  it('should be a function', () => {
    expect(typeof socialLogin).toBe('function');
  });

  describe('attaching instance to app', () => {
    it('should attach socialLogin to an app', () => {
      const app = makeApp();
      socialLogin(app);

      expect(typeof app.socialLogin).toBe('object');
    });

    it('should allow to set custom socialLogin property', () => {
      const app = makeApp();
      socialLogin(app, {socialLoginProp: 'testingSocialLoginProp'});

      expect(typeof app.testingSocialLoginProp).toBe('object');
    });

    it('should throw if property is already defined', () => {
      const app = makeApp({
        socialLogin: true
      });

      expect(() => socialLogin(app)).toThrowErrorMatchingInlineSnapshot(
        `"Application instance already has something called \\"socialLogin\\"."`
      );
    });
  });
});
