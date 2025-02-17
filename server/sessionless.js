const fs = require('fs');
const sessionless = require('sessionless-node');

console.log('sessionless server starting');

let keys;
const saveKeys = (_keys) => keys = _keys;
const getKeys = () => keys;

module.exports = (log, loga, argv) => {
  const security = {};

  const idFile = argv.id;

  let owner = '';
  let ownerName = '';
  
  security.retrieveOwner = (callback) => {
    fs.readFile(idFile, (err, data) => {
      if(err) {
        return callback(err);
      }
      owner = JSON.parse(data);
      callback();
    });
  };

  security.getOwner = () => {
    if(!owner || !owner.name) {
      ownerName = '';
    } else {
      ownerName = owner.name;
    }
    return ownerName;
  };

  security.setOwner = (id, callback) => {
    // I don't think there is a reason to set owner during runtime so this is left as a noop for now
  };

  security.getUser = (req) => {
    // TODO: This may be relevant if we add joan for PAP
  };

  security.isAuthorized = async (req) => {
    if(req.session.key) {
       try {
         const keys = await sessionless.getKeys();
       } catch(err) {
         req.session.reset();
         return false;
       }
       const signature = await sessionless.sign(req.path);
       try {
         const isVerified = sessionless.verifySignature(signature, req.path, keys.pubKey);
         return isVerified;
       } catch(err) {
         return false;
       }
    }
    return false;
  }

  security.login = async (req, res) => {
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;
    const name = owner.name;
    const message = timestamp + name;    
    
    try {
      if(sessionless.verifySignature(signature, message, owner.keys.pubKey)) {
	const keys = await sessionless.generateKeys(saveKeys, getKeys);

	req.session.key = keys.privateKey;
	return res.redirect('/view/welcome-visitors');
      } 
    } catch(err) {}
    
    
    res.status(403);
    return res.send('unauthorized');
  };

  security.logout = async (req, res) => {
    req.session.reset();
    res.send("OK");
  };

  security.defineRoutes = (app, cors, updateOwner) => {
    app.get('/login', cors, security.login);
    app.get('/logout', cors, security.logout);
  };

  return security;
};
