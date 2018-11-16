module.exports = (Model, method) => {
  Model.settings.acls.push({
    principalType: 'ROLE',
    principalId: '$everyone',
    permission: 'ALLOW',
    property: method
  });
};
