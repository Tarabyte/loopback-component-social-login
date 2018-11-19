const schemes = require('../');

describe('All Schemes', () => {
  it('should expose well known schemes', () => {
    expect(schemes).toMatchObject({
      OAuth1: expect.any(Function),
      'OAuth2.0': expect.any(Function),
      Local: expect.any(Function)
    });
  });
});
