import {
  sfmlabCookieJar,
  sfmlabRequest
} from '../models/got';
import {
  getLicenses,
  getCategories,
  getComments,
  detectLastPage,
  getDownloadLinks
} from '../handlers/sfmlab_based';
import cheerio from 'cheerio';
import { isDownloadLink } from '../helpers/typings';
import SanitizeHTML from 'sanitize-html';


/**
 * Fetch models, categories, licenses and total pages count
 * @param query Query object
 */
export async function getModels(query: SFMLabQuery, useCookies = false): Promise<SFMLabFetch | Error> {
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
    const root = await sfmlabRequest('', {
      searchParams: params,
      cookieJar: useCookies ? sfmlabCookieJar : undefined
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
      const tags = body('.entry__tags .entry__tag');

      let category = '';
      const modelTags: string[] = [];
      let matureContent = false;
      tags.each((idx, tag) => {
        modelTags.push(tag.children[0].data ?? '');
        if (tag.children[0].data === '18+') {
          matureContent = true;
        } else {
          category = tag.children[0].data ?? '';
        }
      });

      models.push({
        id: Number(id),
        name: title,
        image: image,
        extension: '.sfm',
        category: category,
        tags: modelTags,
        mature_content: matureContent
      });
    });

    return {
      models,
      licenses,
      categories,
      totalPages: lastPage
    };
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}
/**
 * Fetch single model by project ID
 * @param query Query object
 */
export async function getSingleModel(query: SFMLabQuerySingle): Promise<SFMLabModel | Error> {
  if (Object.hasOwnProperty.call(query, 'id')) {
    try {
      const id = query.id ?? 0;
      const root = await sfmlabRequest(`project/${id}`, {
        cookieJar: sfmlabCookieJar
      });
      const parser = cheerio.load(root.body);

      const title = parser('.container #file_title').text();
      const description = parser('.content-container .main-upload .panel .panel__body').html() ?? '';
      const fileSize = parser('.content-container .main-upload table tbody tr:first-child td:last-child').text();
      const domImages = parser('.content-container .main-upload .text-center a picture.project-detail-image-main img');

      const category = parser('.content-container .side-upload .panel__footer dl:nth-child(5) dd').text();
      const matureContent = parser('.content-container .main-upload .alert.alert-info strong').text() === 'Adult content';

      const commentsRoot = cheerio.load((await sfmlabRequest(`project/${id}/comments`, {
        cookieJar: sfmlabCookieJar
      })).body);
      const images: string[] = [];

      const downloadLinks = await getDownloadLinks(parser, sfmlabRequest, sfmlabCookieJar);
      const comments = getComments(commentsRoot);

      domImages.each((idx: number, element: cheerio.Element) => {
        images.push(element.attribs['src'] ?? '');
      });

      if (domImages.length === 0) {
        const thubmnail = parser('.content-container .side-upload .panel .panel__body img')?.attr('src') ?? '';
        images.push(thubmnail);
      }

      const model: SFMLabModel = {
        id: id,
        extension: '.sfm',
        category: category,
        name: title,
        description: SanitizeHTML(description, {
          exclusiveFilter: ((frame) => {
            return !frame.text.trim();
          })
        }),
        images: images,
        size: fileSize,
        mature_content: matureContent,
        downloadLinks: isDownloadLink(downloadLinks) ? downloadLinks : [],
        comments: comments
      };

      return model;
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }
  return Promise.reject('model id is required');
}
