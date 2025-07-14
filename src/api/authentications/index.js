const { AuthenticationsHandler } = require('./handler');
const { routes } = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authService, userService, validator, tokenManager,
  }) => {
    const authHandlers = new AuthenticationsHandler(
      authService,
      userService,
      tokenManager,
      validator,
    );

    const authRoutes = routes(authHandlers);

    server.route(authRoutes);
  },
};
