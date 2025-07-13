const { UserHandler } = require('./handler');
const { routes } = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: (server, { service, validator }) => {
    const usersHandler = new UserHandler(service, validator);
    const usersRoutes = routes(usersHandler);

    server.route(usersRoutes);
  },
};
