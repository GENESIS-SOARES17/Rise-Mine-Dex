import React from 'react';
import { 
  TrendingUp, 
  Droplets, 
  Coins, 
  Target, 
  ArrowUpRight,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ethers } from 'ethers';

export function Dashboard() {
  const { stats, poolBalances } = useStore();

  // Mock stats for demo
  const mockStats = {
    totalLiquidity: ethers.parseEther('125000'),
    totalFees: ethers.parseEther('3450'),
    totalVolume: ethers.parseEther('890000'),
    activeBets: 47,
  };

  const statCards = [
    {
      title: 'Total Liquidity',
      value: `$${Number(ethers.formatEther(mockStats.totalLiquidity)).toLocaleString()}`,
      change: '+12.5%',
      icon: Droplets,
      color: 'from-blue-500 to-cyan-500',
      glow: 'neon-blue',
    },
    {
      title: 'Total Fees Collected',
      value: `$${Number(ethers.formatEther(mockStats.totalFees)).toLocaleString()}`,
      change: '+8.3%',
      icon: Coins,
      color: 'from-rise-primary to-purple-500',
      glow: 'neon-purple',
    },
    {
      title: 'Swap Volume (24h)',
      value: `$${Number(ethers.formatEther(mockStats.totalVolume)).toLocaleString()}`,
      change: '+23.1%',
      icon: Activity,
      color: 'from-rise-accent to-teal-500',
      glow: 'neon-green',
    },
    {
      title: 'Active Predictions',
      value: mockStats.activeBets.toString(),
      change: '+5',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      glow: '',
    },
  ];

  const recentActivity = [
    { type: 'swap', user: '0x1234...5678', action: 'Swapped 100 RISE → 250 USDC', time: '2 min ago' },
    { type: 'liquidity', user: '0xabcd...efgh', action: 'Added liquidity to RISE/USDT', time: '5 min ago' },
    { type: 'prediction', user: '0x9876...5432', action: 'Bet 50 USDC on RISE ↑', time: '8 min ago' },
    { type: 'swap', user: '0xfedc...ba98', action: 'Swapped 500 USDT → 200 RISE', time: '12 min ago' },
    { type: 'prediction', user: '0x1111...2222', action: 'Won prediction: +25 USDC', time: '15 min ago' },
  ];

  const topPairs = [
    { pair: 'RISE/USDC', liquidity: '$45,230', volume: '$123,450', apy: '24.5%' },
    { pair: 'RISE/USDT', liquidity: '$38,120', volume: '$98,320', apy: '21.2%' },
    { pair: 'USDC/USDT', liquidity: '$41,650', volume: '$156,780', apy: '18.8%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Dashboard</h2>
          <p className="text-gray-400 mt-1">Overview of Rise Mini DEX & Prediction Protocol</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rise-accent/20 border border-rise-accent/30">
          <Zap className="w-4 h-4 text-rise-accent" />
          <span className="text-rise-accent font-medium">Live on Rise Testnet</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 ${stat.glow}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-rise-accent text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pairs */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Trading Pairs</h3>
            <button className="text-rise-primary text-sm hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-rise-border">
                  <th className="text-left pb-4">Pair</th>
                  <th className="text-right pb-4">Liquidity</th>
                  <th className="text-right pb-4">Volume (24h)</th>
                  <th className="text-right pb-4">APY</th>
                </tr>
              </thead>
              <tbody>
                {topPairs.map((pair, index) => (
                  <tr key={index} className="border-b border-rise-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center text-xs">🚀</div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs">💵</div>
                        </div>
                        <span className="font-medium text-white">{pair.pair}</span>
                      </div>
                    </td>
                    <td className="text-right text-white font-mono">{pair.liquidity}</td>
                    <td className="text-right text-white font-mono">{pair.volume}</td>
                    <td className="text-right">
                      <span className="text-rise-accent font-medium">{pair.apy}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <Activity className="w-5 h-5 text-rise-primary" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'swap' ? 'bg-blue-500/20 text-blue-400' :
                  activity.type === 'liquidity' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {activity.type === 'swap' && '↔️'}
                  {activity.type === 'liquidity' && '💧'}
                  {activity.type === 'prediction' && '🎯'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 font-mono">{activity.user}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Pool Status */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Fee Pool Status</h3>
            <p className="text-gray-400 text-sm mt-1">Public pool collecting 0.3% from all swaps</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rise-primary" />
            <span className="text-gray-400 text-sm">Rewards prediction winners</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { token: 'RISE', balance: '12,450', icon: '🚀' },
            { token: 'USDC', balance: '8,320', icon: '💵' },
            { token: 'USDT', balance: '6,780', icon: '💲' },
          ].map((pool, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pool.icon}</span>
                <span className="font-medium text-white">{pool.token}</span>
              </div>
              <span className="text-xl font-bold text-white font-mono">{pool.balance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
