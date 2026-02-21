import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePrices } from '../hooks/usePrices';

export function TickerBar() {
  const { prices } = usePrices();

  if (prices.length === 0) {
    return (
      <div className="h-10 bg-rise-dark/80 backdrop-blur-sm border-b border-rise-border flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading prices...</div>
      </div>
    );
  }

  // Duplicate prices for seamless loop
  const duplicatedPrices = [...prices, ...prices];

  return (
    <div className="h-10 bg-rise-dark/80 backdrop-blur-sm border-b border-rise-border overflow-hidden">
      <div className="flex items-center h-full animate-slide-left whitespace-nowrap">
        {duplicatedPrices.map((coin, index) => (
          <div
            key={`${coin.id}-${index}`}
            className="flex items-center gap-2 px-4 border-r border-rise-border/50"
          >
            <span className="font-semibold text-white uppercase text-sm">
              {coin.symbol}
            </span>
            <span className="text-gray-300 text-sm font-mono">
              ${coin.current_price.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: coin.current_price < 1 ? 4 : 2 
              })}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                coin.price_change_percentage_24h >= 0 
                  ? 'text-rise-accent' 
                  : 'text-red-400'
              }`}
            >
              {coin.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
