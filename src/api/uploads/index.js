const { UploadHandler } = require('./handler');
const { routes } = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: (server, { service, validator }) => {
    const uploadsHandler = new UploadHandler(service, validator);
    const uploadRoutes = routes(uploadsHandler);

    server.route(uploadRoutes);
  },
};
