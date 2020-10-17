import { server } from '../server';
import {
  FastifyReply,
  FastifyRequest,
  RouteOptions
} from 'fastify';

import * as schemas from '../schemas';
import * as SFMLab from '../handlers/sfmlab';
import * as Smutbase from '../handlers/smutbase';
import * as Open3DLab from '../handlers/open3dlab';
import * as ModelHaven3D from '../handlers/3dmodelhaven';

const cacheTTL = 1000 * 60 * 5;
const cacheTTLSingle = 1000 * 60 * 60;

// SFMLab related routes
/**
 * /integrations/sfmlab/models
 */
export const SFMLabGetModels: RouteOptions = {
  method: 'GET',
  url: '/integrations/sfmlab/models',
  schema: schemas.SFMLab.getModels,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
    const query = request.query as SFMLabQuery;
    const key = Buffer.from(JSON.stringify(query)).toString('base64');

    (server as any).cache.get(`sfmlab-get-models$key=${key}`, async(err: string, obj: SFMLabModelsCache) => {
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
};
/**
 * /integrations/sfmlab/models/:id
 */
export const SFMLabGetModelsSingle: RouteOptions = {
  method: 'GET',
  url: '/integrations/sfmlab/models/:id',
  schema: schemas.SFMLab.getSingleModel,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
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
};

// Smutbase related routes
/**
 * /integrations/smutbase/models
 */
export const SmutbaseGetModels: RouteOptions = {
  method: 'GET',
  url: '/integrations/smutbase/models',
  schema: schemas.SFMLab.getModels,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
    const query = request.query as SFMLabQuery;
    const key = Buffer.from(JSON.stringify(query)).toString('base64');

    (server as any).cache.get(`smutbase-get-models$key=${key}`, async(err: string, obj: SFMLabModelsCache) => {
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
};
/**
 * /integrations/smutbase/models/:id
 */
export const SmutbaseGetModelsSingle: RouteOptions = {
  method: 'GET',
  url: '/integrations/smutbase/models/:id',
  schema: schemas.SFMLab.getSingleModel,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
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
};


// Open3DLab related routes
/**
 * /integrations/open3dlab/models
 */
export const Open3DLabGetModels: RouteOptions = {
  method: 'GET',
  url: '/integrations/open3dlab/models',
  schema: schemas.SFMLab.getModels,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
    const query = request.query as SFMLabQuery;
    const key = Buffer.from(JSON.stringify(query)).toString('base64');

    (server as any).cache.get(`open3dlab-get-models$key=${key}`, async(err: string, obj: SFMLabModelsCache) => {
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
};
/**
 * /integrations/open3dlab/models/:id
 */
export const Open3DLabModelsSingle: RouteOptions = {
  method: 'GET',
  url: '/integrations/open3dlab/models/:id',
  schema: schemas.SFMLab.getSingleModel,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
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
};

// 3DModelHaven related routes
/**
 * /integrations/3dmodelhaven/models
 */
export const ModelHaven3DGetModels: RouteOptions = {
  method: 'GET',
  url: '/integrations/3dmodelhaven/models',
  schema: schemas.ModelHaven3D.getModels,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
    const query = request.query as ModelHaven3DQuery;
    const key = Buffer.from(JSON.stringify(query)).toString('base64');

    (server as any).cache.get(`3dmodelhaven-get-models$key=${key}`, async(err: string, obj: any) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await ModelHaven3D.getModels(query);

          (server as any).cache.set(`3dmodelhaven-get-models$key=${key}`, fetch, cacheTTL, (err: string) => {
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
};
/**
 * /integrations/3dmodelhaven/models/:id
 */
export const ModelHaven3DModelsSingle: RouteOptions = {
  method: 'GET',
  url: '/integrations/3dmodelhaven/models/:id',
  schema: schemas.ModelHaven3D.getSingleModel,
  handler: (request: FastifyRequest, reply: FastifyReply): void => {
    const query = request.params as SFMLabQuerySingle;
    const key: number = query.id ?? 0;

    (server as any).cache.get(`3dmodelhaven-get-models-single$id=${key}`, async(err: string, obj: SFMLabSingleModelCache | null) => {
      if (obj !== null) {
        void reply.send(obj.item);
      } else {
        try {
          const fetch = await Open3DLab.getSingleModel(query);

          (server as any).cache.set(`3dmodelhaven-get-models-single$id=${key}`, fetch, cacheTTLSingle, (err: string) => {
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
};
