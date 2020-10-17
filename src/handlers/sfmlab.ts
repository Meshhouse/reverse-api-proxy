import got from 'got';
import cheerio from 'cheerio';
import { isDownloadLink } from '../helpers/typings';
//import config from '../config.json';
//import setCookie from 'set-cookie-parser';
//import FormData from 'form-data';
import SanitizeHTML from 'sanitize-html';

const gotInstance = got.extend({
  prefixUrl: 'https://sfmlab.com',
  timeout: 30000,
  responseType: 'text'
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
 * Find all commentaries for model from custom elements root
 * @param container Custom element root
 */
function getComments(container: cheerio.Root): Comment[] {
  const comments = container('comment-element');
  const commentsArray = [];

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];

    const message = comment.attribs['comment'];

    const dateSanitized = comment.attribs['submit_date'].replace(/;|,|\./gm, '');
    const date = new Date(dateSanitized).getTime();

    const avatar = comment.attribs['useravatar'];
    const avatarLink = avatar.includes('https://') ? avatar : `https://sfmlab.com${avatar}`;

    const username = comment.attribs['username'];

    commentsArray.push({
      username: username,
      avatar: avatarLink,
      message: message,
      date: date
    });
  }

  return commentsArray;
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
      const link: string = (links.get()[i].attribs['href']).substr(1);
      const downloadPage = await gotInstance(link);
      const dom = cheerio.load(downloadPage.body);

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
      const title = body('.entry__body .entry__title a')?.html() ?? '';
      const link = body('.entry__body .entry__title a')?.attr('href');
      const id = (link?.match(/\d+/) as string[])[0];
      const image = body('.entry__heading a img')?.attr('src') ?? '';
      const category = body('.entry__tags .entry__tag')?.html() ?? '';

      models.push({
        id: Number(id),
        name: title,
        image: image,
        extension: '.sfm',
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
/**
 * Fetch single model by project ID
 * @param query Query object
 */
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

      const commentsRoot = cheerio.load((await gotInstance(`project/${id}/comments`)).body, {
        xmlMode: true
      });

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

/*export async function handleAuthentication(): Promise<any | Error> {
  try {
    const root = await gotInstance('accounts/login');
    //const root = await axiosInstance.get('/accounts/login');
    const rawCSRF = root.headers['set-cookie'];
    const cookie = setCookie.parse(rawCSRF);
    console.log(cookie);
    const token: string = cookie[0].value;

    const headers = {
      'X-CSRFToken': token,
      'Cookie': [
        `csrftoken=${token}`
      ]
    };

    console.log(headers);

    const form = new FormData();
    form.append('login', config.credentials.sfmlab.login);
    form.append('password', config.credentials.sfmlab.password);

    const response = await gotInstance.post('accounts/login/', {
      headers: headers,
      form: form,
      searchParams: {
        'next': '/'
      },
      followRedirect: false,
    });

    console.log(response.headers);
    console.log(response.url);
    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err);
  }
}*/
