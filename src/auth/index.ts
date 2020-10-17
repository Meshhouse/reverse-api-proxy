//import { handleAuthentication as SFMLabAuth } from '../handlers/sfmlab';

export default function(): any {
  /*void SFMLabAuth().then((response: any) => {
    console.log('test');
  }).catch();*/
  return {
    cookies: {
      sfmlab: {
        csrf: ''
      }
    }
  };
}
