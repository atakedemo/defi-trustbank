"use client";
import React from 'react';
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