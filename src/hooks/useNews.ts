import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { NewsItem } from '../types';

export function useNews() {
  const { news, setNews } = useStore();

  const fetchNews = useCallback(async () => {
    try {
      // CryptoPanic API requires authentication, using mock data
      // In production, you would use: https://cryptopanic.com/api/v1/posts/
      setNews(getMockNews());
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews(getMockNews());
    }
  }, [setNews]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { news, refetch: fetchNews };
}

function getMockNews(): NewsItem[] {
  const now = new Date();
  return [
    {
      id: '1',
      title: 'Rise Protocol Launches Revolutionary Layer 2 Solution',
      source: 'CoinDesk',
      url: 'https://coindesk.com',
      published_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      currencies: [{ code: 'RISE' }, { code: 'ETH' }],
    },
    {
      id: '2',
      title: 'Ethereum Gas Fees Drop to Yearly Low Amid Network Upgrades',
      source: 'The Block',
      url: 'https://theblock.co',
      published_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      currencies: [{ code: 'ETH' }],
    },
    {
      id: '3',
      title: 'DeFi TVL Surges Past $100B as Institutional Interest Grows',
      source: 'Decrypt',
      url: 'https://decrypt.co',
      published_at: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
      currencies: [{ code: 'DeFi' }],
    },
    {
      id: '4',
      title: 'Bitcoin ETF Inflows Hit Record High in Q1 2025',
      source: 'Bloomberg Crypto',
      url: 'https://bloomberg.com',
      published_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      currencies: [{ code: 'BTC' }],
    },
    {
      id: '5',
      title: 'Rise Testnet Achieves 10,000 TPS in Latest Benchmark',
      source: 'CryptoSlate',
      url: 'https://cryptoslate.com',
      published_at: new Date(now.getTime() - 1000 * 60 * 150).toISOString(),
      currencies: [{ code: 'RISE' }],
    },
    {
      id: '6',
      title: 'Major DeFi Protocol Announces Integration with Rise Network',
      source: 'DeFi Pulse',
      url: 'https://defipulse.com',
      published_at: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      currencies: [{ code: 'RISE' }, { code: 'DeFi' }],
    },
    {
      id: '7',
      title: 'Ethereum Foundation Releases Roadmap for 2025',
      source: 'Ethereum.org',
      url: 'https://ethereum.org',
      published_at: new Date(now.getTime() - 1000 * 60 * 210).toISOString(),
      currencies: [{ code: 'ETH' }],
    },
    {
      id: '8',
      title: 'New Prediction Market Protocol Gains Traction on Rise',
      source: 'CoinTelegraph',
      url: 'https://cointelegraph.com',
      published_at: new Date(now.getTime() - 1000 * 60 * 240).toISOString(),
      currencies: [{ code: 'RISE' }, { code: 'DeFi' }],
    },
  ];
}
