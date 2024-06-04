const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const QRCode = require('qrcode');
const crypto = require('crypto');
const elliptic = require('elliptic');
const didJWT = require('did-jwt');
const fs = require('fs');
const uuid = require('uuid');
const base58 = require('bs58');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(__dirname + '/views/'));

//*******setting********
const port=8888;
let hostname = '127.0.0.1'+":"+port;
if (process.argv.length > 2){ hostname = process.argv[2];}
//**********************

//*******global variable*******
let DID="did:web:"+hostname;
let task= new Array();
let taskstatus= new Array();
let storageJson=[];
let didwebkey, didkey, didjwk;

const main = async()=>{
  didwebkey = await init(hostname);
  didkey = a_did(didwebkey, "key");
  didjwk = a_did(didwebkey, "jwk");
  console.log("\n " + DID)
  console.log(" " + didkey)
  console.log(" " + didjwk+"\n")

}
main();
//******************************

//*******web server*******
const httpServer = http.createServer(app);
const server = httpServer.listen(port, () => {
  console.log('\n web page start: listening on port %s...', server.address().port);
});

app.get('/.*', async function(req,res){
	console.log("\n====GET====");
	console.log("cmd:"+JSON.stringify(req.params));
	console.log("query:"+JSON.stringify(req.query));
	console.log("headers:"+JSON.stringify(req.headers));
	console.log(req.body);
	console.log("====GET====");

  let ret="";
  let cmd = req.params[0].split('/');

  if (cmd[0] =="pf" && cmd[1] ==".well-known" && cmd[2] == "openid-credential-issuer"){
    console.log("access to openid-credential-issuer")
    let _metadata = await metadata(hostname, "");
    res.send(_metadata);

  } else if (cmd[0] =="istatus"){
    ret={"status":taskstatus[cmd[1]].vcstatus};
    res.send(JSON.stringify(ret));

  }else{
    res.send(ret);
  }
});

app.post('/.*', async function(req,res){
	console.log("\n====POST====");
	console.log("cmd:"+JSON.stringify(req.params));
	console.log("query:"+JSON.stringify(req.query));
	console.log("headers:"+JSON.stringify(req.headers));
	console.log(req.body);
	console.log("====POST====");

  let ret="";
  let cmd = req.params[0].split('/');

  if (cmd[0] =="issuer_init"){
    let preAuthorizedCode = await issuerInit(req.body);
    let offer = {
      "grants":{
        "urn:ietf:params:oauth:grant-type:pre-authorized_code":{
          "pre-authorized_code":preAuthorizedCode,
          "user_pin_required":false
        }
      },
      "credentials":["OpenBadgeCredentialJwt"],
      "credential_issuer":"https://"+hostname+"/.pf"
    }
    let inviteUrl = "openid-credential-offer://?credential_offer="+encodeURIComponent(JSON.stringify(offer));
    QRCode.toDataURL(inviteUrl, function (err, url) {
      let sendData = {"qrcode":url, "sess":task[preAuthorizedCode].sess, "url":task[preAuthorizedCode].serviceEndpoint};
      res.send(sendData);
    });
  }else if(cmd[0] == "pf" && cmd[1]=="token"){
     let token={};
     let authcode = req.body['pre-authorized_code'];
     if (typeof task[authcode] !== "undefined"){
       console.log("authenticated!!");
       task[authcode].client_id = req.body.client_id;
       task[authcode].nonce = uuid.v4();
       let atoken = await makeToken(authcode, 300);
       token = {
         "access_token":atoken,
         "token_type":"bearer",
         "expires_in":300,
         "c_nonce":task[authcode].nonce,
         "c_nonce_expires_in":300000,
         "authorization_pending":false,
         "interval":300000
       }
       res.send(JSON.stringify(token))
     }else{
       console.log("unauthenticated!!:"+ req.body['pre-authorized_code']);
       res.send(JSON.stringify(token))
     }
  }else if (cmd[0] == "pf" && cmd[1]=="credentials"){
    let credJson={}
    let auth = req.headers.authorization;
    let token = didJWT.decodeJWT(auth.split(" ")[1]);
    if (typeof task[token.payload.preAuthorizedCode] !== "undefined"){
      let _jwt = didJWT.decodeJWT(req.body.proof.jwt);
      if (task[token.payload.preAuthorizedCode].nonce == _jwt.payload.nonce 
          && task[token.payload.preAuthorizedCode].serviceEndpoint == _jwt.payload.aud){
        let _kid = _jwt.header.kid;
        let cred = await makecred(
            _kid, uuid.v4(), 
            Math.floor( new Date().getTime() / 1000 ) , 30*24*60*60,  // from now to 1 month
            task[token.payload.preAuthorizedCode].sess
        );
        let credJson = {
          "credential":cred,
          "format":"jwt_vc_json",
          "c_nonce":uuid.v4(),
          "c_nonce_expires_in":300000
        }
        taskstatus[task[token.payload.preAuthorizedCode].sess].vcstatus="issuance_successful";
        res.send(JSON.stringify(credJson))
      }else{
        console.log("bad nonce or bad aud")
        res.send(JSON.stringify(credJson))
      }
    }else{
      console.log("unauthentication: bad token")
      res.send(JSON.stringify(credJson))
    }
  }else{
    res.send(null);
  }
});


