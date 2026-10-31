import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ArrowLeft, ShieldCheck, ChevronDown, Check } from 'lucide-react';
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
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions: { id: ActiveTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Claro', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'dark', label: 'Oscuro', icon: <Moon className="w-4 h-4 text-[#c5a059]" /> },
    { id: 'system', label: 'Sistema', icon: <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-300" /> },
  ];

  const currentOption = themeOptions.find(opt => opt.id === activeTheme) || themeOptions[1];

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
              <div className="w-12 h-12 rounded-2xl bg-[#011d32] border border-[#c5a059]/30 p-1 shadow-md shadow-black/30 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src="/assets/aistudio/logo_transparent.png"
                  alt="Legado Barber Club Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  LEGADO <span className="text-[#c5a059]">BARBER CLUB</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 font-semibold">
                  Gestión Integral & Club Exclusivo
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

          {/* Compressed Collapsible Theme Menu (Desplegable) */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setThemeDropdownOpen(prev => !prev)}
              aria-expanded={themeDropdownOpen}
              aria-label="Seleccionar modo de visualización"
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-200/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 hover:border-[#c5a059]/70 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <span className="flex items-center justify-center">
                {currentOption.icon}
              </span>
              <span className="hidden sm:inline font-medium text-slate-700 dark:text-slate-200">
                {currentOption.label}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                  themeDropdownOpen ? 'rotate-180 text-[#c5a059]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {themeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-2xl p-1.5 liquid-glass-card shadow-2xl border border-slate-300/90 dark:border-white/20 z-50 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-white/10 mb-0.5">
                  Tema visual
                </div>
                {themeOptions.map(option => {
                  const isSelected = activeTheme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        onChangeTheme(option.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
