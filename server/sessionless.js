const fs = require('fs');
const sessionless = require('sessionless-node');

console.log('sessionless server starting');

let sessionlessKeys;
const saveKeys = (_sessionlessKeys) => sessionlessKeys = _sessionlessKeys;
const getKeys = () => sessionlessKeys;

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

  security.isAuthorized = (req) => {
    return req.sessionless && req.sessionless.isVerified;
  }

  security.login = async (req, res) => {
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;
    const name = owner.name;
    const message = timestamp + name;    
    
    try {
      if(sessionless.verifySignature(signature, message, owner.sessionlessKeys.pubKey)) {
	const sessionlessKeys = await sessionless.generateKeys(saveKeys, getKeys);

	req.session.key = sessionlessKeys.privateKey;

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
    app.use(async (req, res, next) => {
      req.sessionless = req.sessionless || {};

      if(req.session && req.session.key) {
        try {
          const sessionlessKeys = await sessionless.getKeys();
          sessionlessKeys.privateKey = req.session.key;
          sessionless.getKeys = () => sessionlessKeys;
        } catch(err) {
          req.session.reset();
          req.sessionless.isVerified = false;
          return next();
        }

        try {
          const signature = await sessionless.sign(req.path);

          const isVerified = sessionless.verifySignature(signature, req.path, sessionlessKeys.pubKey);
          req.sessionless.isVerified = isVerified;
        } catch(err) {
          req.sessionless.isVerified = false;
        }
      } else {
        req.sessionless.isVerified = false;
      }

      next();
    });
    app.get('/login', cors, security.login);
    app.get('/logout', cors, security.logout);
  };

  return security;
};
