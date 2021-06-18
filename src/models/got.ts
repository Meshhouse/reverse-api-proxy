import got from 'got';
import tough from 'tough-cookie';

export const sfmlabCookieJar = new tough.CookieJar();

export const sfmlabGotInstance = got.extend({
  prefixUrl: 'https://sfmlab.com',
  responseType: 'text'
});
