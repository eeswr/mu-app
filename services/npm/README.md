# muzoo-npm
A micro-service that provides npm data for MuZoo. This micro-service depends on the
npm registry but also caches retrieved data to reduce load on said registry.

## Running
To run simply use npm,

```
npm install
npm run start
```

## Configuration

### Environment Variables
Various settings can be changed using environment variables, see the list below for all
available variable names.

#### NPM_HOST
  - The host to listen on.
  - Defaults to `localhost`

#### NPM_PORT
  - The port to listen on in isolated mode.
  - Defaults to `6050` .

#### NPM_REGISTRY
  - Change the registry used to validate the module name.
  - Defaults to `http://registry.npmjs.org/`.

## Sample Data
```json
{
  "id": "example-module",
  "name": "example-module",
  "urlRepo": "git+https://github.com/foo/example-module.git",
  "urlPkg": "https://www.npmjs.com/package/example-module",
  "description": "foo",
  "latestVersion": "6.0.0",
  "releaseCount": 1,
  "dependencies": {
    "mu": "0.1.x",
    "request": "2.0.x",
    "toolbag": "2.0.x"
  },
  "author": {
    "name": "Blibo Smith",
    "email": ""
  },
  "licence": "MIT",
  "maintainers": [
    {
      "name": "adrianrossouw",
      "email": ""
    },
    {
      "name": "mcdonnelldean",
      "email": ""
    }
  ],
  "readme": "...",
  "homepage": "https://github.com/foo/example-module#readme",
  "cached": 1460320210380
}
```

## Messages Handled

### `role:store,type:npm,cmd:get,name:*`
Returns npm specific data for the module name provided.

```js
mu.dispatch({role: 'store', type: 'npm', cmd: 'get', name: 'example'}, (err, data) => {})
```

## Messages Emitted
This service emits no messages
