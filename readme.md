<img src=".github/assets/occams-conf-social-preview.png" alt="occams-conf" />

<p align="center">A simple config module</p>

[![npm version](https://badge.fury.io/js/occams-conf.svg)](https://badge.fury.io/js/occams-conf) [![CircleCI](https://circleci.com/gh/lxghtless/occams-conf/tree/master.svg?style=svg)](https://circleci.com/gh/lxghtless/occams-conf/tree/master)  [![codecov](https://codecov.io/gh/lxghtless/occams-conf/branch/master/graph/badge.svg)](https://codecov.io/gh/lxghtless/occams-conf) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

### Why Occam's Config?

- Encourages [Build Once Run Anywhere](https://forums.docker.com/t/build-once-run-anywhere-concept/3522) Node.js App Containers
- No opinion of config file name or location
- Load additional config files to merge properties
- Load configs from https endpoints

> previous versions

- version 1
    + [docs](https://github.com/lxghtless/occams-conf/tree/v1.1.0)
- version 2
    + [docs](https://github.com/lxghtless/occams-conf/tree/v2.0.1)

### first things's first...

```sh
$ npm i occams-conf
```

### Usage

> load main config via occams settings

```js
const config = require('occams-conf');

console.log(config.yourProp);
```

> load another config merged with main

```js
const config = require('occams-conf');
config.loadConfig({
    name: 'other-config.js',
    path: 'src'
});

console.log(config.yourProp);
console.log(config.otherProp);
```

> load config from https url with loaderConfig

```js
// example loaderConfig:
// {
//     "path": "https://raw.githubusercontent.com/lxghtless/occams-conf/v2.0.1/config.js"
// }
const config = require('occams-conf');

(async () => {
    await config.init();
    console.log(config.resourceUrl);
});
```

> load config from https url with loadConfig method

```js
const config = require('occams-conf');

(async () => {
    await config.loadConfig({
        path: 'https://raw.githubusercontent.com/lxghtless/occams-conf/v2.0.1/config.js'
    });
    console.log(config.resourceUrl);
});
```

### `occams-conf` settings file (aka locatorConfig)

- name (config file name) [String]
- path (config path) [String]

Any of these will work and will resolve the first one found in this order.

> occams.conf.json

```json
{
    "name": "config.js",
    "path": "src"
}
```

> occams.conf.js

```js
const conf = {
    name: 'config.js',
    path: 'src'
};

module.exports = conf;
```

> package.json

```json
{
    "occams-conf": {
        "name": "config.js",
        "path": "src"
    }
}
```

> default

- name: `config.js`
- path: `$HOME directory if globally installed || cwd`

### Example `config.js`

```js
module.exports = {
    port: process.env.TEST_PORT || 8011,
    name: process.env.TEST_NAME || 'starlord',
    resourceUrl: process.env.TEST_URL || 'https://reqres.in/api/mixtapes'
};
```

### Windows Users

If an error resembling the following occurs, please check out the link below it.

```shell
PS C:\src\{projectfolder}> npm start

> file-sage@1.0.0 start C:\src\{projectfolder}
> node src/index.js

Error: ENOENT: no such file or directory, lstat 'C:\Users\{username}\AppData\Roaming\npm\node_modules'
    at Object.realpathSync (fs.js:1561:7)
    at Object.<anonymous> (C:\src\{projectfolder}\node_modules\is-installed-globally\index.js:8:29)
    at Module._compile (internal/modules/cjs/loader.js:1139:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1159:10)
    at Module.load (internal/modules/cjs/loader.js:988:32)
    at Function.Module._load (internal/modules/cjs/loader.js:896:14)
    at Module.require (internal/modules/cjs/loader.js:1028:19)
    at require (internal/modules/cjs/helpers.js:72:18)
    at isGloballyInstalled (C:\src\{projectfolder}\node_modules\occams-conf\src\util.js:17:10)
    at getLocatorConfigPath (C:\src\{projectfolder}\node_modules\occams-conf\src\util.js:26:6) {
  errno: -4058,
  syscall: 'lstat',
  code: 'ENOENT',
  path: 'C:\\Users\\{username}\\AppData\\Roaming\\npm\\node_modules'
}
```

https://stackoverflow.com/questions/19874582/change-default-global-installation-directory-for-node-js-modules-in-windows
