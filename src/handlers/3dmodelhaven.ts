import got from 'got';
import cheerio from 'cheerio';

const gotInstance = got.extend({
  prefixUrl: 'https://3dmodelhaven.com',
  timeout: 30000,
  responseType: 'text'
});

const pageLimit = 25;

/**
 * Find all categories from select HTML element
 * @param options Select HTML element
 */
function getCategories(options: cheerio.Cheerio): Category[] {
  const categories: Category[] = [];

  options.each((idx: number, element: cheerio.Element) => {
    const body = cheerio.load(element);
    const title = body('li').contents()[1].data ?? '';
    const link = element.attribs['href'];
    const slug = link.split('c=')[1];

    if (slug !== undefined) {
      categories.push({
        id: idx,
        parentId: -1,
        slug: slug,
        name: title
      });
    }
  });
  return categories;
}

/**
 * Fetch models, categories, licenses and total pages count
 */
export async function getModels(query: ModelHaven3DQuery): Promise<ModelHaven3DFetch | Error> {
  let page = 0;
  const params: ModelHaven3DParams = {
    o: 'date_published'
  };

  if (Object.hasOwnProperty.call(query, 'category') && query.category !== '') {
    params.c = query.category;
  }

  if (Object.hasOwnProperty.call(query, 'search') && query.search !== '') {
    params.s = query.search;
  }

  if (Object.hasOwnProperty.call(query, 'page')) {
    page = query.page ?? 0;
  }

  try {
    const root = await gotInstance('models', {
      searchParams: params
    });

    const parser = cheerio.load(root.body);

    const body = parser('#item-grid a');
    const categoriesElements = parser('.category-list-wrapper #category-list a');

    const models: ModelHaven3DModel[] = [];
    const categories = getCategories(categoriesElements);

    body.each((idx: number, element: cheerio.Element) => {
      const body = cheerio.load(element);
      const title = body('.grid-item .title-line')?.text() ?? '';
      const link = element.attribs['href'];
      const id = link.split('?m=')[1];
      const image = `https://3dmodelhaven.com${ body('.grid-item img.thumbnail')?.attr('data-src') ?? '' }`;

      models.push({
        id: id,
        name: title,
        image: image,
        extension: '.blend'
      });
    });

    const pages = Math.ceil(models.length / pageLimit);

    const from = (page <= 1 ? 0 : page - 1) * pageLimit;
    const to = (page + 1) * pageLimit;
    const limitedModels = models.slice(from, to);

    return {
      models: limitedModels,
      categories,
      totalPages: pages
    };
  } catch (err) {
    return Promise.reject(err);
  }
}
