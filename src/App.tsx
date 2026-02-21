import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Background } from './components/Background';
import { TickerBar } from './components/TickerBar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Swap } from './components/Swap';
import { Liquidity } from './components/Liquidity';
import { Prediction } from './components/Prediction';
import { WalletPage } from './components/WalletPage';
import { News } from './components/News';

function App() {
  const { activeTab, theme } = useStore();

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-neon');
    document.documentElement.classList.add(`theme-${theme}`);
    
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'swap':
        return <Swap />;
      case 'liquidity':
        return <Liquidity />;
      case 'prediction':
        return <Prediction />;
      case 'wallet':
        return <WalletPage />;
      case 'news':
        return <News />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'light' 
        ? 'bg-gray-50 text-gray-900' 
        : theme === 'neon'
        ? 'bg-black text-green-400'
        : 'bg-rise-darker text-white'
    }`}>
      <Background />
      
      <div className="relative z-10">
        <TickerBar />
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          {renderContent()}
        </main>

        {/* Footer com informações do criador */}
        <footer className="border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Logo e nome do DEX */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rise-primary to-rise-secondary flex items-center justify-center">
                  <span className="text-sm">🚀</span>
                </div>
                <span className="font-semibold gradient-text">Rise Mini DEX</span>
              </div>

              {/* Seção do criador */}
              <div className="text-sm text-gray-400 text-center md:text-left">
                <p>
                  Criado por <span className="text-white font-medium">Edgard</span>
                </p>
                <p>
                  <a 
                    href="https://twitter.com/EdgardS54056" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-rise-primary transition-colors"
                  >
                    Twitter
                  </a>
                  {' · '}
                  <span>Discord: edsant17</span>
                </p>
                <p className="font-mono text-xs text-gray-500 mt-1">
                  0x4fd6...e326e
                </p>
              </div>

              {/* Links de documentação e redes */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Docs</a>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
                <a href="#" className="hover:text-white transition-colors">Discord</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-500 text-center mt-4">
              © 2025 Rise Protocol. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;