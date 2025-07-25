const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload/images',
    handler: (request, h) => handler.postUploadImagesHandler(request, h),
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = { routes };
