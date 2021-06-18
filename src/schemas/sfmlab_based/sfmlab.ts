import { FastifySchema } from 'fastify';

export const getSingleModel: FastifySchema = {
  params: {
    id: {
      type: 'number'
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        extension: { type: 'string' },
        description: { type: 'string' },
        images: {
          type: 'array',
          items: { type: 'string' }
        },
        category: { type: 'string' },
        mature_content: { type: 'boolean' },
        size: { type: 'string' },
        downloadLinks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              link: { type: 'string' },
              filename: { type: 'string' },
              size: { type: 'string' }
            }
          }
        },
        comments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              avatar: { type: 'string' },
              message: { type: 'string' },
              date: { type: 'number' }
            }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
};

const sfmlabGetModelsShared = {
  querystring: {
    category: {
      type: 'number'
    },
    license: {
      type: 'number'
    },
    order: {
      type: 'string'
    },
    search: {
      type: 'string'
    },
    page: {
      type: 'number'
    }
  },
  headers: {
    'x-meshhouse-mature': {
      type: 'string'
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        models: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              image: { type: 'string' },
              extension: { type: 'string' },
              category: { type: 'string' },
              mature_content: { type: 'boolean' },
              tags: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              parentId: { type: 'number' },
              slug: { type: 'number' },
              name: { type: 'string' }
            }
          }
        },
        licenses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' }
            }
          }
        },
        totalPages: { type: 'number' }
      }
    },
    400: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
      }
    }
  }
};

export const getModels: FastifySchema = {
  ...sfmlabGetModelsShared
};

export default {
  getModels,
  getSingleModel
};
