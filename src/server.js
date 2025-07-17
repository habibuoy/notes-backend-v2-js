const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const path = require('path');
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
const { CollaborationsService } = require('./services/postgres/CollaborationsService');
const { CollaborationsValidator } = require('./validator/collaborations');
const collaborations = require('./api/collaborations');
const ProducerService = require('./services/rabbitmq/ProducerService');
const { ExportsValidator } = require('./validator/exports');
const exportsPlugin = require('./api/exports');
const { AwsStorageService } = require('./services/storage/AwsStorageService');
const { UploadValidator } = require('./validator/uploads');
const uploadPlugin = require('./api/uploads');

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
    {
      plugin: Inert,
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
        id: artifacts.decoded.payload.userId,
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

    if (response instanceof Error
        && response.output.statusCode >= 500
        && response.output.statusCode < 600
    ) {
      console.error('Unexpected error has occurred on request', request.info, response);
    }

    return h.continue;
  });

  const collabService = new CollaborationsService();
  const notesService = new NotesService(collabService);

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

  await server.register({
    plugin: collaborations,
    options: {
      collabService,
      notesService,
      validator: CollaborationsValidator,
    },
  });

  await server.register({
    plugin: exportsPlugin,
    options: {
      service: ProducerService,
      validator: ExportsValidator,
    },
  });

  const storageService = new AwsStorageService();
  await server.register({
    plugin: uploadPlugin,
    options: {
      service: storageService,
      validator: UploadValidator,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
