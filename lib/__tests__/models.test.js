const socialLogin = require('../');
const makeLoopbackApp = require('loopback-app');

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
});
