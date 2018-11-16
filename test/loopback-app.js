const loopback = require('loopback');

module.exports = () => {
  const app = loopback();
  app.dataSource('db', {connector: 'memory'});

  app.model(loopback.User, {dataSource: 'db'});
  app.model(loopback.AccessToken, {dataSource: 'db'});

  app.set('restApiRoot', '/api');

  return app;
};
