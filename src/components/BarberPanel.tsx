import React, { useState } from 'react';
import { 
  Scissors, DollarSign, Calendar, Clock, CheckCircle2, AlertCircle, 
  User, Phone, TrendingUp, Check, Award
} from 'lucide-react';
import { Barber, Sale, Appointment } from '../types';

interface BarberPanelProps {
  barbers: Barber[];
  sales: Sale[];
  appointments: Appointment[];
  onUpdateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
}

export const BarberPanel: React.FC<BarberPanelProps> = ({
  barbers,
  sales,
  appointments,
  onUpdateAppointmentStatus
}) => {
  // Active session barber
  const [activeBarberId, setActiveBarberId] = useState<string>(barbers[0]?.id || '');

  const currentBarber = barbers.find(b => b.id === activeBarberId) || barbers[0];

  // Sales for current barber
  const barberSales = sales.filter(s => s.barberId === currentBarber?.id);

  // Metrics
  const totalServicesDone = barberSales.reduce((count, s) => count + s.selectedServices.length, 0);
  const pendingCommission = barberSales
    .filter(s => !s.isCommissionPaid)
    .reduce((sum, s) => sum + s.barberCommission, 0);
  const paidCommission = barberSales
    .filter(s => s.isCommissionPaid)
    .reduce((sum, s) => sum + s.barberCommission, 0);

  // Personal appointments for current barber
  const barberAppointments = appointments.filter(a => a.barberId === currentBarber?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-in fade-in duration-300">
      {/* Header & Session Selector */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <Scissors className="w-3.5 h-3.5" />
            <span>Sesión de Barbero Activo</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Bienvenido, <span className="text-[#c5a059]">{currentBarber?.name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200">
            Monitorea tus servicios del 50%, comisiones pendientes y tu agenda personal de clientes.
          </p>
        </div>

        {/* Barber Session Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 self-start md:self-auto shadow-inner">
          {barbers.map((b) => {
            const isSelected = b.id === currentBarber?.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBarberId(b.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#c5a059] text-black shadow-md'
                    : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Metrics (Cantidad servicios, Comisión pendiente 50%, Comisión pagada) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Servicios Realizados */}
        <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="text-xs uppercase font-bold tracking-wider">Servicios Realizados</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">
            {totalServicesDone}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Cortes, barbas y tratamientos ejecutados
          </p>
        </div>

        {/* Metric 2: Comisión Pendiente (50%) */}
        <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
              Comisión Pendiente (50%)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-amber-500">
            ${pendingCommission.toLocaleString('es-CO')}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Saldo acumulado por liquidar en caja
          </p>
        </div>

        {/* Metric 3: Comisión Ya Pagada */}
        <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-500">
              Comisión Ya Pagada
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="font-display font-black text-3xl sm:text-4xl text-emerald-500">
            ${paidCommission.toLocaleString('es-CO')}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Transferido o entregado por la administración
          </p>
        </div>
      </div>

      {/* Personal Agenda of Appointments */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/15 pb-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#c5a059]" />
              <span>Agenda Personal de {currentBarber?.name}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Citas y clientes asignados a tu silla
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200/80 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-slate-200 self-start sm:self-auto">
            {barberAppointments.length} citas programadas
          </span>
        </div>

        {barberAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-300 text-xs space-y-2">
            <Calendar className="w-8 h-8 text-slate-400/50 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">No tienes citas registradas por el momento.</p>
            <p>Los agendamientos de clientes aparecerán automáticamente aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barberAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 space-y-3 shadow-sm hover:border-[#c5a059]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#c5a059]" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {apt.timeSlot} hrs
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">· {apt.date}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#c5a059]/15 border border-[#c5a059]/30 px-2 py-0.5 rounded">
                    {apt.bookingCode}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {apt.clientName}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>{apt.clientPhone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                  <div>
                    <span className="text-slate-600 dark:text-slate-300 block text-[11px] font-medium">Servicio:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {apt.serviceName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 dark:text-slate-300 block text-[11px] font-medium">Valor:</span>
                    <span className="font-bold text-[#c5a059]">
                      ${apt.price.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Status selector */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">Estado:</span>
                  <select
                    value={apt.status}
                    onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as any)}
                    className="bg-white dark:bg-[#032d4c] border border-slate-300 dark:border-white/25 text-slate-900 dark:text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
