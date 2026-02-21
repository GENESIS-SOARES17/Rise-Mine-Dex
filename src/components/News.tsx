import React from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  Clock, 
  TrendingUp,
  Star,
  RefreshCw
} from 'lucide-react';
import { useNews } from '../hooks/useNews';

export function News() {
  const { news, refetch } = useNews();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const isHighlighted = (item: typeof news[0]) => {
    const keywords = ['RISE', 'Ethereum', 'DeFi', 'ETH'];
    return keywords.some(keyword => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.currencies?.some(c => keywords.includes(c.code))
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Crypto News</h2>
            <p className="text-sm text-gray-400">Latest updates from the crypto world</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-white text-sm">Refresh</span>
        </button>
      </div>

      {/* Featured News */}
      {news.length > 0 && (
        <div className="glass rounded-3xl p-6 mb-6 neon-purple">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium">Featured</span>
          </div>
          <a
            href={news[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <h3 className="text-2xl font-bold text-white group-hover:text-rise-primary transition-colors mb-3">
              {news[0].title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Newspaper className="w-4 h-4" />
                {news[0].source}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(news[0].published_at)}
              </span>
              {news[0].currencies && news[0].currencies.length > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {news[0].currencies.map(c => c.code).join(', ')}
                </div>
              )}
            </div>
          </a>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.slice(1).map((item) => {
          const highlighted = isHighlighted(item);
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`glass rounded-2xl p-5 hover:scale-[1.02] transition-all group ${
                highlighted ? 'border-rise-primary/50 bg-rise-primary/5' : ''
              }`}
            >
              {highlighted && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-rise-primary" />
                  <span className="text-xs text-rise-primary font-medium">Highlighted</span>
                </div>
              )}
              <h4 className="font-semibold text-white group-hover:text-rise-primary transition-colors line-clamp-2 mb-3">
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{formatTime(item.published_at)}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-rise-primary transition-colors" />
              </div>
              {item.currencies && item.currencies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.currencies.slice(0, 3).map((currency, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-lg bg-white/10 text-xs text-gray-300"
                    >
                      {currency.code}
                    </span>
                  ))}
                </div>
              )}
            </a>
          );
        })}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
          Load More News
        </button>
      </div>
    </div>
  );
}
