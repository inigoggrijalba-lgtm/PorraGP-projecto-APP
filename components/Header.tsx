import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg shadow-red-500/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">
          PorraGP
        </h1>
      </div>
    </header>
  );
};