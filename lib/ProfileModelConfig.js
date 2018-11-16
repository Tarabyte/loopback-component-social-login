module.exports = {
  name: 'Profile',
  properties: {
    provider: {
      type: 'string',
      required: true
    },
    externalId: {
      type: 'string',
      required: true
    },
    profileData: {
      type: 'object'
    },
    credentials: {
      type: 'object'
    }
  },
  options: {
    base: 'PersistedModel',
    dataSource: null,
    acls: [
      {
        principalType: 'ROLE',
        principalId: '$everyone',
        permission: 'DENY',
        property: '*'
      },
      {
        principalType: 'ROLE',
        principalId: '$owner',
        permission: 'ALLOW',
        property: '*'
      }
    ]
  }
};
