"use client";
import React from 'react';
import { useRouter } from "next/router";
import { CredentialOfferClient, MetadataClient,} from '@sphereon/oid4vci-client';
import axios from 'axios';
import {QrScan} from '@/components/qr-scan'
import {WalletConnect} from '@/components/wallet-connect'

export default function IssueVc(){
    return (
        <main>
            <QrScan />
        </main>
    )
}

// const getAccessToken = async(initiationURI_: string) => {
//     const _initiationRequestWithUrl = await CredentialOfferClient.fromURI(initiationURI_);
//     const _metadata = await MetadataClient.retrieveAllMetadataFromCredentialOffer(_initiationRequestWithUrl);

//     console.log(_initiationRequestWithUrl.preAuthorizedCode);
//     console.log(_metadata.token_endpoint);
//     console.log(_metadata.issuer);
    
//     const clientId = '218232426';
    
//     const tokenReq = new URLSearchParams();
//     tokenReq.append('client_id', clientId);
//     tokenReq.append('grant_type', 'urn:ietf:params:oauth:grant-type:pre-authorized_code');
//     tokenReq.append('pre-authorized_code', 'aFYv7nBLVxB8n6rjNOGs3MSsAcpQVEWT9JVn886S2M0');

//     await axios.post(_metadata.token_endpoint, tokenReq, {
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//     }).then(res => {
//         console.log(res.data)
//     }).catch(e=> {
//         console.log(e.response.data);
//     });
// }