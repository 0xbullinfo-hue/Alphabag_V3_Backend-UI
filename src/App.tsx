import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import { ErrorBoundary } from './components/frontend/ErrorBoundary';
import { WalletProvider } from './context/WalletContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Solana Imports
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles for Solana wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient();

// Lazy pages - Admin only
const AdminProjectDashboard = lazy(() => import('./pages/admin/AdminProjectDashboard').then(m => ({ default: m.AdminProjectDashboard })));
const Admin = lazy(() => import('./pages/admin/Admin').then(m => ({ default: m.Admin })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));

const GlobalLoader = () => (
  <div className="min-h-screen bg-alphabag-black flex flex-col items-center justify-center space-y-6">
    <div className="w-12 h-12 border-4 border-alphabag-yellow border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] text-alphabag-yellow font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Protocol Hub...</p>
  </div>
);

// Admin-only route guard
const AdminRoute = ({ children }: React.PropsWithChildren<{}>) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <GlobalLoader />;
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        <Route path="/" element={
          isLoading ? <GlobalLoader /> :
          (isAuthenticated && user?.isAdmin) ? <Navigate to="/admin" replace /> : <Navigate to="/admin-login" replace />
        } />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/projects" element={<AdminRoute><AdminProjectDashboard /></AdminRoute>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  // Solana config
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = import.meta.env.VITE_ALCHEMY_API_KEY 
    ? `https://solana-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
    : clusterApiUrl(network);
    
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ErrorBoundary>
      <WagmiConfig config={config as any}>
        <ConnectionProvider endpoint={endpoint}>
          <SolanaWalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <WalletProvider>
                    <HashRouter>
                      <AppContent />
                    </HashRouter>
                  </WalletProvider>
                </AuthProvider>
              </QueryClientProvider>
            </WalletModalProvider>
          </SolanaWalletProvider>
        </ConnectionProvider>
      </WagmiConfig>
    </ErrorBoundary>
  );
}

export default App;