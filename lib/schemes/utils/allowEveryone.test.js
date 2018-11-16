const allow = require('./allowEveryone');

describe('Allow everyone to execute method', () => {
  it('should add settings.acls', () => {
    const Model = {
      settings: {acls: []}
    };

    const method = 'test';

    allow(Model, method);

    expect(Model.settings.acls).toMatchInlineSnapshot(`
Array [
  Object {
    "permission": "ALLOW",
    "principalId": "$everyone",
    "principalType": "ROLE",
    "property": "test",
  },
]
`);
  });
});
