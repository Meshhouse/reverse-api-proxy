import axios from 'axios';
import cheerio from 'cheerio';
import { isDownloadLink } from '../helpers/typings';
import { slugifyToExtension } from '../helpers';

const sfmlabInstance = axios.create({
  baseURL: 'https://smutba.se',
  responseType: 'text',
  timeout: 10000,
});

/**
 * Find all model license from select HTML element
 * @param options Select HTML element
 */
function getLicenses(options: cheerio.Cheerio): SFMLabLicense[] {
  const licenses: SFMLabLicense[] = [];

  options.each((idx: number, element: cheerio.Element) => {
    if (element.children[0].data !== '---------') {
      licenses.push({
        id: Number(element.attribs['value']),
        name: element.children[0].data ?? ''
      });
    }
  });

  return licenses;
}

/**
 * Find all categories from select HTML element
 * @param options Select HTML element
 */
function getCategories(options: cheerio.Cheerio): Category[] {
  const categories: Category[] = [];

  options.each((idx: number, element: cheerio.Element) => {
    if (element.children[0].data !== '---------') {
      categories.push({
        id: Number(element.attribs['value']),
        parentId: -1,
        slug: element.attribs['value'] ?? '',
        name: element.children[0].data ?? ''
      });
    }
  });
  return categories;
}

/**
 * Find total pages count
 * @param paginator Paginator element
 */
function detectLastPage(paginator: cheerio.Cheerio): number {
  const activeLink: string = paginator.find('li.active a').html() ?? '';
  const lastLink: string = paginator.find('li.last a').attr('href') ?? '';

  return lastLink !== ''
    ? Number(lastLink?.split('page=')[1])
    : Number(activeLink);
}

/**
 * Fetch download links from single model poge
 * @param parser Cheerio parser instance
 */
async function getDownloadLinks(parser: cheerio.Root): Promise<SFMLabLink[] | Error> {
  const linksArray: SFMLabLink[] = [];

  const links = parser('.content-container .main-upload table tbody tr td a:first-child');
  const filenames = parser('.content-container .main-upload table tbody tr td .js-edit-input__wrapper strong');

  try {
    for (let i = 0; i < links.length; i++) {
      const downloadPage = await sfmlabInstance.get(links.get()[i].attribs['href']);
      const dom = cheerio.load(downloadPage.data);

      const downloadLink = dom('.content-container .main-upload .project-description-div p:first-child a');

      if (downloadLink !== null) {
        linksArray.push({
          link: downloadLink.attr('href') ?? '',
          filename: filenames.get(i).children[0].data ?? ''
        });
      }
    }
    return linksArray;
  } catch (err) {
    return new Error(err);
  }
}

/**
 * Fetch models, categories, licenses and total pages count
 */
export async function getModels(query: SFMLabQuery): Promise<SFMLabFetch | Error> {
  const params: SFMLabParams = {};

  if (Object.hasOwnProperty.call(query, 'category') && query.category !== -1) {
    params.category = query.category;
  }

  if (Object.hasOwnProperty.call(query, 'order') && query.order === 'DESC') {
    params.order_by = 'created';
  }

  if (Object.hasOwnProperty.call(query, 'license') && query.license !== -1) {
    params.license = query.license;
  }

  if (Object.hasOwnProperty.call(query, 'search') && query.search !== '') {
    params.search_text = query.search;
  }

  if (Object.hasOwnProperty.call(query, 'page')) {
    params.page = query.page;
  }

  try {
    const root = await sfmlabInstance.get('/', {
      params: params
    });

    const parser = cheerio.load(root.data);

    const body = parser('.content-container .entry-content .entry-list .entry');
    const options = parser('#id_category option');
    const lics = parser('#id_license option');

    const paginator = parser('.content-container .pagination');

    const models: SFMLabModel[] = [];
    const licenses = getLicenses(lics);
    const categories = getCategories(options);
    const lastPage = detectLastPage(paginator);

    body.each((idx: number, element: cheerio.Element) => {
      const body = cheerio.load(element);
      const title = body('.entry__body .entry__title a')?.html() ?? '';
      const link = body('.entry__body .entry__title a')?.attr('href');
      const id = (link?.match(/\d+/) as string[])[0];
      const image = body('.entry__heading a img')?.attr('src') ?? '';
      const category = body('.entry__tags .entry__tag')?.html() ?? '';

      models.push({
        id: Number(id),
        name: title,
        image: image,
        extension: slugifyToExtension(category),
        category: category,
      });
    });

    return {
      models,
      licenses,
      categories,
      totalPages: lastPage
    };
  } catch (err) {
    return Promise.reject(err);
  }
}


export async function getSingleModel(query: SFMLabQuerySingle): Promise<SFMLabModel | Error> {
  if (Object.hasOwnProperty.call(query, 'id')) {
    try {
      const id = query.id ?? 0;
      const root = await sfmlabInstance.get(`/project/${id}`);
      const parser = cheerio.load(root.data);

      const title = parser('.container #file_title').text();
      const description = parser('.content-container .main-upload .panel .panel__body').html() ?? '';
      const fileSize = parser('.content-container .main-upload table tbody tr:first-child td:last-child').text();
      const domImages = parser('.content-container .main-upload .text-center a picture.project-detail-image-main img');

      const category = parser('.content-container .side-upload .panel__footer dl:nth-child(5) dd').text();

      const images: string[] = [];

      const downloadLinks = await getDownloadLinks(parser);

      domImages.each((idx: number, element: cheerio.Element) => {
        images.push(element.attribs['src'] ?? '');
      });

      if (domImages.length === 0) {
        const thubmnail = parser('.content-container .side-upload .panel .panel__body img')?.attr('src') ?? '';
        images.push(thubmnail);
      }

      const model = {
        id: id,
        extension: slugifyToExtension(category),
        category: category,
        name: title,
        description: description,
        images: images,
        size: fileSize,
        downloadLinks: isDownloadLink(downloadLinks) ? downloadLinks : []
      };

      return model;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return Promise.reject('model id is required');
}
