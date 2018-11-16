const socialLogin = require('../');
const makeLoopbackApp = require('loopback-app');
const makeApp = require('app');

describe('Profile Model', () => {
  it('should create Profile Model', () => {
    const app = makeLoopbackApp();
    socialLogin(app);

    expect(typeof app.models.Profile).toBe('function');
  });

  it('should skip Model Creation if ProfileModelConfig is null', () => {
    const app = makeLoopbackApp();
    socialLogin(app, {ProfileModelConfig: null});

    expect(typeof app.models.Profile).toBe('undefined');
  });

  it('should extract Profile Model from User Model relation if config is null', () => {
    const User = jest.fn();
    const Profile = jest.fn();

    User.relations = {
      profiles: {
        modelTo: Profile
      }
    };

    const app = makeApp({
      registry: {
        findModel: jest.fn().mockReturnValue(User)
      }
    });

    const login = socialLogin(app, {ProfileModelConfig: null});

    expect(login.ProfileModel).toBe(Profile);
  });
});
