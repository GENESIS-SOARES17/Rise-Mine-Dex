// Rise Testnet Configuration
export const RISE_TESTNET = {
  chainId: 11155931,
  chainIdHex: '0xAA39DB',
  name: 'Rise Testnet',
  rpcUrl: 'https://testnet.riselabs.xyz',
  explorer: 'https://explorer.testnet.riselabs.xyz',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

// 🔥 TOKENS REAIS NA RISE TESTNET (endereços corrigidos conforme imagem)
export const TOKENS = {
  RISE: {
    address: '0xd6e1afe5cA8D00A2EFC01B89997abE2De47fdfAf',
    symbol: 'RISE',
    name: 'Rise Token',
    decimals: 18,
    logo: '🚀',
  },
  USDC: {
    address: '0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8', // corrigido
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '💵',
  },
  USDT: {
    address: '0x40918Ba7f132E0aCba2CE4de4c4baF9BD2D7D849',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logo: '💲',
  },
};

// 🔥 CONTRATOS REAIS IMPLANTADOS VIA HARDHAT
export const CONTRACTS = {
  FeePool: '0xaAb628B06E2D9Ed64bed2A4D471BcCF66B32A114',
  MiniAMM: '0xCc2CD136685219b19D927e3459A455e644c5495f',
  PredictionMarket: '0x48eCef05a0439468576A2db561A07173677ab55c',
};

// ERC20 ABI (minimal)
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// MiniAMM ABI
export const MINI_AMM_ABI = [
  'function getPairId(address tokenA, address tokenB) view returns (bytes32)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) returns (uint256)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidityAmount) returns (uint256, uint256)',
  'function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)',
  'function getReserves(address tokenA, address tokenB) view returns (uint256, uint256)',
  'function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256, uint256)',
  'function getAllPairs() view returns (bytes32[])',
  'function getPairInfo(bytes32 pairId) view returns (address, address, uint256, uint256, uint256)',
  'function getUserLiquidity(bytes32 pairId, address user) view returns (uint256, uint256, uint256)',
  'function totalSwapVolume() view returns (uint256)',
  'function totalFeesCollected() view returns (uint256)',
];

// FeePool ABI
export const FEE_POOL_ABI = [
  'function getPoolBalance(address token) view returns (uint256)',
  'function getAllPoolBalances() view returns (address[], uint256[])',
  'function deposit(address token, uint256 amount)',
  'function distributeReward(address winner, address token) returns (uint256)',
  'function addAllowedToken(address token)',
  'function setAMMContract(address)',
  'function setPredictionContract(address)',
];

// PredictionMarket ABI
export const PREDICTION_MARKET_ABI = [
  'function placeBet(address token, uint256 amount, bool predictUp, uint256 duration) returns (uint256)',
  'function resolveBet(uint256 betId)',
  'function cancelBet(uint256 betId)',
  'function getBet(uint256 betId) view returns (address, address, uint256, uint256, uint256, uint256, uint256, bool, uint8)',
  'function getUserBets(address user) view returns (uint256[])',
  'function getActiveBetsCount() view returns (uint256)',
  'function getPrice(address token) view returns (uint256, uint256)',
  'function totalBets() view returns (uint256)',
  'function totalVolume() view returns (uint256)',
  'function activeBets() view returns (uint256)',
  'function addAllowedToken(address token)',
  'function updatePrice(address token, uint256 price)',
];