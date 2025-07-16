const { ExportHandler } = require('./handler');
const { routes } = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: (server, { service, validator }) => {
    const exportsHandler = new ExportHandler(service, validator);
    const exportsRoutes = routes(exportsHandler);

    server.route(exportsRoutes);
  },
};
