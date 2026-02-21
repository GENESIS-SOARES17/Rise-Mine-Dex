import React from 'react';
import { 
  Wallet, 
  ArrowLeftRight, 
  Droplets, 
  Target, 
  Newspaper, 
  LayoutDashboard,
  Sun,
  Moon,
  Zap,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWallet } from '../hooks/useWallet';
import { RISE_TESTNET } from '../config/contracts';
import type { Theme } from '../types';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
  { id: 'liquidity', label: 'Liquidity', icon: Droplets },
  { id: 'prediction', label: 'Prediction', icon: Target },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'news', label: 'News', icon: Newspaper },
];

const themes: { id: Theme; label: string; icon: React.ElementType }[] = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'neon', label: 'Neon', icon: Zap },
];

export function Navbar() {
  const { activeTab, setActiveTab, theme, setTheme } = useStore();
  const { address, isConnected, isConnecting, connect, disconnect, chainId } = useWallet();
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

  const isCorrectNetwork = chainId === RISE_TESTNET.chainId;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center neon-purple">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">Rise DEX</h1>
              <p className="text-xs text-gray-400">Mini DEX & Prediction</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-rise-surface/50 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-rise-primary to-rise-secondary text-white shadow-lg neon-purple'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rise-surface/50 border border-rise-border hover:border-rise-primary/50 transition-all"
              >
                {theme === 'dark' && <Moon className="w-4 h-4 text-rise-primary" />}
                {theme === 'light' && <Sun className="w-4 h-4 text-yellow-400" />}
                {theme === 'neon' && <Zap className="w-4 h-4 text-green-400" />}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-36 glass rounded-xl overflow-hidden shadow-xl">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                          theme === t.id
                            ? 'bg-rise-primary/20 text-rise-primary'
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Network Badge */}
            {isConnected && (
              <a
                href={RISE_TESTNET.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isCorrectNetwork
                    ? 'bg-rise-accent/20 text-rise-accent border border-rise-accent/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-rise-accent' : 'bg-red-400'} animate-pulse`} />
                {isCorrectNetwork ? 'Rise Testnet' : 'Wrong Network'}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Wallet Button */}
            {isConnected ? (
              <button
                onClick={disconnect}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rise-primary to-rise-secondary text-white font-medium hover:opacity-90 transition-all neon-purple"
              >
                <Wallet className="w-4 h-4" />
                <span className="font-mono">{formatAddress(address!)}</span>
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rise-primary to-rise-secondary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 neon-purple"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rise-primary to-rise-secondary text-white'
                    : 'text-gray-400 hover:text-white bg-rise-surface/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
