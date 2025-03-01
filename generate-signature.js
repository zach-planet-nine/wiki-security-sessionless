const sessionless = require('sessionless-node');

if(!process.env.PRIVATE_KEY || !process.env.OWNER_NAME) {
  console.error('please provide a PRIVATE_KEY and OWNER_NAME');
  process.exit();
}

sessionless.getKeys = () => {
  return {
    privateKey: process.env.PRIVATE_KEY,
    pubKey: '03dbd40d0dcb3f112ef184ea6de8a8a44808fb55fa99747fc901642e8a4245ed0c'
  };
};

const timestamp = new Date().getTime() + '';
const message = timestamp + process.env.OWNER_NAME;

sessionless.sign(message)
  .then(signature => console.log(`?timestamp=${timestamp}&signature=${signature}`))
  .catch(console.error);



