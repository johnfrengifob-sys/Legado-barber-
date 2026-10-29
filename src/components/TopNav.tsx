import React from 'react';
import { Sun, Moon, Laptop, ArrowLeft, Cloud, ShieldCheck } from 'lucide-react';
import { ActiveTheme, ActivePanel } from '../types';

interface TopNavProps {
  currentPanel: ActivePanel;
  onNavigateHome: () => void;
  activeTheme: ActiveTheme;
  onChangeTheme: (theme: ActiveTheme) => void;
  isCloudSynced?: boolean;
  currentUserEmail?: string | null;
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPanel,
  onNavigateHome,
  activeTheme,
  onChangeTheme,
  isCloudSynced = true,
  currentUserEmail,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 liquid-glass border-b border-slate-200/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        {/* Brand or Back Button */}
        <div className="flex items-center gap-3">
          {currentPanel !== 'home' ? (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-[#c5a059] hover:text-black border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm group"
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
                <div className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>Gestión Integral & Club Exclusivo</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold lowercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Cloud className="w-3 h-3 text-emerald-500" />
                    <span>firebase cloud</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Module Title on Desktop */}
        {currentPanel !== 'home' && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] bg-[#c5a059]/15 border border-[#c5a059]/40 px-3.5 py-1.5 rounded-full shadow-sm">
            <span>
              {currentPanel === 'clientes' && 'Portal Clientes (Agendamiento & QR)'}
              {currentPanel === 'barberos' && 'Panel Barberos (Sesión & Comisiones)'}
              {currentPanel === 'admin' && 'Panel Administrador (POS & Finanzas)'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          {/* Cloud Status indicator icon */}
          <div 
            title={isCloudSynced ? "Conectado a Firebase Firestore (Sincronización en la nube activa)" : "Modo Offline Activo"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <Cloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden xl:inline text-[10px]">{isCloudSynced ? 'Firestore Online' : 'Offline'}</span>
          </div>

          {/* User Auth Info (if signed in) */}
          {currentUserEmail && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/40 text-xs font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
              <span className="max-w-[120px] truncate">{currentUserEmail}</span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-[10px] text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              )}
            </div>
          )}

          {/* Theme Selector (Claro, Oscuro, Sistema) */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/80 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 shadow-inner">
            <button
              onClick={() => onChangeTheme('light')}
              aria-label="Modo Claro"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTheme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
                  ? 'bg-[#c5a059] text-black shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Modo Oscuro"
            >
              <Moon className={`w-4 h-4 ${activeTheme === 'dark' ? 'text-black fill-black' : 'text-indigo-400'}`} />
              <span className="hidden sm:inline">Oscuro</span>
            </button>

            <button
              onClick={() => onChangeTheme('system')}
              aria-label="Modo Sistema"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTheme === 'system'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Modo Sistema"
            >
              <Laptop className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
