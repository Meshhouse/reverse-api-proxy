import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyCaching from 'fastify-caching';
import fastifySensible from 'fastify-sensible';

import * as schemas from './schemas';
import * as SFMLab from './handlers/sfmlab';
import * as Smutbase from './handlers/smutbase';
import * as Open3DLab from './handlers/open3dlab';

const server = fastify({
  logger: {
    level: 'info',
    prettyPrint: true
  }
});

const cacheTTL = 1000 * 60 * 5; // in milliseconds
const cacheTTLSingle = 1000 * 60 * 60;

void server.register(fastifySensible);

void server.register(fastifyCors, {
  origin: true,
  methods: ['GET']
});

void server.register(fastifyCaching, {
  privacy: 'private'
});

server.route({
  method: 'GET',
  url: '/integrations/sfmlab/models',
  schema: schemas.SFMLab.getModels,
  handler: (request, reply) => {
    const query = request.query as SFMLabQuery;
    const key = Buffer.from(JSON.stringify(query)).toString('base64');

    (server as any).cache.get(`sfmlab-get-models$key=${key}`, async(err: string, obj: any) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await SFMLab.getModels(query);

          (server as any).cache.set(`sfmlab-get-models$key=${key}`, fetch, cacheTTL, (err: string) => {
            if (err) {
              void reply.send(server.httpErrors.badRequest(err));
            }
            void reply.send(fetch);
          });
        } catch (err) {
          void reply.send(server.httpErrors.badRequest(err));
        }
      }
    });
  }
});

server.route({
  method: 'GET',
  url: '/integrations/sfmlab/models/:id',
  schema: schemas.SFMLab.getSingleModel,
  handler: (request, reply) => {
    const query = request.params as SFMLabQuerySingle;
    const key: number = query.id ?? 0;

    (server as any).cache.get(`sfmlab-get-models-single$id=${key}`, async(err: string, obj: SFMLabSingleModelCache | null) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await SFMLab.getSingleModel(query);

          (server as any).cache.set(`sfmlab-get-models-single$id=${key}`, fetch, cacheTTLSingle, (err: string) => {
            if (err) {
              void reply.send(server.httpErrors.badRequest(err));
            }
            void reply.send(fetch);
          });
        } catch (err) {
          void reply.send(server.httpErrors.badRequest(err));
        }
      }
    });
  }
});

server.route({
  method: 'GET',
  url: '/integrations/open3dlab/models',
  schema: schemas.SFMLab.getModels,
  handler: (request, reply) => {
    const query = request.query as SFMLabQuery;
    const key = Buffer.from(JSON.stringify(query)).toString('base64');

    (server as any).cache.get(`open3dlab-get-models$key=${key}`, async(err: string, obj: any) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await Open3DLab.getModels(query);

          (server as any).cache.set(`open3dlab-get-models$key=${key}`, fetch, cacheTTL, (err: string) => {
            if (err) {
              void reply.send(server.httpErrors.badRequest(err));
            }
            void reply.send(fetch);
          });
        } catch (err) {
          void reply.send(server.httpErrors.badRequest(err));
        }
      }
    });
  }
});

server.route({
  method: 'GET',
  url: '/integrations/open3dlab/models/:id',
  schema: schemas.SFMLab.getSingleModel,
  handler: (request, reply) => {
    const query = request.params as SFMLabQuerySingle;
    const key: number = query.id ?? 0;

    (server as any).cache.get(`open3dlab-get-models-single$id=${key}`, async(err: string, obj: SFMLabSingleModelCache | null) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await Open3DLab.getSingleModel(query);

          (server as any).cache.set(`open3dlab-get-models-single$id=${key}`, fetch, cacheTTLSingle, (err: string) => {
            if (err) {
              void reply.send(server.httpErrors.badRequest(err));
            }
            void reply.send(fetch);
          });
        } catch (err) {
          void reply.send(server.httpErrors.badRequest(err));
        }
      }
    });
  }
});

server.route({
  method: 'GET',
  url: '/integrations/smutbase/models',
  schema: schemas.SFMLab.getModels,
  handler: (request, reply) => {
    const query = request.query as SFMLabQuery;
    const key = Buffer.from(JSON.stringify(query)).toString('base64');

    (server as any).cache.get(`smutbase-get-models$key=${key}`, async(err: string, obj: any) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await Smutbase.getModels(query);

          (server as any).cache.set(`smutbase-get-models$key=${key}`, fetch, cacheTTL, (err: string) => {
            if (err) {
              void reply.send(server.httpErrors.badRequest(err));
            }
            void reply.send(fetch);
          });
        } catch (err) {
          void reply.send(server.httpErrors.badRequest(err));
        }
      }
    });
  }
});

server.route({
  method: 'GET',
  url: '/integrations/smutbase/models/:id',
  schema: schemas.SFMLab.getSingleModel,
  handler: (request, reply) => {
    const query = request.params as SFMLabQuerySingle;
    const key: number = query.id ?? 0;

    (server as any).cache.get(`smutbase-get-models-single$id=${key}`, async(err: string, obj: SFMLabSingleModelCache | null) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await Smutbase.getSingleModel(query);

          (server as any).cache.set(`smutbase-get-models-single$id=${key}`, fetch, cacheTTLSingle, (err: string) => {
            if (err) {
              void reply.send(server.httpErrors.badRequest(err));
            }
            void reply.send(fetch);
          });
        } catch (err) {
          void reply.send(server.httpErrors.badRequest(err));
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
