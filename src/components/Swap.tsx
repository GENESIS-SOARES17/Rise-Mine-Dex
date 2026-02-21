import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Settings, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { TOKENS } from '../config/contracts';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';

const tokenList = Object.values(TOKENS);

export function Swap() {
  const { isConnected, connect } = useWallet();
  const [tokenIn, setTokenIn] = useState(tokenList[0]);
  const [tokenOut, setTokenOut] = useState(tokenList[1]);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // Mock exchange rate calculation
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      // Simulate price calculation with mock reserves
      const mockRate = tokenIn.symbol === 'RISE' ? 2.5 : tokenIn.symbol === 'USDC' ? 0.4 : 0.38;
      const fee = parseFloat(amountIn) * 0.003;
      const output = (parseFloat(amountIn) - fee) * mockRate;
      setAmountOut(output.toFixed(6));
    } else {
      setAmountOut('');
    }
  }, [amountIn, tokenIn, tokenOut]);

  const handleSwapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    setIsSwapping(true);
    setSwapStatus('pending');

    // Simulate swap transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Random success/failure for demo
    const success = Math.random() > 0.2;
    setSwapStatus(success ? 'success' : 'error');
    
    setTimeout(() => {
      setIsSwapping(false);
      if (success) {
        setAmountIn('');
        setAmountOut('');
      }
      setTimeout(() => setSwapStatus('idle'), 3000);
    }, 1500);
  };

  const fee = amountIn ? (parseFloat(amountIn) * 0.003).toFixed(6) : '0';
  const priceImpact = amountIn && parseFloat(amountIn) > 1000 ? '0.15' : '0.02';

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass rounded-3xl p-6 neon-purple">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Swap</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-gray-400 mb-3">Slippage Tolerance</p>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    slippage === value
                      ? 'bg-rise-primary text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm text-center focus:outline-none focus:border-rise-primary"
                placeholder="Custom"
              />
            </div>
          </div>
        )}

        {/* Token In */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">You Pay</span>
            <span className="text-sm text-gray-400">Balance: 1,000.00</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-3xl font-bold text-white focus:outline-none"
            />
            <select
              value={tokenIn.symbol}
              onChange={(e) => setTokenIn(tokenList.find(t => t.symbol === e.target.value)!)}
              className="px-4 py-3 rounded-xl bg-rise-surface border border-rise-border text-white font-medium focus:outline-none focus:border-rise-primary cursor-pointer"
            >
              {tokenList.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.logo} {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="w-12 h-12 rounded-xl bg-rise-surface border-4 border-rise-dark flex items-center justify-center hover:bg-rise-primary/20 transition-all hover:scale-110"
          >
            <ArrowDownUp className="w-5 h-5 text-rise-primary" />
          </button>
        </div>

        {/* Token Out */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">You Receive</span>
            <span className="text-sm text-gray-400">Balance: 2,500.00</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amountOut}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-3xl font-bold text-white focus:outline-none"
            />
            <select
              value={tokenOut.symbol}
              onChange={(e) => setTokenOut(tokenList.find(t => t.symbol === e.target.value)!)}
              className="px-4 py-3 rounded-xl bg-rise-surface border border-rise-border text-white font-medium focus:outline-none focus:border-rise-primary cursor-pointer"
            >
              {tokenList.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.logo} {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Details */}
        {amountIn && parseFloat(amountIn) > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-white/5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Rate
              </span>
              <span className="text-white">
                1 {tokenIn.symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(4)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Fee (0.3%)</span>
              <span className="text-white">{fee} {tokenIn.symbol}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className={parseFloat(priceImpact) > 0.1 ? 'text-orange-400' : 'text-rise-accent'}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Minimum Received</span>
              <span className="text-white">
                {(parseFloat(amountOut) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={isSwapping || !amountIn || parseFloat(amountIn) <= 0}
          className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            swapStatus === 'success'
              ? 'bg-rise-accent text-white'
              : swapStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-gradient-to-r from-rise-primary to-rise-secondary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isSwapping ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {swapStatus === 'pending' ? 'Swapping...' : swapStatus === 'success' ? 'Success!' : 'Failed'}
            </>
          ) : swapStatus === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Swap Successful!
            </>
          ) : swapStatus === 'error' ? (
            <>
              <AlertCircle className="w-5 h-5" />
              Swap Failed
            </>
          ) : !isConnected ? (
            'Connect Wallet'
          ) : !amountIn || parseFloat(amountIn) <= 0 ? (
            'Enter Amount'
          ) : (
            'Swap'
          )}
        </button>

        {/* Fee Pool Info */}
        <div className="mt-4 p-3 rounded-xl bg-rise-accent/10 border border-rise-accent/20">
          <p className="text-sm text-rise-accent text-center">
            💰 0.3% fee goes to the public Fee Pool for prediction rewards
          </p>
        </div>
      </div>
    </div>
  );
}
