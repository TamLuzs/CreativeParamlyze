import React, { useState, useMemo } from 'react';
import { AuditPage } from './pages/AuditPage';
import { AboutPage } from './pages/AboutPage';

// Componente de Navegação Otimizado
const NavItem = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`text-sm font-bold transition-all duration-200 px-4 py-2 rounded-full ${
      active 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
    }`}
  >
    {label}
  </button>
);

function App() {
  const [currentPage, setCurrentPage] = useState('audit');

  // Memoização para evitar re-renderizações desnecessárias ao trocar de aba
  const renderContent = useMemo(() => {
    switch (currentPage) {
      case 'audit': return <AuditPage />;
      case 'about': return <AboutPage />;
      default: return <AuditPage />;
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* Navbar Escalonável */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setCurrentPage('audit')}
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              A
            </div>
            <span className="font-bold text-slate-800 text-xl tracking-tight">
              Auditor<span className="text-blue-600">Pro</span>
            </span>
          </div>
          
          {/* Menu de Navegação */}
          <div className="flex gap-2 items-center bg-slate-50 p-1 rounded-full border border-slate-100">
            <NavItem 
              label="Auditoria" 
              active={currentPage === 'audit'} 
              onClick={() => setCurrentPage('audit')} 
            />
            <NavItem 
              label="Sobre o Projeto" 
              active={currentPage === 'about'} 
              onClick={() => setCurrentPage('about')} 
            />
          </div>
        </div>
      </nav>

      {/* Container Principal com Animação Simples */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="transition-all duration-300 ease-in-out">
          {renderContent}
        </div>
      </main>
    </div>
  );
}

export default App;