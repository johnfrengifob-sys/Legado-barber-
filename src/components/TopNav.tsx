import React from 'react';
import { Scissors, Sun, Moon, Laptop, ArrowLeft } from 'lucide-react';
import { ActiveTheme, ActivePanel } from '../types';

interface TopNavProps {
  currentPanel: ActivePanel;
  onNavigateHome: () => void;
  activeTheme: ActiveTheme;
  onChangeTheme: (theme: ActiveTheme) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPanel,
  onNavigateHome,
  activeTheme,
  onChangeTheme
}) => {
  return (
    <header className="sticky top-0 z-40 liquid-glass border-b border-slate-200/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand or Back Button */}
        <div className="flex items-center gap-3">
          {currentPanel !== 'home' ? (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-[#c5a059] hover:text-black border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver al Inicio</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#8c6c2e] p-0.5 shadow-md shadow-[#c5a059]/20 overflow-hidden shrink-0">
                <img
                  src="/assets/aistudio/Logo_00f5e574.jpg"
                  alt="Legado Barber Club Logo"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>
              <div>
                <div className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  LEGADO <span className="text-[#c5a059]">BARBER CLUB</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                  Gestión Integral & Club Exclusivo
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Module Title on Desktop */}
        {currentPanel !== 'home' && (
          <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/30 px-3.5 py-1.5 rounded-full">
            <span>
              {currentPanel === 'clientes' && 'Portal Clientes (Agendamiento & QR)'}
              {currentPanel === 'barberos' && 'Panel Barberos (Sesión & Comisiones)'}
              {currentPanel === 'admin' && 'Panel Administrador (POS & Finanzas)'}
            </span>
          </div>
        )}

        {/* Theme Selector (Claro, Oscuro, Sistema) */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 shadow-inner">
          <button
            onClick={() => onChangeTheme('light')}
            aria-label="Modo Claro"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTheme === 'light'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            title="Modo Claro"
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Claro</span>
          </button>

          <button
            onClick={() => onChangeTheme('dark')}
            aria-label="Modo Oscuro"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTheme === 'dark'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            title="Modo Oscuro"
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Oscuro</span>
          </button>

          <button
            onClick={() => onChangeTheme('system')}
            aria-label="Modo Sistema"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTheme === 'system'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            title="Modo Sistema"
          >
            <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            <span className="hidden sm:inline">Sistema</span>
          </button>
        </div>
      </div>
    </header>
  );
};
