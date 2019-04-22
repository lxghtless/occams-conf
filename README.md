# occams-conf

A simple config module


[![npm version](https://badge.fury.io/js/occams-conf.svg)](https://badge.fury.io/js/occams-conf)  [![CircleCI](https://circleci.com/gh/lxghtless/occams-config/tree/master.svg?style=svg)](https://circleci.com/gh/lxghtless/occams-config/tree/master)  [![codecov](https://codecov.io/gh/lxghtless/occams-config/branch/master/graph/badge.svg)](https://codecov.io/gh/lxghtless/occams-config) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)


### Why Occam's Config?

- Encourages [Build Once Run Anywhere](https://forums.docker.com/t/build-once-run-anywhere-concept/3522) Node.js Containers via `-e` paramerters in run command
- No opinion on config file name or relative path location
- Load additional config files to merge new properties

### Install

```sh
$ npm i occams-conf -S
````


### Usage

> load main config via occams settings

```js
const config = require('occams-conf');

console.log(config.yourProp);
````

> load another config merged with main

```js
const config = require('occams-conf').loadConfig({
	configName: 'otherConfig',
	configPath: 'src'
});

console.log(config.yourProp);
console.log(config.otherProp);
````

### Occam's Settings Configuration

- name (config file name) [String]
- path (config file relative directory path) [String]

The following are options for defining occams config settings. They are loaded in priority order where if one is found, it overrides the rest.

> 1. occams.config.js

_Must be located in cwd_

```js
const conf = {
	name: 'config.js',
    path: 'src'
};

module.exports = conf;
```

> 2. occams.config.json

_Must be located in cwd_

```js
{
    "name": "config.js",
    "path": "src"
}
```

> 3. package.json


```json
"occams-config": {
    "name": "config.js",
    "path": "src"
}
```

> 4. default

- name: `config.js`
- path: `./`


### Example config file

```js
const conf = {
	port: process.env.API_PORT || 3000,
	resourceUrl: process.env.RESOURCE_URL || 'http://resource.com',
	mySecret: process.env.MY_SECRET
};

module.exports = conf;
```
