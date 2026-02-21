import React, { useState, useEffect } from 'react';
import { Plus, Minus, Droplets, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { TOKENS, CONTRACTS } from '../config/contracts';
import { ethers } from 'ethers';

const tokenList = Object.values(TOKENS);

export function Liquidity() {
  const { 
    isConnected, 
    connect, 
    approve, 
    addLiquidity, 
    removeLiquidity, 
    getAllPairs, 
    getPairInfo, 
    getUserLiquidity, 
    getReserves,
    address 
  } = useWallet();

  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [tokenA, setTokenA] = useState(tokenList[0]);
  const [tokenB, setTokenB] = useState(tokenList[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [removePercent, setRemovePercent] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [pairs, setPairs] = useState<any[]>([]);
  const [userPositions, setUserPositions] = useState<Record<string, any>>({});
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [pairReserves, setPairReserves] = useState<{ reserveA: bigint; reserveB: bigint } | null>(null);

  // Carregar todos os pares do contrato
  useEffect(() => {
    const loadPairs = async () => {
      if (!isConnected) return;
      try {
        const pairIds = await getAllPairs();
        const pairsData = await Promise.all(pairIds.map(async (id: string) => {
          const info = await getPairInfo(id);
          return {
            id,
            tokenA: info[0],
            tokenB: info[1],
            reserveA: info[2],
            reserveB: info[3],
            totalLiquidity: info[4],
          };
        }));
        setPairs(pairsData);
      } catch (err) {
        console.error('Error loading pairs:', err);
      }
    };
    loadPairs();
  }, [isConnected, getAllPairs, getPairInfo]);

  // Carregar posições do usuário
  useEffect(() => {
    const loadUserPositions = async () => {
      if (!isConnected || !address || pairs.length === 0) return;
      try {
        const positions: Record<string, any> = {};
        for (const pair of pairs) {
          const pos = await getUserLiquidity(pair.id, address);
          if (pos[0] > 0n) { // liquidity > 0
            positions[pair.id] = {
              liquidity: pos[0],
              depositedA: pos[1],
              depositedB: pos[2],
            };
          }
        }
        setUserPositions(positions);
      } catch (err) {
        console.error('Error loading user positions:', err);
      }
    };
    loadUserPositions();
  }, [pairs, isConnected, address, getUserLiquidity]);

  // Buscar reservas do par selecionado (para o modo add)
  useEffect(() => {
    const fetchReserves = async () => {
      if (!tokenA || !tokenB) return;
      try {
        const reserves = await getReserves(tokenA.address, tokenB.address);
        setPairReserves({ reserveA: reserves[0], reserveB: reserves[1] });
      } catch {
        // Se o par não existe, getReserves pode reverter; ignoramos
        setPairReserves(null);
      }
    };
    if (mode === 'add') {
      fetchReserves();
    }
  }, [tokenA, tokenB, mode, getReserves]);

  // Calcular amountB baseado nas reservas (se disponíveis)
  useEffect(() => {
    if (!amountA || parseFloat(amountA) === 0 || !pairReserves || pairReserves.reserveA === 0n) {
      setAmountB('');
      return;
    }
    try {
      const amountAWei = ethers.parseUnits(amountA, tokenA.decimals);
      const amountBWei = (amountAWei * pairReserves.reserveB) / pairReserves.reserveA;
      setAmountB(ethers.formatUnits(amountBWei, tokenB.decimals));
    } catch (err) {
      console.error('Error calculating amountB:', err);
      setAmountB('');
    }
  }, [amountA, pairReserves, tokenA, tokenB]);

  const handleAddLiquidity = async () => {
    if (!isConnected) {
      connect();
      return;
    }
    if (!pairReserves) {
      alert('Este par ainda não existe. Crie-o primeiro no contrato.');
      return;
    }
    setIsProcessing(true);
    setStatus('idle');
    try {
      const amountAWei = ethers.parseUnits(amountA, tokenA.decimals);
      const amountBWei = ethers.parseUnits(amountB, tokenB.decimals);
      
      await approve(tokenA.address, CONTRACTS.MiniAMM, amountAWei);
      await approve(tokenB.address, CONTRACTS.MiniAMM, amountBWei);

      await addLiquidity(tokenA.address, tokenB.address, amountAWei, amountBWei);
      
      setStatus('success');
      setAmountA('');
      setAmountB('');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar liquidez. Verifique o console.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !selectedPairId) return;
    const position = userPositions[selectedPairId];
    if (!position) return;
    const pair = pairs.find(p => p.id === selectedPairId);
    if (!pair) return;

    setIsProcessing(true);
    try {
      const liquidityToRemove = (position.liquidity * BigInt(removePercent)) / 100n;
      await removeLiquidity(pair.tokenA, pair.tokenB, liquidityToRemove);
      setStatus('success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao remover liquidez.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getTokenSymbol = (address: string) => {
    const token = tokenList.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token ? token.symbol : address.slice(0, 6) + '...';
  };

  const getTokenLogo = (address: string) => {
    const token = tokenList.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token ? token.logo : '🪙';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 p-1 bg-rise-surface/50 rounded-xl w-fit mx-auto">
        <button
          onClick={() => setMode('add')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'add'
              ? 'bg-gradient-to-r from-rise-primary to-rise-secondary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Liquidity
        </button>
        <button
          onClick={() => setMode('remove')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'remove'
              ? 'bg-gradient-to-r from-rise-primary to-rise-secondary text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Minus className="w-4 h-4" />
          Remove Liquidity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel Add/Remove */}
        <div className="glass rounded-3xl p-6 neon-purple">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === 'add' ? 'Provide liquidity to earn fees' : 'Withdraw your liquidity'}
              </p>
            </div>
          </div>

          {mode === 'add' ? (
            <>
              {/* Token A Input */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Token A</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl font-bold text-white focus:outline-none"
                  />
                  <select
                    value={tokenA.symbol}
                    onChange={(e) => setTokenA(tokenList.find(t => t.symbol === e.target.value)!)}
                    className="px-4 py-3 rounded-xl bg-rise-surface border border-rise-border text-white font-medium focus:outline-none cursor-pointer"
                  >
                    {tokenList.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.logo} {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-rise-surface border-4 border-rise-dark flex items-center justify-center">
                  <Plus className="w-4 h-4 text-rise-primary" />
                </div>
              </div>

              {/* Token B Input */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Token B</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={amountB}
                    readOnly
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl font-bold text-white focus:outline-none"
                  />
                  <select
                    value={tokenB.symbol}
                    onChange={(e) => setTokenB(tokenList.find(t => t.symbol === e.target.value)!)}
                    className="px-4 py-3 rounded-xl bg-rise-surface border border-rise-border text-white font-medium focus:outline-none cursor-pointer"
                  >
                    {tokenList.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.logo} {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {pairReserves && pairReserves.reserveA > 0n && (
                <div className="mt-4 p-3 rounded-xl bg-white/5 text-sm">
                  <p className="text-gray-400">
                    Current reserves: {ethers.formatUnits(pairReserves.reserveA, tokenA.decimals)} {tokenA.symbol} /{' '}
                    {ethers.formatUnits(pairReserves.reserveB, tokenB.decimals)} {tokenB.symbol}
                  </p>
                </div>
              )}

              {!pairReserves && (
                <div className="mt-4 p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm text-yellow-500">
                    Este par não existe. Crie-o primeiro no contrato MiniAMM.
                  </p>
                </div>
              )}

              <button
                onClick={handleAddLiquidity}
                disabled={isProcessing || !amountA || !amountB || !pairReserves}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  status === 'success'
                    ? 'bg-rise-accent text-white'
                    : 'bg-gradient-to-r from-rise-primary to-rise-secondary text-white hover:opacity-90 disabled:opacity-50'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Liquidity Added!
                  </>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : (
                  'Add Liquidity'
                )}
              </button>
            </>
          ) : (
            <>
              {Object.keys(userPositions).length > 0 ? (
                <div className="space-y-3 mb-6">
                  {Object.entries(userPositions).map(([pairId, pos]) => {
                    const pair = pairs.find(p => p.id === pairId);
                    if (!pair) return null;
                    const symbolA = getTokenSymbol(pair.tokenA);
                    const symbolB = getTokenSymbol(pair.tokenB);
                    const logoA = getTokenLogo(pair.tokenA);
                    const logoB = getTokenLogo(pair.tokenB);
                    return (
                      <div
                        key={pairId}
                        onClick={() => setSelectedPairId(pairId)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPairId === pairId
                            ? 'bg-rise-primary/20 border-rise-primary'
                            : 'bg-white/5 border-white/10 hover:border-rise-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              <span className="text-xl">{logoA}</span>
                              <span className="text-xl">{logoB}</span>
                            </div>
                            <span className="font-medium text-white">
                              {symbolA}/{symbolB}
                            </span>
                          </div>
                          <span className="text-rise-accent font-medium">
                            {ethers.formatUnits(pos.liquidity, 18)} LP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No liquidity positions found</div>
              )}

              {selectedPairId && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400">Amount to Remove</span>
                      <span className="text-2xl font-bold text-white">{removePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={removePercent}
                      onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                      className="w-full h-2 bg-rise-surface rounded-lg appearance-none cursor-pointer accent-rise-primary"
                    />
                    <div className="flex justify-between mt-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => setRemovePercent(percent)}
                          className="px-3 py-1 rounded-lg bg-white/10 text-sm text-gray-300 hover:bg-white/20 transition-colors"
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleRemoveLiquidity}
                    disabled={isProcessing || removePercent === 0}
                    className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      status === 'success'
                        ? 'bg-rise-accent text-white'
                        : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 disabled:opacity-50'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : status === 'success' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Liquidity Removed!
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet'
                    ) : (
                      'Remove Liquidity'
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Painel "Your Positions" */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Your Positions</h3>
          {Object.keys(userPositions).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(userPositions).map(([pairId, pos]) => {
                const pair = pairs.find(p => p.id === pairId);
                if (!pair) return null;
                const tokenAInfo = tokenList.find(t => t.address.toLowerCase() === pair.tokenA.toLowerCase());
                const tokenBInfo = tokenList.find(t => t.address.toLowerCase() === pair.tokenB.toLowerCase());
                return (
                  <div key={pairId} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center text-sm">
                            {tokenAInfo?.logo}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-sm">
                            {tokenBInfo?.logo}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {tokenAInfo?.symbol}/{tokenBInfo?.symbol}
                          </p>
                          <p className="text-xs text-gray-400">
                            LP Tokens: {ethers.formatUnits(pos.liquidity, 18)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-400">{tokenAInfo?.symbol} Deposited</p>
                        <p className="text-sm font-mono text-white">
                          {ethers.formatUnits(pos.depositedA, tokenAInfo?.decimals || 18)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{tokenBInfo?.symbol} Deposited</p>
                        <p className="text-sm font-mono text-white">
                          {ethers.formatUnits(pos.depositedB, tokenBInfo?.decimals || 18)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Droplets className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No liquidity positions yet</p>
              <p className="text-sm text-gray-500 mt-1">Add liquidity to start earning fees</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}