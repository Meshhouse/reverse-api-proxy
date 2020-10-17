import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyCaching from 'fastify-caching';
import fastifySensible from 'fastify-sensible';

import * as routes from './routes';

export const server = fastify({
  logger: {
    level: 'info',
    prettyPrint: true
  }
});

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

  console.log(`Server listening at ${address}`);
});
