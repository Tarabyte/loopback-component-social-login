const scheme = require('../OAuth2.0');
const makeLoopbackApp = require('loopback-app');
const passport = require('passport');
const cps = require('../../utils/cps');

jest.mock('passport', () => {
  let authorize = null;
  let authenticate = null;
  return {
    use: jest.fn(),
    unuse: jest.fn(),
    get authorize() {
      return authorize;
    },
    get authenticate() {
      return authenticate;
    },
    __setAuthorize(fn) {
      authorize = fn;
    },
    __setAuthenticate(fn) {
      authenticate = fn;
    }
  };
});

describe('OAuth 2.0 auth scheme', () => {
  let app = null;
  let UserModel = null;

  beforeAll(() => {
    app = makeLoopbackApp();
    ({User: UserModel} = app.models);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should add corresponding static methods to UserModel', () => {
    const Strategy = jest.fn().mockReturnThis();

    const clean = scheme({
      name: 'testName',
      app,
      UserModel,
      mode: 'authenticate',
      options: {},
      Strategy
    });

    expect(UserModel.testName).toBeInstanceOf(Function);

    expect(UserModel.testNameCallback).toBeInstanceOf(Function);

    clean();
  });

  it('should create a new strategy', () => {
    const Strategy = jest.fn().mockReturnThis();

    const name = 'testName';
    const options = {test: 1, callbackURL: 'will/be/replaced'};

    const clean = scheme({
      name,
      app,
      UserModel,
      mode: 'authenticate',
      options,
      Strategy
    });

    expect(Strategy.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "callbackURL": "/api/Users/testName/callback",
      "passReqToCallback": true,
      "test": 1,
    },
    [Function],
  ],
]
`);

    expect(passport.use.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "testName",
    mockConstructor {},
  ],
]
`);

    clean();
  });

  it('should throw if unknown mode', () => {
    expect(() =>
      scheme({
        name: 'testThrowing',
        app,
        UserModel,
        mode: 'unknown',
        options: {},
        Strategy: jest.fn().mockReturnThis()
      })
    ).toThrowErrorMatchingInlineSnapshot(`"Unknown mode \\"unknown\\""`);
  });

  it('should call ProfileModel.authenticate in authenticate verify callback', async () => {
    let verify = null;
    const Strategy = jest.fn().mockImplementation((_, cb) => (verify = cb));
    const user = {test: 'user'};
    const token = {test: 'token', id: 'tokenId'};
    const authenticate = jest.fn().mockResolvedValue({user, token});
    const ProfileModel = {authenticate};

    const clean = scheme({
      name: 'testAuthVerifyCb',
      app,
      UserModel,
      ProfileModel,
      mode: 'authenticate',
      options: {},
      Strategy
    });

    expect(verify).toBeInstanceOf(Function);

    const done = jest.fn();

    const accessToken = {test: 'accessToken'};
    const refreshToken = {test: 'refreshToken'};
    const profileData = {
      provider: 'testProvider',
      id: 'testId'
    };

    await verify({}, accessToken, refreshToken, profileData, done);

    expect(authenticate).toBeCalledWith('testProvider', 'testId', profileData, {
      accessToken,
      refreshToken
    });

    expect(done.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    null,
    Object {
      "test": "user",
    },
    Object {
      "token": Object {
        "id": "tokenId",
        "test": "token",
      },
    },
  ],
]
`);

    clean();
  });

  it('should call ProfileModel.authorize in authorize verify callback', async () => {
    let verify = null;
    const Strategy = jest.fn().mockImplementation((_, cb) => (verify = cb));
    const user = {test: 'user'};
    const profile = {test: 'profile'};
    const authorize = jest.fn().mockResolvedValue({user, profile});
    const ProfileModel = {authorize};

    const clean = scheme({
      name: 'testAuthVerifyCb',
      app,
      UserModel,
      ProfileModel,
      mode: 'authorize',
      options: {},
      Strategy
    });

    expect(verify).toBeInstanceOf(Function);

    const done = jest.fn();

    const req = {
      accessToken: {
        userId: 'testUserId'
      }
    };
    const accessToken = {test: 'accessToken'};
    const refreshToken = {test: 'refreshToken'};
    const profileData = {
      provider: 'testProvider',
      id: 'testId'
    };

    await verify(req, accessToken, refreshToken, profileData, done);

    expect(authorize).toBeCalledWith(
      'testUserId',
      'testProvider',
      'testId',
      profileData,
      {
        accessToken,
        refreshToken
      }
    );

    expect(done.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    null,
    Object {
      "test": "user",
    },
    Object {
      "profile": Object {
        "test": "profile",
      },
    },
  ],
]
`);

    clean();
  });

  describe('Initialize Method', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should call passport method', async () => {
      const callback = jest
        .fn()
        .mockImplementation((_, __, next) => next(null));

      const authenticate = jest.fn().mockReturnValue(callback);

      passport.__setAuthenticate(authenticate);

      const clean = scheme({
        app,
        UserModel,
        name: 'testInitializeMethod',
        mode: 'authenticate',
        options: {},
        Strategy: jest.fn().mockReturnThis(),
        session: false
      });

      const testInitializeMethod = cps('testInitializeMethod', UserModel);

      await testInitializeMethod({}, {}, undefined);

      expect(authenticate).toHaveBeenLastCalledWith('testInitializeMethod', {
        session: false,
        callbackURL: '/api/Users/testInitializeMethod/callback'
      });

      await testInitializeMethod(
        {},
        {},
        JSON.stringify({
          successRedirect: 'testSuccessRedirect',
          failureRedirect: 'testFailureRedirect',
          scope: ['test']
        })
      );

      expect(authenticate).toHaveBeenLastCalledWith('testInitializeMethod', {
        session: false,
        callbackURL:
          '/api/Users/testInitializeMethod/callback?successRedirect=testSuccessRedirect&failureRedirect=testFailureRedirect',
        scope: ['test']
      });

      clean();
    });
  });
});
