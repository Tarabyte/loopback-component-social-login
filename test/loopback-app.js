const loopback = require('loopback');

module.exports = () => {
  const app = loopback();
  app.dataSource('db', {connector: 'memory'});

  app.model(loopback.User, {dataSource: 'db'});

  return app;
};
