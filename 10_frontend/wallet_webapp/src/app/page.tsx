"use client";
import { WalletConnect } from "@/components/wallet-connect";
import { WalletTop } from "@/components/wallet-top"
import { useState } from 'react';
import { useAccount } from 'wagmi'

import { formatUnits, parseUnits, createWalletClient } from 'viem';

export default function Home() {
  const account = useAccount();
  if(account.status === 'connected') {
    return (
      <main>
        <WalletTop />
      </main>
    );
  } else {
    return (
      <main>
        <WalletConnect />
      </main>
    );
  }
  
}
