import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStore } from '../store/useStore';
import { RISE_TESTNET, CONTRACTS, ERC20_ABI, MINI_AMM_ABI, FEE_POOL_ABI, PREDICTION_MARKET_ABI, TOKENS } from '../config/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const { wallet, setWallet, resetWallet } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProvider = useCallback(() => {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const getSigner = useCallback(async () => {
    if (!wallet.isConnected) throw new Error('Wallet not connected');
    const provider = getProvider();
    return provider.getSigner();
  }, [wallet.isConnected, getProvider]);

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const provider = getProvider();
        const network = await provider.getNetwork();
        setWallet({
          address: accounts[0],
          chainId: Number(network.chainId),
          isConnected: true,
        });
        await updateBalances(accounts[0]);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  }, [getProvider, setWallet]);

  const updateBalances = useCallback(async (address: string) => {
    try {
      const provider = getProvider();
      const ethBalance = await provider.getBalance(address);
      // Buscar saldos reais dos tokens
      const riseToken = new ethers.Contract(TOKENS.RISE.address, ERC20_ABI, provider);
      const usdcToken = new ethers.Contract(TOKENS.USDC.address, ERC20_ABI, provider);
      const usdtToken = new ethers.Contract(TOKENS.USDT.address, ERC20_ABI, provider);
      const riseBalance = await riseToken.balanceOf(address);
      const usdcBalance = await usdcToken.balanceOf(address);
      const usdtBalance = await usdtToken.balanceOf(address);
      setWallet({
        balances: {
          eth: ethBalance,
          rise: riseBalance,
          usdc: usdcBalance,
          usdt: usdtBalance,
        },
      });
    } catch (err) {
      console.error('Error updating balances:', err);
    }
  }, [getProvider, setWallet]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = getProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      if (chainId !== RISE_TESTNET.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: RISE_TESTNET.chainIdHex }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: RISE_TESTNET.chainIdHex,
                chainName: RISE_TESTNET.name,
                nativeCurrency: RISE_TESTNET.nativeCurrency,
                rpcUrls: [RISE_TESTNET.rpcUrl],
                blockExplorerUrls: [RISE_TESTNET.explorer],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }
      setWallet({ address, chainId: RISE_TESTNET.chainId, isConnected: true });
      await updateBalances(address);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, [getProvider, setWallet, updateBalances]);

  const disconnect = useCallback(() => {
    resetWallet();
  }, [resetWallet]);

  // Funções de aprovação
  const checkAllowance = useCallback(async (tokenAddress: string, spender: string, owner: string) => {
    const provider = getProvider();
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return await token.allowance(owner, spender);
  }, [getProvider]);

  const approve = useCallback(async (tokenAddress: string, spender: string, amount: bigint) => {
    const signer = await getSigner();
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const tx = await token.approve(spender, amount);
    await tx.wait();
  }, [getSigner]);

  // Funções do MiniAMM
  const swap = useCallback(async (tokenIn: string, tokenOut: string, amountIn: bigint) => {
    const signer = await getSigner();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, signer);
    const tx = await amm.swap(tokenIn, tokenOut, amountIn);
    await tx.wait();
    if (wallet.address) await updateBalances(wallet.address);
  }, [getSigner, updateBalances, wallet.address]);

  const addLiquidity = useCallback(async (tokenA: string, tokenB: string, amountA: bigint, amountB: bigint) => {
    const signer = await getSigner();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, signer);
    const tx = await amm.addLiquidity(tokenA, tokenB, amountA, amountB);
    await tx.wait();
    if (wallet.address) await updateBalances(wallet.address);
  }, [getSigner, updateBalances, wallet.address]);

  const removeLiquidity = useCallback(async (tokenA: string, tokenB: string, liquidityAmount: bigint) => {
    const signer = await getSigner();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, signer);
    const tx = await amm.removeLiquidity(tokenA, tokenB, liquidityAmount);
    await tx.wait();
    if (wallet.address) await updateBalances(wallet.address);
  }, [getSigner, updateBalances, wallet.address]);

  const getReserves = useCallback(async (tokenA: string, tokenB: string) => {
    const provider = getProvider();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, provider);
    return await amm.getReserves(tokenA, tokenB);
  }, [getProvider]);

  const getPairId = useCallback(async (tokenA: string, tokenB: string) => {
    const provider = getProvider();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, provider);
    return await amm.getPairId(tokenA, tokenB);
  }, [getProvider]);

  const getPairInfo = useCallback(async (pairId: string) => {
    const provider = getProvider();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, provider);
    return await amm.getPairInfo(pairId);
  }, [getProvider]);

  const getAllPairs = useCallback(async () => {
    const provider = getProvider();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, provider);
    return await amm.getAllPairs();
  }, [getProvider]);

  const getUserLiquidity = useCallback(async (pairId: string, userAddress: string) => {
    const provider = getProvider();
    const amm = new ethers.Contract(CONTRACTS.MiniAMM, MINI_AMM_ABI, provider);
    return await amm.getUserLiquidity(pairId, userAddress);
  }, [getProvider]);

  // Funções do PredictionMarket
  const placeBet = useCallback(async (token: string, amount: bigint, predictUp: boolean, duration: number) => {
    const signer = await getSigner();
    const prediction = new ethers.Contract(CONTRACTS.PredictionMarket, PREDICTION_MARKET_ABI, signer);
    const tx = await prediction.placeBet(token, amount, predictUp, duration);
    await tx.wait();
    if (wallet.address) await updateBalances(wallet.address);
  }, [getSigner, updateBalances, wallet.address]);

  const resolveBet = useCallback(async (betId: number) => {
    const signer = await getSigner();
    const prediction = new ethers.Contract(CONTRACTS.PredictionMarket, PREDICTION_MARKET_ABI, signer);
    const tx = await prediction.resolveBet(betId);
    await tx.wait();
  }, [getSigner]);

  const cancelBet = useCallback(async (betId: number) => {
    const signer = await getSigner();
    const prediction = new ethers.Contract(CONTRACTS.PredictionMarket, PREDICTION_MARKET_ABI, signer);
    const tx = await prediction.cancelBet(betId);
    await tx.wait();
  }, [getSigner]);

  const getBet = useCallback(async (betId: number) => {
    const provider = getProvider();
    const prediction = new ethers.Contract(CONTRACTS.PredictionMarket, PREDICTION_MARKET_ABI, provider);
    return await prediction.getBet(betId);
  }, [getProvider]);

  const getUserBets = useCallback(async (userAddress: string) => {
    const provider = getProvider();
    const prediction = new ethers.Contract(CONTRACTS.PredictionMarket, PREDICTION_MARKET_ABI, provider);
    return await prediction.getUserBets(userAddress);
  }, [getProvider]);

  const getPrice = useCallback(async (token: string) => {
    const provider = getProvider();
    const prediction = new ethers.Contract(CONTRACTS.PredictionMarket, PREDICTION_MARKET_ABI, provider);
    return await prediction.getPrice(token);
  }, [getProvider]);

  // Listeners para mudanças de conta/rede
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) resetWallet();
      else {
        setWallet({ address: accounts[0] });
        updateBalances(accounts[0]);
      }
    };
    const handleChainChanged = () => window.location.reload();
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    checkConnection();
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [checkConnection, resetWallet, setWallet, updateBalances]);

  return {
    ...wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    updateBalances,
    checkAllowance,
    approve,
    swap,
    addLiquidity,
    removeLiquidity,
    getReserves,
    getPairId,
    getPairInfo,
    getAllPairs,
    getUserLiquidity,
    placeBet,
    resolveBet,
    cancelBet,
    getBet,
    getUserBets,
    getPrice,
  };
}