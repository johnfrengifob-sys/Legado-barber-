import React, { useState } from 'react';
import { 
  FileText, Shield, CheckCircle2, Download, Send, 
  Trash2, User, Phone, MapPin, Calendar, Percent, 
  AlertTriangle, Scissors, PenTool, Check, Clock, Eye
} from 'lucide-react';
import { Barber, BarberContract } from '../types';
import { SignaturePad } from './SignaturePad';
import { generateContractPDF } from '../utils/pdfGenerator';

interface BarberContractManagerProps {
  barbers: Barber[];
  contracts: BarberContract[];
  onSaveContract: (contract: BarberContract) => void;
  onDeleteContract: (contractId: string) => void;
}

export const BarberContractManager: React.FC<BarberContractManagerProps> = ({
  barbers,
  contracts,
  onSaveContract,
  onDeleteContract
}) => {
  const [subTab, setSubTab] = useState<'redactar' | 'vigentes'>('redactar');

  // Form State
  const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0]?.id || '');
  const [barberName, setBarberName] = useState<string>(barbers[0]?.name || '');
  const [barberCedula, setBarberCedula] = useState<string>(barbers[0]?.cedula || '');
  const [barberPhone, setBarberPhone] = useState<string>(barbers[0]?.phone || '3001234567');
  const [barberAddress, setBarberAddress] = useState<string>('');
  const [percentageCut, setPercentageCut] = useState<number>(50);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [barberSignature, setBarberSignature] = useState<string | null>(null);
  const [adminSignature, setAdminSignature] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [contractErrorMsg, setContractErrorMsg] = useState<string>('');

  // When barber selector changes
  const handleSelectBarberChange = (id: string) => {
    setSelectedBarberId(id);
    const found = barbers.find(b => b.id === id);
    if (found) {
      setBarberName(found.name);
      if (found.phone) setBarberPhone(found.phone);
      if (found.cedula) setBarberCedula(found.cedula);
    }
  };

  const buildContractObject = (): BarberContract => {
    const contractNumber = `LEG-CTR-${Date.now().toString().slice(-5)}`;
    return {
      id: `ctr-${Date.now()}`,
      contractNumber,
      barberId: selectedBarberId || `barber-${Date.now()}`,
      barberName: barberName.trim() || 'Barbero Contratista',
      barberCedula: barberCedula.trim() || 'Por definir',
      barberPhone: barberPhone.trim() || '3001234567',
      barberAddress: barberAddress.trim() || 'Colombia',
      percentageCut: percentageCut || 50,
      startDate: startDate || new Date().toISOString().split('T')[0],
      noticeDays: 20, // 20 days mandatory notice
      termsAccepted: true,
      barberSignature: barberSignature || undefined,
      adminSignature: adminSignature || undefined,
      status: 'activo'
    };
  };

  const handleDownloadPDF = () => {
    const contract = buildContractObject();
    generateContractPDF(contract);
  };

  const handleShareWhatsApp = (contractToShare?: BarberContract) => {
    const contract = contractToShare || buildContractObject();
    const phoneClean = (contract.barberPhone || '').replace(/\D/g, '');

    const text = 
`📜 *LEGADO BARBER CLUB* - *CONTRATO DE ARRENDAMIENTO DE PUESTO*
━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ *Contrato N°:* ${contract.contractNumber}
👤 *Barbero / Arrendatario:* ${contract.barberName} (C.C. ${contract.barberCedula})
📅 *Fecha de Inicio:* ${contract.startDate}
✂️ *Modalidad:* Arrendamiento de módulo con reparto al *${contract.percentageCut}%* por servicio.
━━━━━━━━━━━━━━━━━━━━━━━━
🤝 *COMPROMISOS DE LEGADO BARBER CLUB:*
• Puesto físico iluminado y equipado.
• Servicios públicos incluidos: WiFi alta velocidad, agua y luz continua.
• Estación de lavacabezas con champú, jabones y tratamientos.
• Toallas limpias y esterilizadas ilimitadas.
• Uniformes y capas institucionales de la marca.

💈 *COMPROMISOS DEL BARBERO:*
• Aportar su talento técnico y artístico.
• Aportar máquinas de corte, patilleras, tijeras, navajines y herramientas.
• ⚠️ *OBLIGACIÓN PERENTORIA:* Limpieza, barrido y desinfección de su estación de trabajo *inmediatamente después de cada servicio*.
• Acatar normas de bioseguridad (cuchillas desechables de único uso en guardián, Barbicide).
• Afiliación activa a Seguridad Social como independiente.

🚨 *CLÁUSULA DE PREAVISO OBLIGATORIO:*
Para la entrega, desocupación o renuncia voluntaria del puesto de trabajo, el barbero debe *NOTIFICAR POR ESCRITO CON MÍNIMO 20 DÍAS DE ANTELACIÓN*.
━━━━━━━━━━━━━━━━━━━━━━━━
✍️ *Estado:* Firmado digitalmente por ambas partes.

¡Bienvenido(a) a la familia y estándar exclusivo de *Legado Barber Club*! 💈🔥`;

    const encoded = encodeURIComponent(text);
    const targetUrl = phoneClean.length >= 7 
      ? `https://wa.me/57${phoneClean.startsWith('57') ? phoneClean.slice(2) : phoneClean}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(targetUrl, '_blank');
  };

  const handleSaveContract = () => {
    setContractErrorMsg('');
    if (!barberName.trim()) {
      setContractErrorMsg('Por favor ingresa el nombre del barbero.');
      return;
    }
    if (!barberCedula.trim()) {
      setContractErrorMsg('Por favor ingresa el número de documento / cédula del barbero.');
      return;
    }

    const contract = buildContractObject();
    onSaveContract(contract);
    setSaveSuccessMsg(`¡Contrato ${contract.contractNumber} guardado y firmado correctamente en el sistema!`);

    // Download PDF for records
    try {
      generateContractPDF(contract);
    } catch (e) {
      console.warn('Contract PDF download preview:', e);
    }

    setTimeout(() => {
      setSubTab('vigentes');
      setSaveSuccessMsg('');
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('redactar')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'redactar'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'bg-slate-100 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Redactar & Firmar Contrato</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('vigentes')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'vigentes'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'bg-slate-100 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Contratos Vigentes ({contracts.length})</span>
          </button>
        </div>
      </div>

      {subTab === 'redactar' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#011d32] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Contrato de Arrendamiento de Puesto de Trabajo (Módulo)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Régimen civil y comercial por porcentaje de servicio, con dotación de insumos, bioseguridad, cláusula de limpieza y preaviso de 20 días.
                </p>
              </div>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {contractErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{contractErrorMsg}</span>
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Vincular Barbero Existente:</span>
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => handleSelectBarberChange(e.target.value)}
                className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
              >
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Nombre Completo del Barbero:</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. John Alexander Pérez"
                value={barberName}
                onChange={(e) => setBarberName(e.target.value)}
                className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Cédula de Ciudadanía / Documento:</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1.098.765.432"
                value={barberCedula}
                onChange={(e) => setBarberCedula(e.target.value)}
                className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Celular WhatsApp:</span>
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
                <Percent className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Porcentaje de Reparto para el Barbero:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={90}
                  value={percentageCut}
                  onChange={(e) => setPercentageCut(parseInt(e.target.value) || 50)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
                <span className="text-xs font-bold text-[#c5a059] shrink-0">% / {(100 - percentageCut)}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Fecha de Inicio:</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Interactive Contract Terms Viewer */}
          <div className="p-5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-white/10 pb-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#c5a059]" />
                Cláusulas Legales & Políticas del Espacio
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059]">
                Preaviso de 20 días obligatorio
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Lo que pone Legado Barber */}
              <div className="p-4 rounded-xl bg-white/70 dark:bg-[#011d32]/70 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Aportes de LEGADO BARBER CLUB:
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <li>• <strong>Espacio físico:</strong> Puesto de trabajo higiénico, climatizado y con espejo iluminado.</li>
                  <li>• <strong>Servicios públicos continuos:</strong> Internet de alta velocidad (WiFi), fluido eléctrico y agua corriente potable.</li>
                  <li>• <strong>Lavacabezas equipado:</strong> Suministro ilimitado de champú, jabones y tratamientos.</li>
                  <li>• <strong>Toallas limpias:</strong> Dotación continua de toallas esterilizadas y desinfectadas.</li>
                  <li>• <strong>Uniformes & Capas:</strong> Capas de corte y uniformes institucionales de la marca.</li>
                  <li>• <strong>Infraestructura:</strong> Silla de barbero hidráulica y sistema de agendamiento digital.</li>
                </ul>
              </div>

              {/* Card 2: Lo que pone el Barbero & Obligaciones */}
              <div className="p-4 rounded-xl bg-white/70 dark:bg-[#011d32]/70 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-[#c5a059]" />
                  Aportes y Deberes del BARBERO:
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <li>• <strong>Talento y profesionalismo:</strong> Destreza técnica y artística en la atención.</li>
                  <li>• <strong>Herramientas propias:</strong> Máquinas (clippers/trimmers), tijeras, navajines, secador y peines.</li>
                  <li className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                    • ⚠️ LIMPIEZA INMEDIATA: Obligación perentoria de barrer, limpiar y desinfectar su estación después de CADA servicio.
                  </li>
                  <li>• <strong>Bioseguridad:</strong> Cuchillas desechables de único uso en guardián, y desinfección bactericida de peines.</li>
                  <li>• <strong>Seguridad Social:</strong> Afiliación activa y pago a Seguridad Social como independiente.</li>
                </ul>
              </div>
            </div>

            {/* Crucial Notice Clause Banner */}
            <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase tracking-wide block">
                  Cláusula de Preaviso Obligatorio para Entrega de Puesto (20 Días de Antelación)
                </span>
                <p className="text-[11px] mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                  Para la entrega, desocupación o cesación voluntaria del puesto de trabajo, el barbero arrendatario debe notificar formalmente a la administración con un <strong>mínimo estricto de veinte (20) días de antelación</strong>, entregando el módulo en impecable estado de aseo y mantenimiento.
                </p>
              </div>
            </div>
          </div>

          {/* Digital Signatures Box */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#c5a059]" />
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Firmas Digitales del Contrato
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-[#011d32]/60 border border-slate-300/80 dark:border-white/15">
                <SignaturePad
                  label="Firma de la Administración (Legado Barber Club)"
                  onSaveSignature={setAdminSignature}
                  required
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-[#011d32]/60 border border-slate-300/80 dark:border-white/15">
                <SignaturePad
                  label={`Firma del Barbero (${barberName || 'Arrendatario'})`}
                  onSaveSignature={setBarberSignature}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleShareWhatsApp()}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Contrato por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-300 dark:border-white/20 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-[#c5a059]" />
                <span>Descargar PDF Oficial</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveContract}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:brightness-105 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Guardar Contrato en el Sistema</span>
            </button>
          </div>
        </div>
      )}

      {/* VIGENTES TAB */}
      {subTab === 'vigentes' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Contratos de Arrendamiento Registrados
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pactos de espacio vigentes con firmas digitales, dotación garantizada y cláusula de preaviso de 20 días.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059]">
              {contracts.length} contratos activos
            </span>
          </div>

          {contracts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-100/60 dark:bg-[#02253f]/60 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 text-xs">
              No hay contratos registrados aún. Puedes redactar y firmar el primer contrato en la pestaña "Redactar & Firmar Contrato".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contracts.map(contract => (
                <div
                  key={contract.id}
                  className="p-5 rounded-2xl bg-slate-100/70 dark:bg-[#011d32]/70 border border-slate-200/80 dark:border-white/15 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#c5a059] font-bold uppercase tracking-wider block">
                        {contract.contractNumber}
                      </span>
                      <h5 className="font-display font-bold text-base text-slate-900 dark:text-white">
                        {contract.barberName}
                      </h5>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      Activo
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <div><strong>Cédula:</strong> {contract.barberCedula}</div>
                    <div><strong>WhatsApp:</strong> {contract.barberPhone}</div>
                    <div><strong>Fecha de Inicio:</strong> {contract.startDate}</div>
                    <div><strong>Porcentaje Pactado:</strong> {contract.percentageCut}% Barbero / {100 - contract.percentageCut}% Barbería</div>
                    <div><strong>Preaviso de Retiro:</strong> 20 días de antelación</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Firmado digitalmente</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => generateContractPDF(contract)}
                        className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-[#c5a059] hover:text-black border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                        title="Descargar PDF del Contrato"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(contract)}
                        className="p-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white cursor-pointer transition-colors"
                        title="Reenviar a WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteContract(contract.id)}
                        className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 cursor-pointer transition-colors"
                        title="Eliminar Contrato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
