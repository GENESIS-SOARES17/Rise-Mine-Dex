export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
}

export interface Pair {
  id: string;
  tokenA: Token;
  tokenB: Token;
  reserveA: bigint;
  reserveB: bigint;
  totalLiquidity: bigint;
}

export interface LiquidityPosition {
  pairId: string;
  liquidity: bigint;
  depositedA: bigint;
  depositedB: bigint;
}

export interface Bet {
  id: number;
  user: string;
  token: Token;
  amount: bigint;
  initialPrice: bigint;
  finalPrice: bigint;
  startTime: number;
  endTime: number;
  predictUp: boolean;
  status: BetStatus;
}

export enum BetStatus {
  Active = 0,
  Won = 1,
  Lost = 2,
  Cancelled = 3
}

export interface PoolBalance {
  token: Token;
  balance: bigint;
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  currencies?: { code: string }[];
}

export type Theme = 'dark' | 'light' | 'neon';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  balances: {
    eth: bigint;
    rise: bigint;
    usdc: bigint;
    usdt: bigint;
  };
}
