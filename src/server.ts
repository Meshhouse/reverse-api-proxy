import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyCaching from 'fastify-caching';

import * as schemas from './schemas';
import * as SFMLab from './handlers/sfmlab';

const server = fastify({
  logger: false
});

const cacheTTL = 1000 * 60 * 5; // in milliseconds
const cacheTTLSingle = 1000 * 60 * 60;

server.register(fastifyCors, {
  origin: true,
  methods: ['GET']
});

server.register(fastifyCaching, {
  privacy: 'private'
});

server.route({
  method: 'GET',
  url: '/api/integrations/sfmlab/models',
  schema: schemas.SFMLab.getModels,
  handler: (request, reply) => {
    const key = Buffer.from(JSON.stringify(request.query)).toString('base64');

    (server as any).cache.get(`sfmlab-get-models$key=${key}`, async(err: any, obj: any) => {
      if (obj !== null) {
        reply.send(obj.item);
      } else {
        try {
          const fetch = await SFMLab.getModels(request.query);

          (server as any).cache.set(`sfmlab-get-models$key=${key}`, fetch, cacheTTL, (err: any) => {
            if (err) {
              return reply.send(err);
            }
            reply.send(fetch);
          });
        } catch (err) {
          reply.send(err);
        }
      }
    });
  }
});

server.route({
  method: 'GET',
  url: '/api/integrations/sfmlab/models/single',
  schema: schemas.SFMLab.getSingleModel,
  handler: (request, reply) => {
    const key: number = (request.query as any).id ?? 0;

    (server as any).cache.get(`sfmlab-get-models-single$id=${key}`, async(err: any, obj: any) => {
      if (obj !== null) {
        reply.send(obj.item);
      } else {
        try {
          const fetch = await SFMLab.getSingleModel(request.query);

          (server as any).cache.set(`sfmlab-get-models-single$id=${key}`, fetch, cacheTTLSingle, (err: any) => {
            if (err) {
              return reply.send(err);
            }
            reply.send(fetch);
          });
        } catch (err) {
          reply.send(err);
        }
      }
    });
  }
});

server.listen(3280, '0.0.0.0', (err, address) => {
  if(err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
