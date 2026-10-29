import React, { useState } from 'react';
import { 
  QrCode, Calendar, Star, Sparkles, Check, CheckCircle2, Gift, 
  Clock, Scissors, User, Phone, Mail, MessageSquare, AlertCircle, 
  Share2, Award, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Service, Barber, ClientRecord, Appointment } from '../types';
import { TIME_SLOTS } from '../data/mockData';

interface ClientPortalProps {
  services: Service[];
  barbers: Barber[];
  clients: ClientRecord[];
  onRegisterVisit: (clientData: {
    name: string;
    email: string;
    phone: string;
    rating: number;
    comments: string;
  }) => { updatedClient: ClientRecord; rewardUnlocked: string | null };
  onBookAppointment: (appointment: Appointment) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  services,
  barbers,
  clients,
  onRegisterVisit,
  onBookAppointment
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'agendamiento'>('qr');

  // QR Check-in Form State
  const [qrName, setQrName] = useState('');
  const [qrEmail, setQrEmail] = useState('');
  const [qrPhone, setQrPhone] = useState('');
  const [qrRating, setQrRating] = useState<number>(10);
  const [qrComments, setQrComments] = useState('');
  const [qrSubmitted, setQrSubmitted] = useState(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<{
    client: ClientRecord;
    reward: string | null;
  } | null>(null);

  // Booking Form State
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookServiceId, setBookServiceId] = useState<string>(services[0]?.id || '');
  const [bookBarberId, setBookBarberId] = useState<string>('any');
  const [bookDate, setBookDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState<string>('10:30');
  const [bookConfirmed, setBookConfirmed] = useState<Appointment | null>(null);

  // Google Login Simulation
  const handleGoogleLoginSim = () => {
    setQrName('Mateo Restrepo');
    setQrEmail('mateo.restrepo@gmail.com');
    setQrPhone('3129876543');
  };

  // Submit QR Check-in & AI Loyalty
  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrName.trim() || !qrPhone.trim()) return;

    const result = onRegisterVisit({
      name: qrName.trim(),
      email: qrEmail.trim() || 'cliente@gmail.com',
      phone: qrPhone.trim(),
      rating: qrRating,
      comments: qrComments.trim()
    });

    setLastCheckinResult({
      client: result.updatedClient,
      reward: result.rewardUnlocked
    });
    setQrSubmitted(true);

