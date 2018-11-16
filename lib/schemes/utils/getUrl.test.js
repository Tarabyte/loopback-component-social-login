const getUrl = require('./getUrl');

describe('getUrl', () => {
  it('should join model url w/ restApiRoot', () => {
    const app = {
      get: jest.fn().mockReturnValue('/api/')
    };

    const Model = {
      http: {
        path: '/Models'
      }
    };
    expect(getUrl(app, Model)).toBe('/api/Models');
  });
});
