jest.mock('loopback', () => {
  let tokenMiddleware = null;

  return {
    token: jest.fn().mockImplementation(() => tokenMiddleware),
    __setTokenMiddleware: middleware => (tokenMiddleware = middleware)
  };
});

jest.mock('passport', () => {
  let passportInitialize = null;
  return {
    initialize: jest.fn().mockImplementation(() => passportInitialize),
    __setPassportInitialize: initialize => (passportInitialize = initialize)
  };
});

const socialLogin = require('../');
const makeApp = require('app');
const {__setTokenMiddleware, token} = require('loopback');
const {__setPassportInitialize} = require('passport');

describe('Registering middlewares', () => {
  it('should register token middleware', () => {
    const tokenMiddleware = jest.fn();
    __setTokenMiddleware(tokenMiddleware);

    const app = makeApp();

    socialLogin(app);

    expect(app.middleware).toBeCalledWith('auth', tokenMiddleware);
    expect(token).toBeCalledWith({});
  });

  it('should allow to override token options', () => {
    const tokenMiddleware = jest.fn();
    __setTokenMiddleware(tokenMiddleware);

    const app = makeApp();
    const tokenMiddlewareOptions = {test: 1};
    socialLogin(app, {
      tokenMiddlewareOptions
    });

    expect(token).toBeCalledWith(tokenMiddlewareOptions);
  });

  it('should register passport.initialize', () => {
    const passportInitialize = jest.fn();
    __setPassportInitialize(passportInitialize);

    const app = makeApp();

    socialLogin(app);

    expect(app.middleware).toBeCalledWith('session:after', passportInitialize);
  });
});
