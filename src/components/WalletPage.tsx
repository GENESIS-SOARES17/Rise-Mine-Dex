import React from 'react';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Send, 
  ArrowDownLeft,
  CheckCircle
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { RISE_TESTNET, TOKENS } from '../config/contracts';
import { ethers } from 'ethers';

export function WalletPage() {
  const { 
    address, 
    isConnected, 
    connect, 
    balances, 
    updateBalances,
    chainId 
  } = useWallet();
  const [copied, setCopied] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await updateBalances();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatBalance = (balance: bigint, decimals: number = 18) => {
    return parseFloat(ethers.formatUnits(balance, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const tokens = [
    { 
      ...TOKENS.RISE, 
      balance: balances.rise, 
      usdValue: parseFloat(ethers.formatEther(balances.rise)) * 2.45,
      color: 'from-rise-primary to-purple-500'
    },
    { 
      ...TOKENS.USDC, 
      balance: balances.usdc, 
      usdValue: parseFloat(ethers.formatUnits(balances.usdc, 6)),
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      ...TOKENS.USDT, 
      balance: balances.usdt, 
      usdValue: parseFloat(ethers.formatUnits(balances.usdt, 6)),
      color: 'from-green-500 to-emerald-500'
    },
  ];

  const totalUsdValue = tokens.reduce((sum, t) => sum + t.usdValue, 0) + 
    parseFloat(ethers.formatEther(balances.eth)) * 3500;

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="glass rounded-3xl p-8 text-center neon-purple">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your MetaMask wallet to view balances and interact with Rise Mini DEX
          </p>
          <button
            onClick={connect}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rise-primary to-rise-secondary text-white font-bold text-lg hover:opacity-90 transition-all"
          >
            Connect MetaMask
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Make sure you're connected to Rise Testnet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Wallet Header */}
      <div className="glass rounded-3xl p-6 neon-purple">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-white text-lg">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-rise-accent" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <a
                  href={`${RISE_TESTNET.explorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Network Status */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl w-fit ${
          chainId === RISE_TESTNET.chainId
            ? 'bg-rise-accent/20 border border-rise-accent/30'
            : 'bg-red-500/20 border border-red-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            chainId === RISE_TESTNET.chainId ? 'bg-rise-accent' : 'bg-red-400'
          } animate-pulse`} />
          <span className={chainId === RISE_TESTNET.chainId ? 'text-rise-accent' : 'text-red-400'}>
            {chainId === RISE_TESTNET.chainId ? 'Rise Testnet' : 'Wrong Network'}
          </span>
        </div>
      </div>

      {/* Total Balance */}
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-gray-400 mb-2">Total Balance</p>
        <p className="text-4xl font-bold gradient-text">
          ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rise-primary/20 text-rise-primary font-medium hover:bg-rise-primary/30 transition-colors">
            <Send className="w-4 h-4" />
            Send
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rise-accent/20 text-rise-accent font-medium hover:bg-rise-accent/30 transition-colors">
            <ArrowDownLeft className="w-4 h-4" />
            Receive
          </button>
        </div>
      </div>

      {/* Token Balances */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Token Balances</h3>
        
        {/* ETH Balance */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-3 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xl">
                ⟠
              </div>
              <div>
                <p className="font-medium text-white">ETH</p>
                <p className="text-sm text-gray-400">Ethereum</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-white text-lg">{formatBalance(balances.eth)}</p>
              <p className="text-sm text-gray-400">
                ${(parseFloat(ethers.formatEther(balances.eth)) * 3500).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Other Tokens */}
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${token.color} flex items-center justify-center text-xl`}>
                    {token.logo}
                  </div>
                  <div>
                    <p className="font-medium text-white">{token.symbol}</p>
                    <p className="text-sm text-gray-400">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white text-lg">
                    {formatBalance(token.balance, token.decimals)}
                  </p>
                  <p className="text-sm text-gray-400">
                    ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://faucet.testnet.riselabs.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rise-primary/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">🚰</div>
            <p className="font-medium text-white">Get Testnet ETH</p>
            <p className="text-xs text-gray-400 mt-1">Rise Faucet</p>
          </a>
          <a
            href={RISE_TESTNET.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rise-primary/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">🔍</div>
            <p className="font-medium text-white">View Explorer</p>
            <p className="text-xs text-gray-400 mt-1">Rise Testnet</p>
          </a>
        </div>
      </div>
    </div>
  );
}
