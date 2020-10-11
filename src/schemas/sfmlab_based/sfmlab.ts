export const getSingleModel = {
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
        size: { type: 'string' },
        downloadLinks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              link: { type: 'string' },
              filename: { type: 'string' }
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

export const getModels = {
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
              category: { type: 'string' }
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

export default {
  getModels,
  getSingleModel
};
