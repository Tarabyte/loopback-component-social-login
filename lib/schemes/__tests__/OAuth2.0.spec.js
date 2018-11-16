const scheme = require('../OAuth2.0');
const makeLoopbackApp = require('loopback-app');
const passport = require('passport');

jest.mock('passport', () => ({
  use: jest.fn(),
  unuse: jest.fn()
}));

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
    const options = {test: 1};

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
});
