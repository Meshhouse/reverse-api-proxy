import { fastifyPlugin } from 'fastify';

interface FastifyCachingOptions {
  privacy: 'no-cache' | 'public' | 'private';
  expiresIn: number;
  cache: {
    get (key: string, callback: any),
    set (key: string)
  },
  cacheSegment: string;
}

export interface FastifyCachingCacheSet {
  (key: string, value: any, ttl: number, callback: CallableFunction): void
}

export interface FastifyCachingCacheGet {
  (key: string, callback: CallableFunction): void
}

declare module 'fastify' {
  interface FastifyInstance {
    cache: {
      set: FastifyCachingCacheSet,
      get: FastifyCachingCacheGet
    }
  }
}

export const fastifyCaching: FastifyPlugin<FastifyCachingOptions>;

export default fastifyCaching;
