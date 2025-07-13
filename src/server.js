const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const notes = require('./api/notes');
const { NotesService } = require('./services/postgres/NotesService');
const { NotesValidator } = require('./validator/notes');
const ClientError = require('./exceptions/ClientError');
const { UserService } = require('./services/postgres/UserService');
const { UsersValidator } = require('./validator/users');
const users = require('./api/users');
const { AuthenticationsService } = require('./services/postgres/AuthenticationsService');
const { AuthenticationsValidator } = require('./validator/authentications');
const authentications = require('./api/authentications');
const TokenManager = require('./tokenize/TokenManager');
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

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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

  const authService = new AuthenticationsService();

  await server.register({
    plugin: authentications,
    options: {
      authService,
      userService,
      validator: AuthenticationsValidator,
      tokenManager: TokenManager,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
