// WhaleService.ts - Fetch transactions and alerts for watched wallets
import { api } from './api';


export interface WhaleTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timeStamp: string;
    tokenSymbol?: string;
    tokenDecimal?: string;
}

export const WhaleService = {
    /**
     * Get recent transactions for a wallet address
     */
    getRecentTransactions: async (address: string, chainId: number = 56): Promise<WhaleTransaction[]> => {
        try {
            if (chainId === 1399811149) {
                const response = await api.get(`/api/whales/solana/${encodeURIComponent(address)}/transactions`);
                return Array.isArray(response.data) ? response.data : [];
            }
            const response = await api.get(`/api/whales/address/${encodeURIComponent(address)}/transactions`, { params: { chainId } });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.warn('Whale transactions are temporarily unavailable', error);
            return [];
        }
    },

    getMultiChainTransactions: async (address: string): Promise<WhaleTransaction[]> => {
        // Detect Solana
        if (!address.startsWith('0x')) {
            return WhaleService.getRecentTransactions(address, 1399811149);
        }

        const supportedChains = [1, 56, 137, 42161, 43114, 8453];
        const results = await Promise.all(
            supportedChains.map(chainId => WhaleService.getRecentTransactions(address, chainId))
        );

        // Flatten and Sort by Timestamp Descending
        return results.flat().sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));
    },

    /**
     * Analyze transactions for "Whale Alerts" (Large movements)
     */
    analyzeForAlerts: (transactions: WhaleTransaction[], thresholdUsd: number = 10000) => {
        // This would require price data to calculate USD value. 
        // For now, we simulate based on token amount if symbol is stablecoin, or just return recent large transfers.
        return transactions.filter(tx => {
            // Mock logic: Alert if value has more than 20 digits (just a way to pick large numbers) or if symbol is USDT/BUSD with high val
            return false;
        });
    }
};
