import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, bsc, polygon, arbitrum, base, avalanche } from 'wagmi/chains';

// 1. Get projectId; provider credentials remain server-side.
// Web3Modal requires a valid 32-character hex string for projectId.
// We provide a fallback dummy hex string to prevent fatal constructor errors if undefined.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '3fcc6bba31d50731f8f7c9e05e5d3b1e';
const rpcBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// 2. Create wagmiConfig
const metadata = {
  name: 'AlphaBAG Pro',
  description: 'Professional Crypto Intelligence Hub & Portfolio Tracker',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://alphabag.pro',
  icons: ['https://s2.coinmarketcap.com/static/img/coins/64x64/1.png']
};

// Route read-only chain requests through the backend RPC allowlist.
const alchemyChains = [
  { ...mainnet, rpcUrls: { ...mainnet.rpcUrls, default: { http: [`${rpcBaseUrl}/api/rpc/ethereum`] } } },
  { ...bsc, rpcUrls: { ...bsc.rpcUrls, default: { http: [`${rpcBaseUrl}/api/rpc/bsc`] } } },
  { ...polygon, rpcUrls: { ...polygon.rpcUrls, default: { http: [`${rpcBaseUrl}/api/rpc/polygon`] } } },
  { ...arbitrum, rpcUrls: { ...arbitrum.rpcUrls, default: { http: [`${rpcBaseUrl}/api/rpc/arbitrum`] } } },
  { ...base, rpcUrls: { ...base.rpcUrls, default: { http: [`${rpcBaseUrl}/api/rpc/base`] } } },
  { ...avalanche, rpcUrls: { ...avalanche.rpcUrls, default: { http: [`${rpcBaseUrl}/api/rpc/avalanche`] } } }
];

const chains = alchemyChains;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true, // Enable EIP-6963 for better multi-wallet support
  enableCoinbase: true 
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FCD535',
    '--w3m-border-radius-master': '1px'
  }
});

export { chains, projectId };