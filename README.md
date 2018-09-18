# ais-provider

The code running https://ais.portchain.com

![Screenshot](screenshot.png "Screenshot")


## Setup

env vars:
```
  DB_HOST
  DB_PORT
  DB_NAME
  DB_USER
  DB_PWD
```

```sh
npm install
AIS_PROVIDER_SECRET=123 DATA_FOLDER="/var/ais_data" node lib/server.js
```
