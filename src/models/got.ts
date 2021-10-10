import got, { Options } from 'got';
import cheerio from 'cheerio';
import tough from 'tough-cookie';
import FormData from 'form-data';
import { getUnixTime } from 'date-fns';

export const sfmlabCookieJar = new tough.CookieJar();

export const sfmlabGotInstance = got.extend({
  prefixUrl: 'https://sfmlab.com',
  responseType: 'text'
});

export async function SFMLabAuthenticate(): Promise<void | Error> {
  try {
    if (!process.env.SFMLAB_LOGIN || !process.env.SFMLAB_PASSWORD) {
      throw Error('sfmlab credentials not set');
    }

    const loginPage = await sfmlabGotInstance('accounts/login');
    const formBody = cheerio.load(loginPage.body);

    const middlewareToken = formBody('form#signup_form input[name="csrfmiddlewaretoken"]').val();

    if (!middlewareToken) {
      throw Error('sfmlab token not found');
    }

    const loginPageCookies = loginPage.headers['set-cookie'];
    if (!loginPageCookies) {
      throw Error('set-cookie headers not sent');
    }
    const loginPageParsedCookies = loginPageCookies.map((v) => tough.parse(v)).filter((v) => v !== undefined);
    const csrftoken = loginPageParsedCookies.find((cookie) => cookie !== undefined && cookie.key === 'csrftoken');

    if (!csrftoken) {
      throw Error('csrftoken not found');
    }

    sfmlabCookieJar.setCookieSync(csrftoken, 'https://sfmlab.com');

    const form = new FormData();
    form.append('login', process.env.SFMLAB_LOGIN);
    form.append('password', process.env.SFMLAB_PASSWORD);
    form.append('remember', 'on');

    const authResponse = await sfmlabGotInstance.post('accounts/login/?next=/', {
      headers: {
        'X-CSRFToken': middlewareToken
      },
      body: form,
      followRedirect: false,
      cookieJar: sfmlabCookieJar
    });

    const authResponseCookies = authResponse.headers['set-cookie'];
    if (!authResponseCookies) {
      throw Error('set-cookie headers not sent');
    }
    const authResponseParsedCookies = authResponseCookies.map((v) => tough.parse(v)).filter((v) => v !== undefined);

    const session = authResponseParsedCookies.find((cookie) => cookie !== undefined && cookie.key === 'sessionid');
    const messages = authResponseParsedCookies.find((cookie) => cookie !== undefined && cookie.key === 'messages');

    if (!session || !messages) {
      throw Error('failed authentication');
    }

    sfmlabCookieJar.setCookieSync(session, 'https://sfmlab.com');
    sfmlabCookieJar.setCookieSync(messages, 'https://sfmlab.com');

    console.log(`authenticated as ${process.env.SFMLAB_LOGIN}`);
    return Promise.resolve();
  } catch (err) {
    console.log(err.response);
    return Promise.reject(err);
  }
}

export async function sfmlabRequest(url: string, params: Options): Promise<any> {
  const siteCookies = await sfmlabCookieJar.getCookies('https://sfmlab.com');
  const sessionCookie = siteCookies.find((cookie) => cookie.key === 'sessionid');
  if (sessionCookie) {
    const currentDate = getUnixTime(new Date());
    const expiresDate = getUnixTime(new Date(sessionCookie.expires));

    const remainingDays = (expiresDate - currentDate) / 60 / 60 / 24;

    if (remainingDays <= 1) {
      await sfmlabCookieJar.removeAllCookies();
      await SFMLabAuthenticate();
    }
  }

  return sfmlabGotInstance(url, params);
}
