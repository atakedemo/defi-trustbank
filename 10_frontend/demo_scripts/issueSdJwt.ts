import { CredentialOfferClient, MetadataClient,} from '@sphereon/oid4vci-client';
import axios from 'axios';
import { AxiosRequestHeaders } from 'axios';

type metadata = {

}

async function main() {
    const _uri = "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Ftrial.authlete.net%22%2C%22credential_configuration_ids%22%3A%5B%22IdentityCredential%22%2C%22org.iso.18013.5.1.mDL%22%5D%2C%22grants%22%3A%7B%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%22LJjYrqYLQoupAb0rC-G84LyNszGHVURTEKj5fqMo2II%22%7D%7D%7D"
    await getAccessToken(_uri);
}

const getAccessToken = async(initiationURI_: string) => {
    const _initiationRequestWithUrl = await CredentialOfferClient.fromURI(initiationURI_);
    const _metadata = await MetadataClient.retrieveAllMetadataFromCredentialOffer(_initiationRequestWithUrl);

    console.log(_initiationRequestWithUrl.preAuthorizedCode);
    console.log(_metadata.token_endpoint);
    console.log(_metadata.issuer);
    
    const clientId = '218232426';
    
    const tokenReq = new URLSearchParams();
    tokenReq.append('client_id', clientId);
    tokenReq.append('grant_type', 'urn:ietf:params:oauth:grant-type:pre-authorized_code');
    tokenReq.append('pre-authorized_code', 'aFYv7nBLVxB8n6rjNOGs3MSsAcpQVEWT9JVn886S2M0');

    await axios.post(_metadata.token_endpoint, tokenReq, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }).then(res => {
        console.log(res.data)
    }).catch(e=> {
        console.log(e.response.data);
    });
}

main().catch((error) => {
    console.error(error);
});