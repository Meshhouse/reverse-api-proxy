import {
  getLicenses,
  getCategories,
  getComments,
  detectLastPage
} from '../handlers/sfmlab_based';
import got from 'got';
import cheerio from 'cheerio';
import { isDownloadLink } from '../helpers/typings';
import { slugifyToExtension } from '../helpers';
import SanitizeHTML from 'sanitize-html';

const gotInstance = got.extend({
  prefixUrl: 'https://smutba.se',
  timeout: 30000,
  responseType: 'text'
});

/**
 * Fetch download links from single model poge
 * @param parser Cheerio parser instance
 */
async function getDownloadLinks(parser: cheerio.Root): Promise<SFMLabLink[] | Error> {
  const linksArray: SFMLabLink[] = [];

  const links = parser('.content-container .main-upload table tbody tr td a:first-of-type');

  try {
    for (let i = 0; i < links.length; i++) {
      const link: string = (links.get()[i].attribs['href']).substr(1);
      const downloadPage = await gotInstance(link);
      const dom = cheerio.load(downloadPage.body);

      const downloadLink = dom('.content-container .main-upload .project-description-div p:first-child a');

      const filename = downloadLink.attr('href')?.match(/[a-zA-Z0-9_.]+(?=\?)/gm);

      if (downloadLink !== null) {
        linksArray.push({
          link: downloadLink.attr('href') ?? '',
          filename: (filename as any)[0] ?? ''
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
 * @param query Query object
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
    const root = await gotInstance('', {
      searchParams: params
    });

    const parser = cheerio.load(root.body);

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
      const title = body('.entry__body .entry__title a')?.text() ?? '';
      const link = body('.entry__body .entry__title a')?.attr('href');
      const id = (link?.match(/\d+/) as string[])[0];
      const image = body('.entry__heading a img')?.attr('src') ?? '';
      const category = body('.entry__tags .entry__tag')?.html() ?? '';

      models.push({
        id: Number(id),
        name: title,
        image: image,
        extension: '.blend',
        mature_content: true,
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
      const root = await gotInstance(`project/${id}`);
      const parser = cheerio.load(root.body);

      const title = parser('.container #file_title').text();
      const description = parser('.content-container .main-upload .panel .panel__body').html() ?? '';
      const fileSize = parser('.content-container .main-upload table tbody tr:first-child td:last-child').text();
      const domImages = parser('.content-container .main-upload .text-center a picture.project-detail-image-main img');

      const category = parser('.content-container .side-upload .panel__footer dl:nth-child(5) dd').text();

      const commentsRoot = cheerio.load((await gotInstance(`project/${id}/comments`)).body);

      const images: string[] = [];

      const downloadLinks = await getDownloadLinks(parser);
      const comments = getComments(commentsRoot);

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
        description: SanitizeHTML(description, {
          exclusiveFilter: ((frame) => {
            return !frame.text.trim();
          })
        }),
        images: images,
        size: fileSize,
        downloadLinks: isDownloadLink(downloadLinks) ? downloadLinks : [],
        comments: comments
      };

      return model;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return Promise.reject('model id is required');
}
