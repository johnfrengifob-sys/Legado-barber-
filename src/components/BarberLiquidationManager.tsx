import React, { useState } from 'react';
import { 
  TrendingUp, CheckCircle2, FileText, Send, Download, 
  DollarSign, Calendar, Scissors, AlertCircle, Sparkles, 
  Check, ArrowRight, X, Shield, Phone, CreditCard, Banknote,
  Clock, History
} from 'lucide-react';
import { Barber, Sale, BarberLiquidation } from '../types';
import { SignaturePad } from './SignaturePad';
import { generateLiquidationPDF } from '../utils/pdfGenerator';

interface BarberLiquidationManagerProps {
  barbers: Barber[];
  sales: Sale[];
  liquidations: BarberLiquidation[];
  totalSalesRevenue: number;
  totalExpensesAmount: number;
  netCashFlow: number;
  totalShopGains: number;
  totalBarberPaidCommissions: number;
  onSaveLiquidation: (liq: BarberLiquidation) => void;
  onSettleBarberCommissions: (barberId: string) => void;
}

export const BarberLiquidationManager: React.FC<BarberLiquidationManagerProps> = ({
  barbers,
  sales,
  liquidations,
  netCashFlow,
  totalShopGains,
  totalBarberPaidCommissions,
  totalExpensesAmount,
  onSaveLiquidation,
}) => {
  const [subTab, setSubTab] = useState<'liquidar' | 'historial'>('liquidar');
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  // Form State for Active Liquidation
  const [barberPhone, setBarberPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [adminSignature, setAdminSignature] = useState<string | null>(null);
  const [barberSignature, setBarberSignature] = useState<string | null>(null);
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showWhatsAppHint, setShowWhatsAppHint] = useState(false);

  // When a barber is selected to liquidate
  const handleOpenLiquidation = (barber: Barber) => {
    setSelectedBarberId(barber.id);
    const pendingSales = sales.filter(s => s.barberId === barber.id && !s.isCommissionPaid);
    setSelectedSaleIds(pendingSales.map(s => s.id));
    setBarberPhone(barber.phone || '3001234567');
    setDeductionAmount(0);
    setDeductionReason('');
    setNotes('');
    setAdminSignature(null);
    setBarberSignature(null);
    setSaveSuccessMsg('');
    setShowWhatsAppHint(false);
  };

  const selectedBarber = barbers.find(b => b.id === selectedBarberId);
  const barberPendingSales = selectedBarberId 
    ? sales.filter(s => s.barberId === selectedBarberId && !s.isCommissionPaid)
    : [];
  
  const activeSales = barberPendingSales.filter(s => selectedSaleIds.includes(s.id));
  const totalGrossCommission = activeSales.reduce((sum, s) => sum + s.barberCommission, 0);
  const netPaidAmount = Math.max(0, totalGrossCommission - deductionAmount);

  const toggleSaleSelection = (saleId: string) => {
    setSelectedSaleIds(prev => 
      prev.includes(saleId) ? prev.filter(id => id !== saleId) : [...prev, saleId]
    );
  };

  const handleSelectAllSales = () => {
    if (selectedSaleIds.length === barberPendingSales.length) {
      setSelectedSaleIds([]);
    } else {
      setSelectedSaleIds(barberPendingSales.map(s => s.id));
    }
  };

  // Build the liquidation object
  const buildCurrentLiquidationObject = (): BarberLiquidation => {
    const voucherNumber = `LIQ-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;

    return {
      id: `liq-${Date.now()}`,
      voucherNumber,
      barberId: selectedBarber?.id || '',
      barberName: selectedBarber?.name || 'Barbero',
      barberPhone: barberPhone.trim(),
      date: formattedDate,
      totalServicesCount: activeSales.length,
      totalEarnedCommission: totalGrossCommission,
      deductionAmount: deductionAmount || 0,
      deductionReason: deductionReason.trim(),
      netPaidAmount,
      paymentMethod,
      notes: notes.trim(),
      adminSignature: adminSignature || undefined,
      barberSignature: barberSignature || undefined,
      status: 'completada',
      saleIds: selectedSaleIds,
    };
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (!selectedBarber) return;
    const liq = buildCurrentLiquidationObject();
    generateLiquidationPDF(liq, activeSales);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = (liqToShare?: BarberLiquidation) => {
    const liq = liqToShare || buildCurrentLiquidationObject();
    const phoneClean = (liq.barberPhone || barberPhone || '').replace(/\D/g, '');

    const text = 
`💈 *LEGADO BARBER CLUB* 💈
*COMPROBANTE OFICIAL DE LIQUIDACIÓN Y PAGO*
━━━━━━━━━━━━━━━━━━━━━━━━
📄 *N° Comprobante:* ${liq.voucherNumber}
📅 *Fecha:* ${liq.date}
👤 *Barbero:* ${liq.barberName}
💳 *Método de Pago:* ${liq.paymentMethod.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━
✂️ *Servicios Liquidados:* ${liq.totalServicesCount} servicios
💰 *Comisión Bruta (50%):* $${liq.totalEarnedCommission.toLocaleString('es-CO')} COP
${liq.deductionAmount > 0 ? `🔻 *Deducciones / Anticipos (${liq.deductionReason || 'Descuento'}):* -$${liq.deductionAmount.toLocaleString('es-CO')} COP\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━
💵 *TOTAL NETO PAGADO:*
👉 *$${liq.netPaidAmount.toLocaleString('es-CO')} COP* 👈
━━━━━━━━━━━━━━━━━━━━━━━━
✍️ *Firmas Digitales:*
• Administración Legado Barber Club: ✅ Verificada
• Recibido a Conformidad por Barbero: ✅ Firmado digitalmente

*Declaración:* El presente comprobante certifica el pago a entera satisfacción de las comisiones devengadas según el contrato civil de arrendamiento de espacio de trabajo.

¡Gracias por tu profesionalismo y talento en *Legado Barber Club*! 💈✂️`;

    const encoded = encodeURIComponent(text);
    const targetUrl = phoneClean.length >= 7 
      ? `https://wa.me/57${phoneClean.startsWith('57') ? phoneClean.slice(2) : phoneClean}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(targetUrl, '_blank');
    setShowWhatsAppHint(true);
  };

  // Save Liquidation to Firestore & state
  const handleConfirmAndSave = () => {
    if (!selectedBarber) return;
    if (activeSales.length === 0) {
      alert('Por favor selecciona al menos un servicio o registro para liquidar.');
      return;
    }

    const liq = buildCurrentLiquidationObject();
    onSaveLiquidation(liq);
    setSaveSuccessMsg(`¡Liquidación ${liq.voucherNumber} guardada exitosamente y registrada en Firestore!`);

    // Also download PDF automatically for safety
    try {
      generateLiquidationPDF(liq, activeSales);
    } catch (e) {
      console.warn('PDF automatic download preview:', e);
    }

    setTimeout(() => {
      setSelectedBarberId(null);
      setSubTab('historial');
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Global Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="liquid-glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-white/15 space-y-1">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Caja Neta Local</span>
          <div className="font-display font-black text-2xl text-emerald-500">
            ${netCashFlow.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-300">Ventas totales - Egresos</p>
        </div>

        <div className="liquid-glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-white/15 space-y-1">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Ganancia Barbería</span>
          <div className="font-display font-black text-2xl text-blue-500">
            ${totalShopGains.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-300">50% de servicios + productos</p>
        </div>

        <div className="liquid-glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-white/15 space-y-1">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Pagos a Barberos</span>
          <div className="font-display font-black text-2xl text-[#c5a059]">
            ${totalBarberPaidCommissions.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-300">Total liquidado y pagado</p>
        </div>

        <div className="liquid-glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-white/15 space-y-1">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Egresos Totales</span>
          <div className="font-display font-black text-2xl text-rose-500">
            ${totalExpensesAmount.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-300">Gastos operativos acumulados</p>
        </div>
      </div>

      {/* Sub-Navigation between Liquidation and History */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('liquidar')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'liquidar'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'bg-slate-100 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Liquidar Barberos con Firma</span>
          </button>

          <button
            onClick={() => setSubTab('historial')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'historial'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'bg-slate-100 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial Liquidaciones Firmadas ({liquidations.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIQUIDAR BARBERO */}
      {subTab === 'liquidar' && (
        <div className="space-y-6">
          {!selectedBarberId ? (
            <div>
              <div className="mb-4">
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Selecciona un Barbero para Liquidar Registros
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Calcula comisiones al 50%, firma digitalmente en pantalla y genera el comprobante PDF para enviar por WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {barbers.map((barber) => {
                  const bSales = sales.filter(s => s.barberId === barber.id);
                  const pendingSales = bSales.filter(s => !s.isCommissionPaid);
                  const pendingAmount = pendingSales.reduce((sum, s) => sum + s.barberCommission, 0);
                  const paidAmount = bSales.filter(s => s.isCommissionPaid).reduce((sum, s) => sum + s.barberCommission, 0);

                  return (
                    <div
                      key={barber.id}
                      className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center font-bold">
                              <Scissors className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                                {barber.name}
                              </h5>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                {barber.specialties?.[0] || 'Barbero Profesional'}
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            pendingSales.length > 0 
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' 
                              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {pendingSales.length} por liquidar
                          </span>
                        </div>

                        <div className="space-y-2 text-xs pt-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-300">Total acumulado pagado:</span>
                            <span className="font-bold text-emerald-500">${paidAmount.toLocaleString('es-CO')}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2">
                            <span className="text-slate-800 dark:text-slate-200 font-bold">Comisión Pendiente de Pago:</span>
                            <span className="font-display font-extrabold text-base text-amber-500">
                              ${pendingAmount.toLocaleString('es-CO')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenLiquidation(barber)}
                        className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                          pendingSales.length > 0
                            ? 'bg-[#c5a059] hover:bg-[#d8b56d] text-black font-extrabold'
                            : 'bg-slate-200/90 dark:bg-[#02253f] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>{pendingSales.length > 0 ? 'Liquidar con Firma & PDF' : 'Generar Comprobante / Saldo'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ACTIVE LIQUIDATION WORKSPACE */
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#011d32] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                      Liquidando a {selectedBarber?.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Selecciona los servicios, ajusta deducciones, captura firmas y descarga/envía el comprobante a WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBarberId(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <X className="w-4 h-4" />
                  <span>Cerrar</span>
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Step 1: Registered Services to Liquidate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>1. Servicios Registrados a Liquidar ({activeSales.length} de {barberPendingSales.length} seleccionados):</span>
                  </label>
                  {barberPendingSales.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllSales}
                      className="text-xs text-[#c5a059] hover:underline font-bold cursor-pointer"
                    >
                      {selectedSaleIds.length === barberPendingSales.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  )}
                </div>

                {barberPendingSales.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-[#02253f] border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-300">
                    No hay ventas pendientes por liquidar para este barbero.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {barberPendingSales.map((sale) => {
                      const isSelected = selectedSaleIds.includes(sale.id);
                      return (
                        <div
                          key={sale.id}
                          onClick={() => toggleSaleSelection(sale.id)}
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#c5a059]/15 border-[#c5a059] text-slate-900 dark:text-white shadow-sm'
                              : 'bg-slate-100/70 dark:bg-[#02253f]/70 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#c5a059] border-[#c5a059] text-black font-bold' : 'border-slate-400'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{sale.invoiceNumber}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">({sale.date})</span>
                                {sale.clientName && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    Cliente: {sale.clientName}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-md">
                                {sale.selectedServices.map(s => s.name).join(' + ')}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Comisión 50%</span>
                            <span className="font-display font-extrabold text-sm text-[#c5a059]">
                              ${sale.barberCommission.toLocaleString('es-CO')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Payment Details, Deductions and WhatsApp Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>WhatsApp del Barbero (para envío):</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 3001234567"
                    value={barberPhone}
                    onChange={(e) => setBarberPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Método de Pago Efectuado:</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="efectivo">Efectivo en Caja</option>
                    <option value="transferencia">Transferencia Bancaria (Nequi / Daviplata / Bancolombia)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Deducciones o Anticipos ($ COP):
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={deductionAmount || ''}
                    onChange={(e) => setDeductionAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                {deductionAmount > 0 && (
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Motivo de la deducción o anticipo:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Anticipo solicitado el jueves / Compra de producto personal"
                      value={deductionReason}
                      onChange={(e) => setDeductionReason(e.target.value)}
                      className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                )}
              </div>

              {/* Liquidation Calculation Box */}
              <div className="p-5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Comisiones Brutas Acumuladas ({activeSales.length} servicios):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${totalGrossCommission.toLocaleString('es-CO')} COP
                  </span>
                </div>
                {deductionAmount > 0 && (
                  <div className="flex justify-between text-rose-500 font-bold">
                    <span>Deducción / Anticipos aplicados:</span>
                    <span>-${deductionAmount.toLocaleString('es-CO')} COP</span>
                  </div>
                )}
                <div className="border-t border-slate-300 dark:border-white/15 pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                      Total Neto a Pagar al Barbero:
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Liquidación al 50% según contrato de arrendamiento de módulo
                    </span>
                  </div>
                  <div className="font-display font-black text-2xl text-[#c5a059]">
                    ${netPaidAmount.toLocaleString('es-CO')} COP
                  </div>
                </div>
              </div>

              {/* Step 3: DIGITAL SIGNATURES PAD */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#c5a059]" />
                  <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Espacio de Firmas Digitales Obligatorias
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ambas partes deben estampar su firma digital en la pantalla como constancia legal de pago y recibido a entera satisfacción.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Admin Signature */}
                  <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-[#011d32]/60 border border-slate-300/80 dark:border-white/15">
                    <SignaturePad
                      label="Firma de la Administración (Legado Barber Club)"
                      onSaveSignature={setAdminSignature}
                      required
                    />
                  </div>

                  {/* Barber Signature */}
                  <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-[#011d32]/60 border border-slate-300/80 dark:border-white/15">
                    <SignaturePad
                      label={`Firma del Barbero (${selectedBarber?.name}) - Recibido a Conformidad`}
                      onSaveSignature={setBarberSignature}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Download PDF, Send WhatsApp, Confirm & Save */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* WhatsApp button */}
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp()}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    title="Enviar comprobante detallado por WhatsApp"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar a WhatsApp</span>
                  </button>

                  {/* Download PDF button */}
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-300 dark:border-white/20 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-[#c5a059]" />
                    <span>Descargar PDF</span>
                  </button>
                </div>

                {/* Save and finalize button */}
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  disabled={activeSales.length === 0}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Guardar Liquidación & Cerrar Registro</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORIAL DE LIQUIDACIONES FIRMADAS */}
      {subTab === 'historial' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Comprobantes de Liquidación Firmados
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Historial legal de pagos con respaldo de firma digital, comprobante PDF descargable y reenvío a WhatsApp.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059]">
              {liquidations.length} registrados
            </span>
          </div>

          {liquidations.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-100/60 dark:bg-[#02253f]/60 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 text-xs">
              No hay liquidaciones firmadas aún. Cuando liquides a un barbero, los comprobantes aparecerán archivados aquí.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                  <tr>
                    <th className="py-3 px-3">Comprobante</th>
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">Barbero</th>
                    <th className="py-3 px-3 text-center">Servicios</th>
                    <th className="py-3 px-3">Método</th>
                    <th className="py-3 px-3 text-right">Neto Pagado</th>
                    <th className="py-3 px-3 text-center">Firmas</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {liquidations.map((liq) => (
                    <tr key={liq.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#c5a059] whitespace-nowrap">
                        {liq.voucherNumber}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {liq.date}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {liq.barberName}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {liq.totalServicesCount}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-slate-200 font-semibold text-[10px]">
                          {liq.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-display font-extrabold text-[#c5a059] whitespace-nowrap text-sm">
                        ${liq.netPaidAmount.toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {liq.barberSignature && liq.adminSignature ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Ambas Firmas
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Parcial</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => generateLiquidationPDF(liq)}
                            className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-[#02253f] hover:bg-[#c5a059] hover:text-black border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                            title="Descargar PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(liq)}
                            className="p-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white cursor-pointer transition-colors"
                            title="Reenviar a WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
