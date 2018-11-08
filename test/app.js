const Model = jest.fn();
const ds = {
  name: 'db'
};

Model.getDataSource = jest.fn().mockReturnValue(ds);
Model.attachTo = jest.fn();
Model.belongsTo = jest.fn();
Model.hasMany = jest.fn();
Model.relations = {};
Model.findById = jest.fn().mockResolvedValue({});

module.exports = (overrides = {}) => ({
  middleware: jest.fn(),
  model: jest.fn(),
  registry: {
    findModel: jest.fn().mockReturnValue(Model),
    createModel: jest.fn().mockReturnValue(Model)
  },
  ...overrides
});
