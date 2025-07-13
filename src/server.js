const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const { NotesService } = require('./services/postgres/NotesService');
const { NotesValidator } = require('./validator/notes');
const ClientError = require('./exceptions/ClientError');
const { UserService } = require('./services/postgres/UserService');
const { UsersValidator } = require('./validator/users');
const users = require('./api/users');
require('dotenv').config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  const notesService = new NotesService();

  await server.register({
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  });

  const userService = new UserService();

  await server.register({
    plugin: users,
    options: {
      service: userService,
      validator: UsersValidator,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
