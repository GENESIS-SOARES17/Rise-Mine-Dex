import React from 'react';

export function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-bg opacity-50" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rise-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rise-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-rise-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      
      {/* Hexagon pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon 
              points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-rise-primary"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>

      {/* MARCA D'ÁGUA - imagem risemarca.jpg repetida com baixa opacidade */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("/risemarca.jpg")',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px', // Ajuste o tamanho conforme preferir
          opacity: 0.1, // Ajuste a opacidade (0 = invisível, 1 = totalmente visível)
        }}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-rise-darker/80" />
    </div>
  );
}