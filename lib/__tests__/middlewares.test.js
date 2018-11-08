jest.mock('loopback', () => {
  let tokenMiddleware = null;

  return {
    token: jest.fn().mockImplementation(() => tokenMiddleware),
    __setTokenMiddleware: middleware => (tokenMiddleware = middleware)
  };
});

jest.mock('passport', () => {
  let passportInitialize = null;
  let passportSession = null;
  let serialize = null;
  let deserialize = null;
  return {
    initialize: jest.fn().mockImplementation(() => passportInitialize),
    __setPassportInitialize: initialize => (passportInitialize = initialize),
    session: jest.fn().mockImplementation(() => passportSession),
    __setPassportSession: session => (passportSession = session),
    serializeUser: jest.fn().mockImplementation(fn => (serialize = fn)),
    deserializeUser: jest.fn().mockImplementation(fn => (deserialize = fn)),
    getSerializer: jest.fn().mockImplementation(() => serialize),
    getDeserializer: jest.fn().mockImplementation(() => deserialize)
  };
});

const socialLogin = require('../');
const makeApp = require('app');
const {__setTokenMiddleware, token} = require('loopback');
const {
  __setPassportInitialize,
  __setPassportSession,
  getSerializer,
  getDeserializer
} = require('passport');

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

  it('should NOT install passport.session() if session flag was NOT specified', () => {
    const passportSession = jest.fn();
    __setPassportSession(passportSession);

    const app = makeApp();

    socialLogin(app);

    expect(app.middleware).not.toBeCalledWith('session:after', passportSession);
  });

  it('should install passport.session() if session flas was specified', () => {
    const passportSession = jest.fn();
    __setPassportSession(passportSession);

    const app = makeApp();

    socialLogin(app, {session: true});

    expect(app.middleware).toBeCalledWith('session:after', passportSession);
  });

  describe('User session serde', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should serialize user id', async () => {
      const app = makeApp();

      socialLogin(app, {session: true});

      const serializer = getSerializer();

      expect(serializer({id: 'test'})).toBe('test');
    });

    it('should deserialize user by id', async () => {
      const app = makeApp();

      socialLogin(app, {session: false});

      const User = app.socialLogin.UserModel;

      const deserialize = getDeserializer();

      const res = await new Promise(resolve => {
        deserialize('test_id', (err, out) => {
          resolve([err, out]);
        });
      });

      expect(User.findById.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "test_id",
    Object {
      "include": Object {
        "relation": "profiles",
        "scope": Object {
          "fields": Array [
            "provider",
          ],
        },
      },
    },
  ],
]
`);
      expect(res).toEqual([null, {}]);
    });
  });
});
