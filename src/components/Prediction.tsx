import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Loader2, 
  CheckCircle,
  XCircle,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { TOKENS, CONTRACTS } from '../config/contracts';
import { ethers } from 'ethers';

const tokenList = Object.values(TOKENS);
const durations = [
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: '1 hour', value: 3600 },
  { label: '4 hours', value: 14400 },
  { label: '24 hours', value: 86400 },
];

export function Prediction() {
  const { isConnected, connect, approve, placeBet, getPrice, getUserBets, getBet, address } = useWallet();
  const [selectedToken, setSelectedToken] = useState(tokenList[0]);
  const [amount, setAmount] = useState('');
  const [predictUp, setPredictUp] = useState(true);
  const [duration, setDuration] = useState(durations[0]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [activeBets, setActiveBets] = useState<any[]>([]);
  const [betHistory, setBetHistory] = useState<any[]>([]);

  // Buscar preço atual
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const [price] = await getPrice(selectedToken.address);
        // price vem em wei (com 18 decimais)
        setCurrentPrice(parseFloat(ethers.formatUnits(price, 18)));
      } catch (err) {
        console.error('Error fetching price:', err);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, [selectedToken, getPrice]);

  // Buscar apostas do usuário
  useEffect(() => {
    const fetchUserBets = async () => {
      if (!isConnected || !address) return;
      try {
        const betIds = await getUserBets(address);
        const bets = await Promise.all(betIds.map(async (id: number) => {
          const bet = await getBet(id);
          return {
            id,
            token: bet[1],
            amount: bet[2],
            initialPrice: bet[3],
            finalPrice: bet[4],
            startTime: bet[5],
            endTime: bet[6],
            predictUp: bet[7],
            status: bet[8], // 0: Active, 1: Won, 2: Lost, 3: Cancelled
          };
        }));
        const active = bets.filter(b => b.status === 0);
        const history = bets.filter(b => b.status !== 0);
        setActiveBets(active);
        setBetHistory(history);
      } catch (err) {
        console.error('Error fetching bets:', err);
      }
    };
    fetchUserBets();
  }, [isConnected, address, getUserBets, getBet]);

  const handlePlaceBet = async () => {
    if (!isConnected) {
      connect();
      return;
    }
    setIsPlacing(true);
    try {
      const amountWei = ethers.parseUnits(amount, selectedToken.decimals);
      // Aprovar token
      await approve(selectedToken.address, CONTRACTS.PredictionMarket, amountWei);
      await placeBet(selectedToken.address, amountWei, predictUp, duration.value);
      setAmount('');
      // Recarregar apostas
      const betIds = await getUserBets(address!);
      // ... (simplificado, pode recarregar)
    } catch (err) {
      console.error(err);
      alert('Error placing bet');
    } finally {
      setIsPlacing(false);
    }
  };

  const formatTimeRemaining = (endTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(endTime) - now;
    if (remaining <= 0) return 'Ended';
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatDateTime = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Place Bet Panel */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 neon-purple">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Price Prediction</h2>
              <p className="text-sm text-gray-400">Predict price movement and win rewards</p>
            </div>
          </div>

          {/* Token Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {tokenList.map((token) => (
              <button
                key={token.symbol}
                onClick={() => setSelectedToken(token)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedToken.symbol === token.symbol
                    ? 'bg-rise-primary/20 border-rise-primary'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-2xl mb-2">{token.logo}</div>
                <p className="font-medium text-white">{token.symbol}</p>
                <p className="text-sm text-gray-400">
                  {currentPrice !== null ? `$${currentPrice.toFixed(4)}` : '...'}
                </p>
              </button>
            ))}
          </div>

          {/* Current Price Display */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Price</p>
                <p className="text-3xl font-bold text-white font-mono">
                  ${currentPrice !== null ? currentPrice.toFixed(4) : '...'}
                </p>
              </div>
            </div>
          </div>

          {/* Direction Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setPredictUp(true)}
              className={`p-6 rounded-xl border-2 transition-all ${
                predictUp
                  ? 'bg-rise-accent/20 border-rise-accent'
                  : 'bg-white/5 border-white/10 hover:border-rise-accent/50'
              }`}
            >
              <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${predictUp ? 'text-rise-accent' : 'text-gray-400'}`} />
              <p className={`font-bold text-lg ${predictUp ? 'text-rise-accent' : 'text-gray-300'}`}>Price Up</p>
            </button>
            <button
              onClick={() => setPredictUp(false)}
              className={`p-6 rounded-xl border-2 transition-all ${
                !predictUp
                  ? 'bg-red-500/20 border-red-500'
                  : 'bg-white/5 border-white/10 hover:border-red-500/50'
              }`}
            >
              <TrendingDown className={`w-8 h-8 mx-auto mb-2 ${!predictUp ? 'text-red-400' : 'text-gray-400'}`} />
              <p className={`font-bold text-lg ${!predictUp ? 'text-red-400' : 'text-gray-300'}`}>Price Down</p>
            </button>
          </div>

          {/* Amount Input */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Bet Amount</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-bold text-white focus:outline-none"
              />
              <span className="text-xl">{selectedToken.logo}</span>
              <span className="font-medium text-white">{selectedToken.symbol}</span>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Prediction Duration
            </p>
            <div className="flex flex-wrap gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    duration.value === d.value
                      ? 'bg-rise-primary text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={isPlacing || !amount || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              predictUp
                ? 'bg-gradient-to-r from-rise-accent to-teal-500'
                : 'bg-gradient-to-r from-red-500 to-orange-500'
            } text-white hover:opacity-90 disabled:opacity-50`}
          >
            {isPlacing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Placing Bet...
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              <>
                <Target className="w-5 h-5" />
                Place {predictUp ? 'UP' : 'DOWN'} Prediction
              </>
            )}
          </button>
        </div>

        {/* Active Bets & History */}
        <div className="space-y-6">
          {/* Active Bets */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rise-primary" />
              Active Predictions
            </h3>
            {activeBets.length > 0 ? (
              <div className="space-y-3">
                {activeBets.map((bet) => {
                  const token = tokenList.find(t => t.address === bet.token);
                  return (
                    <div key={bet.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{token?.logo}</span>
                          <span className="font-medium text-white">{token?.symbol}</span>
                          {bet.predictUp ? (
                            <TrendingUp className="w-4 h-4 text-rise-accent" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <span className="text-sm text-rise-primary font-mono">
                          {formatTimeRemaining(bet.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Amount: {ethers.formatUnits(bet.amount, token?.decimals || 18)}
                        </span>
                        <span className="text-gray-400">
                          Entry: ${parseFloat(ethers.formatUnits(bet.initialPrice, 18)).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No active predictions</p>
              </div>
            )}
          </div>

          {/* Bet History */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              History
            </h3>
            {betHistory.length > 0 ? (
              <div className="space-y-3">
                {betHistory.map((bet) => {
                  const token = tokenList.find(t => t.address === bet.token);
                  const won = bet.status === 1;
                  const amountFormatted = ethers.formatUnits(bet.amount, token?.decimals || 18);
                  return (
                    <div
                      key={bet.id}
                      className={`p-3 rounded-xl ${
                        won ? 'bg-rise-accent/10 border border-rise-accent/20' : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {won ? (
                            <CheckCircle className="w-4 h-4 text-rise-accent" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="font-medium text-white">{token?.symbol}</span>
                        </div>
                        <span className={`font-mono ${won ? 'text-rise-accent' : 'text-red-400'}`}>
                          {won ? `+${amountFormatted}` : `-${amountFormatted}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(bet.endTime)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No bet history</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}