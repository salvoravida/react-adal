/* eslint-disable no-console */
const { createWriteStream } = require('fs');
const https = require('https');

const SDK_FILE = `${process.cwd()}/src/adal.js`;
const SDK_SOURCE_URL = 'https://raw.githubusercontent.com/AzureAD/azure-activedirectory-library-for-js/dev/lib/adal.js';

const fileStream = createWriteStream(SDK_FILE, { defaultEncoding: 'utf8' });

const terminateWithSuccess = () => {
  console.log('SDK SUCCESSFULLY UPDATED');
  process.exit(0);
};

const terminateWithFailure = (err) => {
  console.error('ERROR WHILE UPDATING SDK');
  console.error(err);
  process.exit(0);
};


console.log(`DOWNLOADING FROM ${SDK_SOURCE_URL}`);

https.get(
  SDK_SOURCE_URL,
  res => (res.statusCode === 200
    ? res.on('end', terminateWithSuccess).pipe(fileStream)
    : terminateWithFailure(new Error(`Failed downloading SDK from ${SDK_SOURCE_URL}, status: ${res.statusCode}`))),
).on('error', terminateWithFailure);
