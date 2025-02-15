const sessionless = require('sessionless-node');

sessionless.generateKeys(() => {}, () => {}).then(console.log).catch(console.error);
