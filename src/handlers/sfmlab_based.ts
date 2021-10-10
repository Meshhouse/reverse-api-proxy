import cheerio from 'cheerio';
import {
  parse,
  format,
  isValid
} from 'date-fns';
import type { CookieJar } from 'tough-cookie';

/**
 * Find all model license from select HTML element
 * @param options Select HTML element
 */
export function getLicenses(options: cheerio.Cheerio): SFMLabLicense[] {
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
export function getCategories(options: cheerio.Cheerio): Category[] {
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
export function getComments(parser: cheerio.Root): Comment[] {
  const comments = parser('.comments .comment');
  const commentsArray = [];

  for (let i = 0; i < comments.length; i++) {
    const comment = comments.get()[i];
    const commentBody = cheerio.load(comment);

    const message = commentBody('.comment__body .comment__content .content').text() || '';

    const meta = commentBody('.comment__meta .comment__meta-left').text();
    const postedDate = (meta.match(/(?<=posted\s+on\s+).+(?=\.)/gm) as string[])[0] + '.';
    let parsedDate = null;
    // SFMLab is wrecked up timestamps
    parsedDate = parse(postedDate, 'LLLL d, yyyy, h:mm aaaa', new Date('February 15, 2021 19:23:00'));

    if (!isValid(parsedDate)) {
      parsedDate = parse(postedDate, 'LLLL d, yyyy, h aaaa', new Date('February 15, 2021 19:23:00'));
    }

    if (!isValid(parsedDate)) {
      parsedDate = new Date(0);
    }

    const date = format(parsedDate, 'T');

    const avatarLink = commentBody('.comment__body .comment_avatar').get()[0].attribs['src'];
    const username = commentBody('.comment__meta .comment__meta-left .username').text()
    || commentBody('.comment__meta .comment__meta-left').text().split(' ')[0];

    commentsArray.push({
      username: username,
      avatar: avatarLink,
      message: message,
      date: Number(date)
    });
  }

  return commentsArray;
}

/**
 * Find total pages count
 * @param paginator Paginator element
 */
export function detectLastPage(paginator: cheerio.Cheerio): number {
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
export async function getDownloadLinks(parser: cheerio.Root, gotInstance: any, cookieJar?: CookieJar): Promise<SFMLabLink[] | Error> {
  const linksArray: SFMLabLink[] = [];

  const linkInfo = parser('.content-container .main-upload table tbody tr td[data-file-id]');
  const links = parser('.content-container .main-upload table tbody tr td[colspan="9"] ul.download-set li.download-container:first-child a');

  try {
    for (let i = 0; i < links.length; i++) {
      const linkRow = cheerio.load(linkInfo[i].parent);
      const link: string = (links.get()[i].attribs['href']).substr(1);
      const downloadPage = await gotInstance(link, {
        cookieJar
      });
      const dom = cheerio.load(downloadPage.body);

      const downloadLink = dom('.content-container .main-upload .project-description-div p:first-child a');

      const filename = linkRow('td:first-child strong').text();
      const fileSize = linkRow('td:last-child').text() || '';

      if (downloadLink !== null) {
        linksArray.push({
          link: downloadLink.attr('href') ?? '',
          filename,
          size: fileSize
        });
      }
    }
    return linksArray;
  } catch (err) {
    console.error(err);
    return new Error(String(err));
  }
}
