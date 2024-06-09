import { Holder } from './Holder'
import { Title, greenText, redText } from './OutputClass'
import { textSync } from 'figlet'

import  express from 'express';
import bodyParser from 'body-parser';
import * as path from "path";

//************
const port=8800;
let wallet:Agent
//*************

const app: express.Express = express();
app.use('/', express.static(path.join(process.cwd(), 'views')));
app.use(bodyParser.json());


app.listen(port, async () => {
       console.log(textSync('Holder', { horizontalLayout: 'full' }))
       wallet = await Agent.build()
       console.log(`\n web page start: listening on port ${port}`);
});


app.post('/.*', async function(req:express.Request,res:express.Response){
	console.log("\n====POST====");
	console.log("cmd:"+JSON.stringify(req.params));
	console.log("query:"+JSON.stringify(req.query));
	console.log("headers:"+JSON.stringify(req.headers));
	console.log(req.body);
	console.log("====POST====");

  let ret="";
  let cmd = req.params[0].split('/');
  if (cmd[0] =="issuer_init"){
      console.log("init")
      let cred =  await getCredential(req.body.qr)
      res.send(cred);
  }
})

async function getCredential(_initiationURI:string){
      let initiationURI = _initiationURI.replace("OpenBadgeCredential", "OpenBadgeCredentialJwt")

      const resolvedCredentialOffer = await wallet.holder.resolveCredentialOffer(initiationURI);
      console.log(greenText(`Received credential offer for the following credentials.`))
      console.log(greenText(resolvedCredentialOffer.offeredCredentials.map((credential) => credential.id).join('\n')))

      const credentials = await wallet.holder.requestAndStoreCredentials(
         resolvedCredentialOffer,
        resolvedCredentialOffer.offeredCredentials.map((o) => o.id)
      )
      console.log(credentials)
      let decoded={}
     if (credentials[0].type === 'W3cCredentialRecord') {
        console.log(greenText(`W3cCredentialRecord with claim format ${credentials[0].credential.claimFormat}`, true))
        console.log(JSON.stringify(credentials[0].credential.jsonCredential, null, 2))
        decoded = credentials[0].credential.jsonCredential;
    } 

    return {result:true, detail:credentials,decode:decoded};
}

export class Agent {
  public holder: Holder

  public constructor(holder: Holder) {
    this.holder = holder
  }

  public static async build(): Promise<Agent> {
    const holder = await Holder.build()
    return new Agent(holder)
  }
}

