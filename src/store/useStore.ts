import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, WalletState, CryptoPrice, NewsItem, Bet, PoolBalance } from '../types';

interface AppState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Wallet
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  resetWallet: () => void;
  
  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Prices
  prices: CryptoPrice[];
  setPrices: (prices: CryptoPrice[]) => void;
  
  // News
  news: NewsItem[];
  setNews: (news: NewsItem[]) => void;
  
  // Pool balances
  poolBalances: PoolBalance[];
  setPoolBalances: (balances: PoolBalance[]) => void;
  
  // User bets
  userBets: Bet[];
  setUserBets: (bets: Bet[]) => void;
  
  // Stats
  stats: {
    totalLiquidity: bigint;
    totalFees: bigint;
    totalVolume: bigint;
    activeBets: number;
  };
  setStats: (stats: Partial<AppState['stats']>) => void;
}

const initialWallet: WalletState = {
  address: null,
  chainId: null,
  isConnected: false,
  balances: {
    eth: BigInt(0),
    rise: BigInt(0),
    usdc: BigInt(0),
    usdt: BigInt(0),
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      // Wallet
      wallet: initialWallet,
      setWallet: (wallet) => set((state) => ({ 
        wallet: { ...state.wallet, ...wallet } 
      })),
      resetWallet: () => set({ wallet: initialWallet }),
      
      // Active tab
      activeTab: 'swap',
      setActiveTab: (activeTab) => set({ activeTab }),
      
      // Prices
      prices: [],
      setPrices: (prices) => set({ prices }),
      
      // News
      news: [],
      setNews: (news) => set({ news }),
      
      // Pool balances
      poolBalances: [],
      setPoolBalances: (poolBalances) => set({ poolBalances }),
      
      // User bets
      userBets: [],
      setUserBets: (userBets) => set({ userBets }),
      
      // Stats
      stats: {
        totalLiquidity: BigInt(0),
        totalFees: BigInt(0),
        totalVolume: BigInt(0),
        activeBets: 0,
      },
      setStats: (stats) => set((state) => ({
        stats: { ...state.stats, ...stats },
      })),
    }),
    {
      name: 'rise-dex-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