//////////////////////
//  support function
///////////////////////

async function issuerInit(_body){
  let preAuthorizedCode = base58.encode(crypto.randomBytes(18));
  console.log(preAuthorizedCode)
  let sess = crypto.randomBytes(8).toString("hex")
  let serviceEndpoint = "https://"+hostname+"/.pf";

  task[preAuthorizedCode]= {
    "claims": _body.claims,
    "preAuthorizedCode":preAuthorizedCode,
    "serviceEndpoint":serviceEndpoint,
    "isskey": didwebkey,
    "sess": sess
  };
  taskstatus[sess]={"vcstatus":"wait", "claims":_body.claims};
  return preAuthorizedCode;
}


async function metadata(_hostname, _sess){
  let _endpoint = "https://"+_hostname+"/.pf";
  let ret = {
    "credential_issuer":_endpoint,
    "credential_endpoint": _endpoint + "/credentials",
    "token_endpoint": _endpoint + "/token",
    "display":[{"name":"ngrok:"+hostname,"description":"ngrok Issuer:"+hostname}],
    "credentials_supported":[{
      "display":[
        {
          "name":"xx university", 
          "description":"OpenBadge (JWT)",
          "text_color":"#FFFFFF",
          "background_color":"#1763c1",
          "logo":{
            "url":"https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png",
            "alt_text":"Red, magenta and yellow vertical lines with 3 black dots and the text JFF, depicting the Jobs For the Future logo."
          }
        },
        {
          "locale":"en-US",
          "name":"xx university", 
          "description":"OpenBadge (JWT)",
          "text_color":"#FFFFFF",
          "background_color":"#1763c1",
          "logo":{
            "url":"https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png",
            "alt_text":"Red, magenta and yellow vertical lines with 3 black dots and the text JFF, depicting the Jobs For the Future logo."
          }
        }
      ],
      "id":"OpenBadgeCredentialJwt",
      "types":["VerifiableCredential","OpenBadgeCredential"],
      "format":"jwt_vc_json",
      "cryptographic_binding_methods_supported":["did:key"],
      "cryptographic_suites_supported":["EdDSA"]
    }],
    "credential_supplier_config":{
      "templates_base_dir":"templates/sphereon",
      "template_mappings":[
        {
          "credential_types":["OpenBadgeCredential"],
          "template_path":"OpenBadgeCredential.hbs",
          "format":"jwt_vc_json"
        }
      ]
    }
  };
  return ret;
}

async function makecred(_subdidkey, _uuid, _nbf, _exp, _sess){
  const signer = didJWT.ES256KSigner(didJWT.hexToBytes(Buffer.from(didwebkey.privateJwk.d, 'base64').toString('hex')))
  let _body = {
    "vc":await makevc(_subdidkey, _uuid, taskstatus[_sess].claims.achievement),
    "@context":["https://www.w3.org/2018/credentials/v1","https://purl.imsglobal.org/spec/ob/v3p0/context.json"],
    "type":["VerifiableCredential","OpenBadgeCredential"],
    "name": taskstatus[_sess].claims.university +"'s openBadge",
    "issuer":{
      "type":["Profile"],
      "name":"Jobs",
      "url":"https://www.jff.org/",
      "image":"https://w3c-ccg.github.io/vc-ed/plugfest-1-2022/images/JFF_LogoLockup.png",
      "id":didjwk
    },
    "credentialSubject":{
      "type":["AchievementSubject"],
      "achievement":{
        "id":"urn:uuid:"+_uuid,
        "type":["Achievement"],
        "name":taskstatus[_sess].claims.university +"'s openBadge",
        "description":"demo",
        "criteria":{
          "type":"Criteria",
          "narrative":"..."
        },
        "image":{
          "id":"https://w3c-ccg.github.io/vc-ed/plugfest-3-2023/images/JFF-VC-EDU-PLUGFEST3-badge-image.png",
          "type":"Image"
        }
      },
      "id": _subdidkey
    },
    "sub": _subdidkey,
    "iss": didjwk,
    "nbf": _nbf
  }
  let jwt = await didJWT.createJWT(
    _body,
    { issuer: didjwk, expiresIn:_exp, signer },
    { alg: 'ES256K' , typ:'JWT'}
  )
  return jwt
}

