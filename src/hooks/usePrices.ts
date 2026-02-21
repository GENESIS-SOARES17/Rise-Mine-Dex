import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { CryptoPrice } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export function usePrices() {
  const { prices, setPrices } = useStore();

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data: CryptoPrice[] = await response.json();
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
      // Use mock data if API fails
      setPrices(getMockPrices());
    }
  }, [setPrices]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, refetch: fetchPrices };
}

function getMockPrices(): CryptoPrice[] {
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67234.12, price_change_percentage_24h: 2.34, image: '' },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3456.78, price_change_percentage_24h: -1.23, image: '' },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 178.45, price_change_percentage_24h: 5.67, image: '' },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 567.89, price_change_percentage_24h: 0.89, image: '' },
    { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.5234, price_change_percentage_24h: -2.45, image: '' },
    { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.4567, price_change_percentage_24h: 3.21, image: '' },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 34.56, price_change_percentage_24h: 1.78, image: '' },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.1234, price_change_percentage_24h: -0.56, image: '' },
    { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 7.89, price_change_percentage_24h: 2.12, image: '' },
    { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 14.56, price_change_percentage_24h: 4.32, image: '' },
    { id: 'polygon', symbol: 'matic', name: 'Polygon', current_price: 0.8765, price_change_percentage_24h: -1.89, image: '' },
    { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 9.87, price_change_percentage_24h: 1.45, image: '' },
    { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 89.12, price_change_percentage_24h: 0.67, image: '' },
    { id: 'cosmos', symbol: 'atom', name: 'Cosmos', current_price: 8.76, price_change_percentage_24h: 2.89, image: '' },
    { id: 'near', symbol: 'near', name: 'NEAR Protocol', current_price: 5.43, price_change_percentage_24h: -3.21, image: '' },
    { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum', current_price: 1.23, price_change_percentage_24h: 1.56, image: '' },
    { id: 'optimism', symbol: 'op', name: 'Optimism', current_price: 2.34, price_change_percentage_24h: 2.78, image: '' },
    { id: 'aptos', symbol: 'apt', name: 'Aptos', current_price: 8.90, price_change_percentage_24h: -0.89, image: '' },
    { id: 'sui', symbol: 'sui', name: 'Sui', current_price: 1.45, price_change_percentage_24h: 4.56, image: '' },
    { id: 'injective-protocol', symbol: 'inj', name: 'Injective', current_price: 23.45, price_change_percentage_24h: 3.45, image: '' },
  ];
}
