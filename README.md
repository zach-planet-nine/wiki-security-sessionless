# Federated Wiki - Security Plug-in: Sessionless

-------------

This module lets wiki owners supply public keys for use with the [Sessionless][sessionless] protocol. 
The tl;dr of that here is that you can utilize a private key stored locally on your machine, to create a signature, which logs you into your wiki instance. 
The public key for this signature is stored on the server, and can be shared or reused however you'd like, and thus no third party identity provider or shared personal information needs to be used. 

-------------

## Configuration

-------------

This plugin expects an owner file that looks like this:

```json
{
  "name": "owner's name",
  "keys": {
    "pubKey": "028a2a944b5bcd93fb130d94abd22bd51569a3fcf17117521f37a7c5466c1baf96"
  }
}
```

Multiple key support will be added in a future update. 

There are many ways to get sessionless keys. 
This repo contains a simple `generate-keys.js` script that can be run to get a key pair, but anything that can generate keys on the secp256k1 curve can be used including openssl, and various other cryptographic libraries.

--------------

## Usage

--------------

### Server 

Launch the wiki server with at least the following args:

`wiki --security_type=sessionless --id /path/to/.wiki/status/owner.json --security=./security --cookieSecret=biglongstring --session_duration=10`

* `cookieSecret` needs to be consistent across server starts to maintain existing sessions. Alternatively, if you'd like to burn all sessions just change the secret.  

* `session_duration` is the number in days that you'd like your sessions to be valid for. Fractional days should work, but are untested by the author of this plugin.

### Client

There is no need for a UI to login, instead a timestamp and signature is passed as query parameters to the login route of your wiki. 
To get the signature this repo provides a `generate-signature.js` helper script, which can be run as follows:

`PRIVATE_KEY=<put your key here> OWNER_NAME=planetnineisaspaceship node generate-signature.js`

You can of course use any other method of getting a signature. 
The server will check a message that is the timestamp that is passed in the query params, and the owner's name on the server. 
In the future the timestamp will only be valid for a small amount of time, but that is left for a future version.

Once you have your signature you'll want to construct this kind of url:

`http://<domain.wiki>/login?timestamp=1739658960170&signature=c9220aaec64bbb61bf66928e4fca546e0cfe64ce3637b69d16025e6968cfc99e3ccf32a73a9536da7cb2b74ba7670a24bf8c5c4d0b3210a7fc6c142d5de7b215`

Pasting that into your browser will log you in, and you'll be all set.


[sessionless]: https://github.com/planet-nine-app/sessionless
