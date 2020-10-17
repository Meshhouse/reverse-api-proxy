# MeshHouse reverse API proxy
API proxy for Integration services, used by MeshHouse application

## Why it exists
Because some sites disable CORS (cross-origin request sharing) and when application try to connect to site, it fails with CORS error. There are 3 variants:

* Write a message to site owners to enable CORS on their servers.
* Disable web security in Electron settings (current way).
* Create API server that would be proxying request to our server.

In 3rd variant CORS is ignored, because CORS for browsers only and not for CLI applications(ex. cURL, any Node.js fetch package, Postman).

## Benefits
API can cache requests to origin server, also we can provide similar REST API to different Integration services.

## Installation
1.
```bash
git clone https://github.com/Meshhouse/reverse-api-proxy.git
cd reverse-api-proxy
npm install
npm run build
npm run start
```
2.
Create **config.json** in *src* folder

### Config file
Config.json contains your credentials to integration services:
```json
{
  "credentials": {
    "sfmlab": {
      "login": "login",
      "password": "password"
    }
  }
}
```

Currently authentication not implemented

## License
This code are licensed by MIT License