async function makevc(_subdidkey, _uuid, name){
  let _vc = {
    "@context":["https://www.w3.org/2018/credentials/v1","https://purl.imsglobal.org/spec/ob/v3p0/context.json"],
    "type":["VerifiableCredential","OpenBadgeCredential"],
    "credentialSubject":{
      "type":["AchievementSubject"],
      "achievement":{
        "id":"urn:uuid:"+_uuid,
        "type":["Achievement"],
        "name": name,
        "image":{
          "id":"https://w3c-ccg.github.io/vc-ed/plugfest-3-2023/images/JFF-VC-EDU-PLUGFEST3-badge-image.png",
          "type":"Image"
        }
      },
      "id":_subdidkey
    }
  };
  return _vc;

}


async function init(_hostname){
  let _did = "did:web:"+_hostname;
  let _key = await loadDid(_did);
  if (_key ==null){
    console.log("\n this "+_did+"'s key not registered")
    let _key = await createkey();
    await saveDid(_did, _key);
    return _key;
  }else{
    console.log("\n this "+_did+"'s key is registered")
    return _key;
  }
}

async function loadDid(_did){
  let key = null;
  try{
    storageJson = JSON.parse(fs.readFileSync('./storage.json'));
    storageJson.forEach((item) =>{
       if (item.did == _did) key = item.key
    })
    return key;
  }catch(err){
    return null;
  }
}

async function saveDid(_did, _key){
  storageJson.push({did:_did, key:_key})
  try{
    fs.writeFileSync("./storage.json", JSON.stringify(storageJson))
  }catch(err){
    console.error(err);
  }
}

async function createkey(){
  const key = crypto.randomBytes(32).toString("hex");
  const ec = new elliptic.ec('secp256k1');
  const prv = ec.keyFromPrivate(key, 'hex');
  const pub = prv.getPublic();
  const ecjwk = {
    kty:"EC", 
    crv:"secp256k1", 
    "x":pub.x.toBuffer().toString('base64'),
    "y":pub.y.toBuffer().toString('base64')
  };
  const ecjwkpri = {
    kty:"EC", 
    crv:"secp256k1", 
    "x":pub.x.toBuffer().toString('base64'),
    "y":pub.y.toBuffer().toString('base64'),
    "d":prv.getPrivate().toBuffer().toString('base64')
  };
  let _key={"publicJwk":ecjwk,"privateJwk":ecjwkpri};
  return _key;
}

function a_did(key, method){
  let ret = "";
  if (method == "key"){
    if (key.publicJwk.kty == "EC" && key.publicJwk.crv=="secp256k1"){
      let yhex = Buffer.from(key.publicJwk.y, 'base64').toString('hex')
      if ((parseInt(yhex.slice( -1 ), 16) %2)==1){
        parity_flag = "03";
      }else{
        parity_flag = "02";
      }
      let tmp = "E701" + parity_flag + Buffer.from(key.publicJwk.x, 'base64').toString('hex');
      ret = "did:key:z"+base58.encode(Buffer.from(tmp, 'hex'));
    }
  }else if(method == "jwk"){
    if (key.publicJwk.kty == "EC" && key.publicJwk.crv=="secp256k1"){
      let jwt = {"alg":"ES256K","use":"sig","kty":"EC","crv":"secp256k1","x":key.publicJwk.x.replaceAll("=",""),"y":key.publicJwk.y.replace("=", "")}
      ret = "did:jwk:"+Buffer.from(JSON.stringify(jwt)).toString('base64').replaceAll("=", ""); 
    }
  }else{
  }
  return ret;
}

async function makeToken(authcode, exp){
  const signer = didJWT.ES256KSigner(didJWT.hexToBytes(Buffer.from(task[authcode].isskey.privateJwk.d, 'base64').toString('hex')))
  let jwt = await didJWT.createJWT(
    { preAuthorizedCode: authcode},
    { issuer: task[authcode].serviceEndpoint, expiresIn:exp, signer },
    { alg: 'ES256K' , typ:'JWT'}
  )
  return jwt
}
