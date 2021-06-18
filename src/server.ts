import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyCaching from 'fastify-caching';
import fastifySensible from 'fastify-sensible';
import dotenv from 'dotenv';

import { SFMLabAuthenticate } from './models/got';

import * as routes from './routes';

dotenv.config();

export const server = fastify({
  logger: {
    level: 'info',
    prettyPrint: true
  }
});

void (async(): Promise<void> => {
  await SFMLabAuthenticate();
  // Register modules
  void server.register(fastifySensible);
  void server.register(fastifyCors, {
    methods: ['GET']
  });
  void server.register(fastifyCaching, {
    privacy: 'private'
  });

  // Register routes
  server.route(routes.SFMLabGetModels);
  server.route(routes.SFMLabGetModelsSingle);
  server.route(routes.SmutbaseGetModels);
  server.route(routes.SmutbaseGetModelsSingle);
  server.route(routes.Open3DLabGetModels);
  server.route(routes.Open3DLabModelsSingle);
  server.route(routes.ModelHaven3DGetModels);

  server.listen(3280, '0.0.0.0', (err, address) => {
    if(err) {
      console.error(err);
      process.exit(1);
    }
  });
})();

