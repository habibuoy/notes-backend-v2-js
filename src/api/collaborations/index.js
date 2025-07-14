const { CollaborationsHandler } = require('./handler');
const { routes } = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collabService, notesService, validator }) => {
    const collabHandler = new CollaborationsHandler(collabService, notesService, validator);
    const collabRoutes = routes(collabHandler);

    server.route(collabRoutes);
  },
};
