import React from 'react';
import { 
  Users, Scissors, ShieldCheck, Sparkles, QrCode, Calendar, 
  DollarSign, TrendingUp, ChevronRight, Lock, Award, Heart
} from 'lucide-react';
import { SOCIAL_LINKS } from '../data/mockData';

interface HomePortalProps {
  onSelectClients: () => void;
  onSelectBarbers: () => void;
  onSelectAdmin: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({
  onSelectClients,
  onSelectBarbers,
  onSelectAdmin
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Welcome without boxed containers */}
      <div className="relative text-center max-w-3xl mx-auto pt-2 pb-2 space-y-6">
        <div className="flex justify-center bg-transparent">
          <img
            src="/assets/aistudio/logo_transparent.png"
            alt="Legado Barber Club"
            className="w-52 sm:w-64 h-auto object-contain mx-auto transition-transform hover:scale-[1.02] bg-transparent"
          />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/35 text-xs font-bold text-[#c5a059] uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Sistema Integral de Gestión & Fidelización</span>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Bienvenido al portal central de operaciones de Legado Barber Club. Selecciona el módulo de acceso según tu rol para gestionar agendamientos, liquidaciones de barberos y ventas POS.
          </p>
        </div>
      </div>

      {/* 3 Main Access Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-wide">
            Módulos del Sistema
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">
            Selecciona tu acceso
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* 1. Portal Clientes (Público / Sin PIN) */}
          <div
            onClick={onSelectClients}
            className="group liquid-glass-card rounded-3xl p-7 border border-slate-200/80 dark:border-white/15 hover:border-[#c5a059]/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Acceso Público
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white group-hover:text-[#c5a059] transition-colors">
                  Portal Clientes
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 mt-2 leading-relaxed">
                  Agendamiento en línea de citas, check-in QR con calificación de 10 estrellas y recompensas automáticas con IA.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Reserva tu turno sin filas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <QrCode className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Asistencia QR & Calificación 1-10 ★</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Corte y Limpieza Facial Gratis acumulando</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#c5a059]">
              <span>Ingresar al Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Panel Barberos (Acceso Protegido) */}
          <div
            onClick={onSelectBarbers}
            className="group liquid-glass-card rounded-3xl p-7 border border-slate-200/80 dark:border-white/15 hover:border-[#c5a059]/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <Scissors className="w-7 h-7 -rotate-45" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Acceso Protegido</span>
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white group-hover:text-[#c5a059] transition-colors">
                  Panel Barberos
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 mt-2 leading-relaxed">
                  Espacio privado para John, Orian y David. Consulta tu agenda del día, servicios realizados y comisiones del 50%.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <Scissors className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Selector de barbero activo</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Comisión 50% pendiente vs pagada</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Agenda personalizada de clientes</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#c5a059]">
              <span>Desbloquear con PIN</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Panel Administrador (Acceso Restringido) */}
          <div
            onClick={onSelectAdmin}
            className="group liquid-glass-card rounded-3xl p-7 border border-slate-200/80 dark:border-white/15 hover:border-[#c5a059]/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c5a059]/20 to-[#c5a059]/5 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c5a059] bg-[#c5a059]/15 border border-[#c5a059]/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Acceso Restringido</span>
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white group-hover:text-[#c5a059] transition-colors">
                  Panel Administrador
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 mt-2 leading-relaxed">
                  Terminal POS de ventas, gastos, liquidación de comisiones, base de datos de clientes, inventario y exportación a Excel.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <DollarSign className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>POS con división 50/50 y descuentos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Liquidación de barberos & Caja Neta</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <Award className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Clientes QR, Broadcast e Inventario</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#c5a059]">
              <span>Desbloquear con PIN</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media & Community Bar */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-display font-bold text-base text-slate-900 dark:text-white">
            Síguenos en Nuestras Redes Oficiales
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Conoce nuestras transformaciones, promociones semanales y eventos exclusivos.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Facebook */}
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </a>

          {/* Instagram */}
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E4405F]/10 hover:bg-[#E4405F] text-[#E4405F] hover:text-white border border-[#E4405F]/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram</span>
          </a>

          {/* TikTok */}
          <a
            href={SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/10 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
            <span>TikTok</span>
          </a>
        </div>
      </div>
    </div>
  );
};