    try {
      confetti({
        particleCount: result.rewardUnlocked ? 120 : 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#38ef7d', '#11998e', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  };

  // Reset QR for new submission
  const handleNewCheckin = () => {
    setQrSubmitted(false);
    setLastCheckinResult(null);
    setQrComments('');
  };

  // Submit Booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName.trim() || !bookPhone.trim()) return;

    const serv = services.find(s => s.id === bookServiceId) || services[0];
    const barb = bookBarberId === 'any' 
      ? barbers[Math.floor(Math.random() * barbers.length)] 
      : barbers.find(b => b.id === bookBarberId) || barbers[0];

    const randomCode = `LEG-${Math.floor(100 + Math.random() * 900)}`;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      bookingCode: randomCode,
      clientName: bookName.trim(),
      clientPhone: bookPhone.trim(),
      serviceId: serv.id,
      serviceName: serv.name,
      barberId: barb.id,
      barberName: barb.name,
      date: bookDate,
      timeSlot: bookTime,
      price: serv.price,
      status: 'confirmada',
      createdAt: new Date().toISOString()
    };

    onBookAppointment(newApt);
    setBookConfirmed(newApt);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#edd398', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Sub-Tabs Switcher */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl liquid-glass max-w-md mx-auto border border-slate-200/80 dark:border-white/10 shadow-lg">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'qr'
              ? 'bg-[#c5a059] text-black shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Validación QR & Fidelización</span>
        </button>

        <button
          onClick={() => setActiveTab('agendamiento')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'agendamiento'
              ? 'bg-[#c5a059] text-black shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agendar Cita en Línea</span>
        </button>
      </div>

      {/* TAB 1: VALIDACIÓN QR Y FIDELIZACIÓN IA */}
      {activeTab === 'qr' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Validación de Asistencia & Calificación 10★
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200">
              Registra tu visita escaneando nuestro código QR en caja. Nuestra IA de fidelización acumula tus visitas y te otorga recompensas exclusivas automáticamente.
            </p>
          </div>

          {!qrSubmitted ? (
            <div className="max-w-xl mx-auto liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-6">
              {/* Google Login Simulation Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    ¿Quieres agilizar el registro?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLoginSim}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#032d4c] text-slate-900 dark:text-white hover:bg-[#c5a059] hover:text-black border border-slate-300 dark:border-white/20 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Usar Google
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCheckinSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Nombre Completo *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mateo Restrepo"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Teléfono / Celular *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="312 987 6543"
                      value={qrPhone}
                      onChange={(e) => setQrPhone(e.target.value)}
                      className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Correo Electrónico</span>
                    </label>
                    <input
                      type="email"
                      placeholder="mateo@ejemplo.com"
                      value={qrEmail}
                      onChange={(e) => setQrEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                {/* 10-Star Rating Slider */}
                <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#c5a059] fill-[#c5a059]" />
                      <span>Calificación del Servicio (1 a 10)</span>
                    </span>
                    <span className="font-display font-extrabold text-base text-[#c5a059] bg-[#c5a059]/15 px-2.5 py-0.5 rounded-full border border-[#c5a059]/30">
                      {qrRating} / 10 ★
                    </span>
                  </div>

                  {/* Interactive Slider */}
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={qrRating}
                    onChange={(e) => setQrRating(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                  />

                  {/* 10 Visual Stars Bar */}
                  <div className="flex items-center justify-between pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setQrRating(starVal)}
                        className="cursor-pointer group p-0.5"
                        title={`${starVal} estrellas`}
                      >
                        <Star
                          className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover:scale-125 ${
                            starVal <= qrRating
                              ? 'text-[#c5a059] fill-[#c5a059]'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Comentarios o Sugerencias (opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Cuéntanos cómo fue tu experiencia con el barbero..."
                    value={qrComments}
                    onChange={(e) => setQrComments(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold text-sm tracking-wide shadow-xl shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validar Asistencia & Acumular Visita</span>
                </button>
              </form>
            </div>
          ) : (
            /* CHECK-IN SUCCESS & AI FIDELIZATION REWARD SCREEN */
            <div className="max-w-xl mx-auto liquid-glass-card rounded-3xl p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                  ¡Asistencia Validada con Éxito!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Gracias por tu visita, <span className="font-bold text-slate-900 dark:text-white">{lastCheckinResult?.client.clientName}</span>.
                </p>
              </div>

              {/* Visits Counter & Progress Bar */}
              <div className="p-5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Visitas Acumuladas
                  </span>
                  <span className="font-display font-extrabold text-xl text-[#c5a059]">
                    {lastCheckinResult?.client.totalVisits} visitas
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-200 dark:bg-[#031d33] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#c5a059] to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((lastCheckinResult?.client.totalVisits || 1) % 10) * 10)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  <span>Próximo hito: {5 - ((lastCheckinResult?.client.totalVisits || 0) % 5)} visitas restantes</span>
                  <span className="text-[#c5a059] font-bold">Meta: Limpieza / Corte Gratis</span>
                </div>
              </div>

              {/* SPECIAL AI REWARD ALERT (If Unlocked!) */}
              {lastCheckinResult?.reward ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 space-y-2 text-center animate-bounce">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                    <Gift className="w-7 h-7" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-emerald-900 dark:text-emerald-200">
                    ¡RECOMPENSA INTELIGENTE DESBLOQUEADA!
                  </h4>
                  <p className="text-xs font-bold">
                    {lastCheckinResult.reward}
                  </p>
                  <p className="text-[11px] opacity-90">
                    Presenta este ticket en caja para canjear tu beneficio en tu próxima visita.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-[#02253f] border border-slate-200 dark:border-white/15 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>Continúa acumulando visitas para desbloquear tu Limpieza Facial o Corte Gratis.</span>
                </div>
              )}

              <button
                onClick={handleNewCheckin}
                className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-[#c5a059] hover:text-black text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Registrar Otra Asistencia
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGENDAMIENTO EN LÍNEA */}
      {activeTab === 'agendamiento' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Agendamiento de Citas en Línea
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200">
              Elige tu servicio de la carta oficial, selecciona tu barbero preferido y reserva tu hora sin llamadas.
            </p>
          </div>

          {!bookConfirmed ? (
            <div className="max-w-2xl mx-auto liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl">
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {/* Client info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez"
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="310 123 4567"
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Servicio de la Carta Oficial *
                  </label>
                  <select
                    value={bookServiceId}
                    onChange={(e) => setBookServiceId(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                  >
                    <optgroup label="ESENCIALES">
                      {services.filter(s => s.category === 'esenciales').map(s => (
                        <option key={s.id} value={s.id}>{s.name} - ${s.price.toLocaleString('es-CO')} ({s.durationMinutes} min)</option>
                      ))}
                    </optgroup>
                    <optgroup label="PREMIUM">
                      {services.filter(s => s.category === 'premium').map(s => (
                        <option key={s.id} value={s.id}>{s.name} - ${s.price.toLocaleString('es-CO')} ({s.durationMinutes} min)</option>
                      ))}
                    </optgroup>
                    <optgroup label="COLORIMETRÍA">
                      {services.filter(s => s.category === 'colorimetria').map(s => (
                        <option key={s.id} value={s.id}>{s.name} - ${s.price.toLocaleString('es-CO')} ({s.durationMinutes} min)</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Barber Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Barbero de Preferencia
                  </label>
                  <select
                    value={bookBarberId}
                    onChange={(e) => setBookBarberId(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="any">Cualquier Barbero Disponible</option>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Fecha
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Hora
                    </label>
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                    >
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t}>{t} hrs</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold text-sm tracking-wide shadow-xl shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirmar y Apartar Cita</span>
                </button>
              </form>
            </div>
          ) : (
            /* BOOKING CONFIRMATION SCREEN */
            <div className="max-w-md mx-auto liquid-glass-card rounded-3xl p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                  ¡Cita Apartada con Éxito!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Te esperamos en Legado Barber Club.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="p-5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                  <span className="text-slate-600 dark:text-slate-300">Código de Cita:</span>
                  <span className="font-mono font-bold text-[#c5a059] text-sm">{bookConfirmed.bookingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Cliente:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{bookConfirmed.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Servicio:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{bookConfirmed.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Barbero:</span>
                  <span className="font-semibold text-[#c5a059]">{bookConfirmed.barberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Fecha & Hora:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{bookConfirmed.date} · {bookConfirmed.timeSlot} hrs</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2 font-bold">
                  <span className="text-slate-700 dark:text-slate-200">Valor a pagar en local:</span>
                  <span className="text-[#c5a059] font-display text-sm">${bookConfirmed.price.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <button
                onClick={() => setBookConfirmed(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-[#c5a059] hover:text-black text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Apartar Otra Cita
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
