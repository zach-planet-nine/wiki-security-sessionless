const sessionless = require('sessionless-node');

if(!process.env.PRIVATE_KEY || !process.env.OWNER_NAME) {
  console.error('please provide a PRIVATE_KEY and OWNER_NAME');
  process.exit();
}

sessionless.getKeys = () => {
  return {
    privateKey: process.env.PRIVATE_KEY,
    pubKey: ''
  };
};

const timestamp = new Date().getTime() + '';
const message = timestamp + process.env.OWNER_NAME;

sessionless.sign(message)
  .then(signature => console.log(`?timestamp=${timestamp}&signature=${signature}`))
  .catch(console.error);

