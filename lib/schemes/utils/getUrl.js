module.exports = (app, Model, ...rest) =>
  '/' +
  [...app.get('restApiRoot').split('/'), ...Model.http.path.split('/'), ...rest]
    .filter(Boolean)
    .join('/');
