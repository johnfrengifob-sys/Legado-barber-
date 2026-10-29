import React, { useState } from 'react';
import { 
  ShoppingCart, DollarSign, TrendingUp, Users, Send, FileSpreadsheet, 
  Package, UserCheck, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Percent, ArrowRight, Download, CreditCard, Banknote, Scissors, 
  RefreshCw, Check, Sparkles, AlertCircle
} from 'lucide-react';
import { 
  Service, Barber, ClientRecord, Sale, Expense, InventoryItem, 
  PromotionBroadcast, ExpenseCategory, SaleItemExtra 
} from '../types';

interface AdminPanelProps {
  services: Service[];
  barbers: Barber[];
  clients: ClientRecord[];
  sales: Sale[];
  expenses: Expense[];
  inventory: InventoryItem[];
  promotions: PromotionBroadcast[];
  onAddSale: (sale: Sale) => void;
  onAddExpense: (expense: Expense) => void;
  onSettleBarberCommissions: (barberId: string) => void;
  onSendBroadcast: (broadcast: PromotionBroadcast) => void;
  onUpdateInventoryStock: (itemId: string, newStock: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onAddBarber: (newBarber: Barber) => void;
  onDeleteBarber: (barberId: string) => void;
}

type AdminTab = 
  | 'pos' 
  | 'gastos' 
  | 'liquidacion' 
  | 'clientes' 
  | 'broadcast' 
  | 'historial' 
  | 'inventario' 
  | 'personal';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  services,
  barbers,
  clients,
  sales,
  expenses,
  inventory,
  promotions,
  onAddSale,
  onAddExpense,
  onSettleBarberCommissions,
  onSendBroadcast,
  onUpdateInventoryStock,
  onAddInventoryItem,
  onAddBarber,
  onDeleteBarber
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('pos');

  // POS State
  const [posBarberId, setPosBarberId] = useState<string>(barbers[0]?.id || '');
  const [posSelectedServices, setPosSelectedServices] = useState<Service[]>([]);
  const [posExtraProductName, setPosExtraProductName] = useState('');
  const [posExtraProductPrice, setPosExtraProductPrice] = useState<number>(0);
  const [posExtraProductsList, setPosExtraProductsList] = useState<SaleItemExtra[]>([]);
  const [posClientName, setPosClientName] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [posDiscountPercent, setPosDiscountPercent] = useState<0 | 25 | 50>(0);
  const [posStep, setPosStep] = useState<1 | 2>(1);
  const [posSuccessMsg, setPosSuccessMsg] = useState('');

  // Expenses State
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('insumos');

  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New Inventory Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Grooming');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemStock, setNewItemStock] = useState<number>(10);

  // New Barber State
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialties, setNewBarberSpecialties] = useState('');

  // POS Calculations
  const servicesSubtotal = posSelectedServices.reduce((sum, s) => sum + s.price, 0);
  const extrasSubtotal = posExtraProductsList.reduce((sum, e) => sum + e.price, 0);
  const rawTotal = servicesSubtotal + extrasSubtotal;
  
  // Discount applied to services
  const discountMultiplier = (100 - posDiscountPercent) / 100;
  const discountedServicesTotal = Math.round(servicesSubtotal * discountMultiplier);
  const finalTotal = discountedServicesTotal + extrasSubtotal;

  // 50/50 Split on services
  const barberCommission = Math.round(discountedServicesTotal * 0.5);
  const shopGain = finalTotal - barberCommission;

  // Add Extra Product to POS
  const handleAddExtraProduct = () => {
    if (!posExtraProductName.trim() || posExtraProductPrice <= 0) return;
    setPosExtraProductsList(prev => [
      ...prev,
      {
        id: `extra-${Date.now()}`,
        name: posExtraProductName.trim(),
        price: posExtraProductPrice
      }
    ]);
    setPosExtraProductName('');
    setPosExtraProductPrice(0);
  };

  const handleRemoveExtraProduct = (id: string) => {
    setPosExtraProductsList(prev => prev.filter(e => e.id !== id));
  };

  // Toggle Service selection in POS
  const handleToggleService = (service: Service) => {
    setPosSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // Submit POS Sale
  const handleRegisterSale = () => {
    if (posSelectedServices.length === 0 && posExtraProductsList.length === 0) return;
    const barb = barbers.find(b => b.id === posBarberId) || barbers[0];

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: `FACT-${Math.floor(100 + sales.length + 1)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      barberId: barb.id,
      barberName: barb.name,
      selectedServices: posSelectedServices,
      extraProducts: posExtraProductsList,
      subtotal: rawTotal,
      discountPercent: posDiscountPercent,
      total: finalTotal,
      paymentMethod: posPaymentMethod,
      barberCommission,
      shopGain,
      isCommissionPaid: false,
      clientName: posClientName.trim() || 'Cliente General'
    };

    onAddSale(newSale);
    setPosSuccessMsg(`¡Venta registrada con éxito (${newSale.invoiceNumber})!`);
    
    // Reset POS
    setTimeout(() => {
      setPosSelectedServices([]);
      setPosExtraProductsList([]);
      setPosClientName('');
      setPosDiscountPercent(0);
      setPosStep(1);
      setPosSuccessMsg('');
    }, 1800);
  };

  // Submit Expense
  const handleRegisterExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim() || expAmount <= 0) return;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: expDescription.trim(),
      amount: expAmount,
      category: expCategory
    };

    onAddExpense(newExp);
    setExpDescription('');
    setExpAmount(0);
  };

  // Submit Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    const newBroadcast: PromotionBroadcast = {
      id: `broad-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      recipientsCount: clients.length
    };

    onSendBroadcast(newBroadcast);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }, 2000);
  };

  // Submit New Inventory Item
  const handleCreateInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemPrice <= 0) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory.trim() || 'Grooming',
      price: newItemPrice,
      stock: newItemStock,
      minStockAlert: 5
    };

    onAddInventoryItem(newItem);
    setNewItemName('');
    setNewItemPrice(0);
    setNewItemStock(10);
  };

  // Submit New Barber
  const handleCreateBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;

    const newBarber: Barber = {
      id: `barber-${Date.now()}`,
      name: newBarberName.trim(),
      active: true,
      specialties: newBarberSpecialties.trim() 
        ? newBarberSpecialties.split(',').map(s => s.trim()) 
        : ['Cortes Modernos', 'Degradados']
    };

    onAddBarber(newBarber);
    setNewBarberName('');
    setNewBarberSpecialties('');
  };

  // EXCEL / CSV Export function (delimited by semicolon ;)
  const handleExportCsv = () => {
    const headers = [
      'Factura',
      'Fecha',
      'Barbero',
      'Cliente',
      'Servicios',
      'Productos Extras',
      'Subtotal',
      'Descuento %',
      'Total Pagado',
      'Metodo de Pago',
      'Comision Barbero (50%)',
      'Ganancia Barberia',
      'Estado Liquidacion'
    ];

    const rows = sales.map((s) => [
      s.invoiceNumber,
      s.date,
      `"${s.barberName}"`,
      `"${s.clientName || ''}"`,
      `"${s.selectedServices.map(srv => srv.name).join(' + ')}"`,
      `"${s.extraProducts.map(e => `${e.name} ($${e.price})`).join(' + ')}"`,
      s.subtotal,
      `${s.discountPercent}%`,
      s.total,
      s.paymentMethod,
      s.barberCommission,
      s.shopGain,
      s.isCommissionPaid ? 'Pagada' : 'Pendiente'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Legado_Barber_Club_Ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial Liquidation Totals
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = totalSalesRevenue - totalExpensesAmount;
  const totalShopGains = sales.reduce((sum, s) => sum + s.shopGain, 0);
  const totalBarberPaidCommissions = sales
    .filter(s => s.isCommissionPaid)
    .reduce((sum, s) => sum + s.barberCommission, 0);

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'pos', label: 'Nueva Venta (POS)', icon: ShoppingCart },
    { id: 'gastos', label: 'Gastos y Egresos', icon: DollarSign },
    { id: 'liquidacion', label: 'Resumen y Liquidación', icon: TrendingUp },
    { id: 'clientes', label: 'Clientes & QR', icon: Users },
    { id: 'broadcast', label: 'Promociones Masivas', icon: Send },
    { id: 'historial', label: 'Historial & Excel', icon: FileSpreadsheet },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'personal', label: 'Personal', icon: UserCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Admin Title & Horizontal Navigation Bar */}
      <div className="liquid-glass-card rounded-3xl p-4 sm:p-6 border border-white/20 dark:border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
                Panel Administrador · Legado Barber Club
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control financiero, caja neta, comisiones 50/50 y base de datos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel (.csv)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#c5a059] text-black shadow-md'
                    : 'bg-slate-100/90 dark:bg-[#02253f] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300/80 dark:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. NUEVA VENTA (POS) */}
      {/* ============================================================== */}
      {activeTab === 'pos' && (
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/15 pb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Terminal Punto de Venta (POS)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {posStep === 1 ? 'Paso 1: Selección de barbero y servicios' : 'Paso 2: Resumen, cortesías y cobro'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#c5a059]">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${posStep === 1 ? 'bg-[#c5a059] text-black font-bold' : 'bg-slate-200 dark:bg-[#02253f] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/20'}`}>1</span>
              <span>→</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${posStep === 2 ? 'bg-[#c5a059] text-black font-bold' : 'bg-slate-200 dark:bg-[#02253f] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/20'}`}>2</span>
            </div>
          </div>

          {posSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{posSuccessMsg}</span>
            </div>
          )}

          {/* STEP 1: Barber & Services & Extra Products */}
          {posStep === 1 && (
            <div className="space-y-6">
              {/* Barber selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-2">
                  1. Barbero que atiende:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {barbers.map((b) => {
                    const isSelected = b.id === posBarberId;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setPosBarberId(b.id)}
                        className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow-md'
                            : 'bg-slate-100/90 dark:bg-[#02253f] border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-slate-200 font-semibold hover:border-[#c5a059]/40'
                        }`}
                      >
                        <Scissors className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs sm:text-sm">{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Name Optional */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Nombre del Cliente (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Andrés Gómez"
                  value={posClientName}
                  onChange={(e) => setPosClientName(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Interactive Services Cards (Esenciales, Premium, Colorimetría) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    2. Selección Múltiple de Servicios:
                  </label>
                  <span className="text-xs text-[#c5a059] font-bold">
                    {posSelectedServices.length} seleccionados
                  </span>
                </div>

                {/* Esenciales */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#c5a059] uppercase tracking-widest block">
                    Esenciales
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {services.filter(s => s.category === 'esenciales').map((srv) => {
                      const isSelected = posSelectedServices.some(s => s.id === srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => handleToggleService(srv)}
                          className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#c5a059]/20 border-[#c5a059] text-slate-900 dark:text-white font-bold shadow-sm'
                              : 'bg-slate-100/90 dark:bg-[#02253f] border-slate-300/80 dark:border-white/15 text-slate-800 dark:text-slate-100 hover:border-[#c5a059]/50'
                          }`}
                        >
                          <div>
                            <span className="block truncate font-semibold">{srv.name}</span>
                            <span className="text-[11px] text-[#c5a059] font-bold">
                              ${srv.price.toLocaleString('es-CO')}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'border-slate-400 dark:border-slate-500'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Premium */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-[#c5a059] uppercase tracking-widest block">
                    Premium
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {services.filter(s => s.category === 'premium').map((srv) => {
                      const isSelected = posSelectedServices.some(s => s.id === srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => handleToggleService(srv)}
                          className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#c5a059]/20 border-[#c5a059] text-slate-900 dark:text-white font-bold shadow-sm'
                              : 'bg-slate-100/90 dark:bg-[#02253f] border-slate-300/80 dark:border-white/15 text-slate-800 dark:text-slate-100 hover:border-[#c5a059]/50'
                          }`}
                        >
                          <div>
                            <span className="block truncate font-semibold">{srv.name}</span>
                            <span className="text-[11px] text-[#c5a059] font-bold">
                              ${srv.price.toLocaleString('es-CO')}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'border-slate-400 dark:border-slate-500'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Colorimetría */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-[#c5a059] uppercase tracking-widest block">
                    Colorimetría
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {services.filter(s => s.category === 'colorimetria').map((srv) => {
                      const isSelected = posSelectedServices.some(s => s.id === srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => handleToggleService(srv)}
                          className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#c5a059]/20 border-[#c5a059] text-slate-900 dark:text-white font-bold shadow-sm'
                              : 'bg-slate-100/90 dark:bg-[#02253f] border-slate-300/80 dark:border-white/15 text-slate-800 dark:text-slate-100 hover:border-[#c5a059]/50'
                          }`}
                        >
                          <div>
                            <span className="block truncate font-semibold">{srv.name}</span>
                            <span className="text-[11px] text-[#c5a059] font-bold">
                              ${srv.price.toLocaleString('es-CO')}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'border-slate-400 dark:border-slate-500'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Extra Products Field */}
              <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  3. Productos Extras (Opcional):
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del producto (ej. Pomada Mate, Cera)"
                    value={posExtraProductName}
                    onChange={(e) => setPosExtraProductName(e.target.value)}
                    className="flex-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      placeholder="Precio"
                      value={posExtraProductPrice || ''}
                      onChange={(e) => setPosExtraProductPrice(parseFloat(e.target.value) || 0)}
                      className="w-28 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]"
                    />
                    <button
                      type="button"
                      onClick={handleAddExtraProduct}
                      className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d8b56d] text-black font-bold text-xs cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>

                {posExtraProductsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {posExtraProductsList.map((ext) => (
                      <span
                        key={ext.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
                      >
                        <span>{ext.name} (${ext.price.toLocaleString('es-CO')})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraProduct(ext.id)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 1 Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 block">Subtotal Preliminar:</span>
                  <span className="font-display font-extrabold text-xl text-[#c5a059]">
                    ${rawTotal.toLocaleString('es-CO')}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={posSelectedServices.length === 0 && posExtraProductsList.length === 0}
                  onClick={() => setPosStep(2)}
                  className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    posSelectedServices.length > 0 || posExtraProductsList.length > 0
                      ? 'bg-[#c5a059] text-black shadow-lg cursor-pointer hover:scale-[1.02]'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Continuar a Cobro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SUMMARY, DISCOUNTS & PAYMENT */}
          {posStep === 2 && (
            <div className="space-y-6">
              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('efectivo')}
                    className={`py-3 px-4 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      posPaymentMethod === 'efectivo'
                        ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow-md'
                        : 'bg-slate-100/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-xs sm:text-sm">Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosPaymentMethod('transferencia')}
                    className={`py-3 px-4 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      posPaymentMethod === 'transferencia'
                        ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow-md'
                        : 'bg-slate-100/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs sm:text-sm">Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Discounts / Courtesy Pills (0%, 25%, 50%) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Descuento / Cortesía en Servicios:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 25, 50].map((dVal) => (
                    <button
                      key={dVal}
                      type="button"
                      onClick={() => setPosDiscountPercent(dVal as any)}
                      className={`py-2.5 px-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        posDiscountPercent === dVal
                          ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-md'
                          : 'bg-slate-100/90 dark:bg-[#02253f] border-slate-300/80 dark:border-white/20 text-slate-700 dark:text-slate-200 font-semibold'
                      }`}
                    >
                      {dVal === 0 ? 'Sin Descuento (0%)' : `${dVal}% Cortesía`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown Card (50/50 Split Calculation) */}
              <div className="p-5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Subtotal Servicios:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${servicesSubtotal.toLocaleString('es-CO')}</span>
                </div>
                {posDiscountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Descuento aplicado ({posDiscountPercent}%):</span>
                    <span>-${(servicesSubtotal - discountedServicesTotal).toLocaleString('es-CO')}</span>
                  </div>
                )}
                {extrasSubtotal > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                    <span>Productos Extras:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">${extrasSubtotal.toLocaleString('es-CO')}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-300 dark:border-white/15 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-slate-900 dark:text-white">Total a Cobrar:</span>
                  <span className="font-display text-lg text-[#c5a059]">${finalTotal.toLocaleString('es-CO')}</span>
                </div>

                {/* 50/50 Split Showcase */}
                <div className="pt-2 border-t border-dashed border-slate-300 dark:border-white/15 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block">Comisión Barbero (50%)</span>
                    <span className="font-bold text-amber-500 text-sm">${barberCommission.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase block">Ganancia Barbería</span>
                    <span className="font-bold text-blue-500 text-sm">${shopGain.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setPosStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  ← Modificar Servicios
                </button>

                <button
                  type="button"
                  onClick={handleRegisterSale}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Cobrar & Registrar Venta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. GASTOS Y EGRESOS */}
      {/* ============================================================== */}
      {activeTab === 'gastos' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Registrar Egreso / Salida de Caja
            </h3>
            <form onSubmit={handleRegisterExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Descripción del gasto (ej. Compra de toallas, recibo de luz)"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Monto ($ COP)"
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="alquiler">Alquiler</option>
                  <option value="insumos">Insumos</option>
                  <option value="servicios">Servicios</option>
                  <option value="sueldos">Sueldos</option>
                  <option value="publicidad">Publicidad</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Egreso</span>
                </button>
              </div>
            </form>
          </div>

          {/* Expenses List */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl overflow-hidden">
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">
              Historial de Egresos Registrados
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                  <tr>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">{exp.date}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-slate-200 font-semibold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{exp.description}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-500 whitespace-nowrap">
                        -${exp.amount.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. RESUMEN Y LIQUIDACIÓN DE PAGOS */}
      {/* ============================================================== */}
      {activeTab === 'liquidacion' && (
        <div className="space-y-8">
          {/* Global Metrics Cards */}
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

          {/* Individual Barber Liquidation Cards */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Liquidación Individual por Barbero
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.map((barber) => {
                const bSales = sales.filter(s => s.barberId === barber.id);
                const pending = bSales.filter(s => !s.isCommissionPaid).reduce((sum, s) => sum + s.barberCommission, 0);
                const paid = bSales.filter(s => s.isCommissionPaid).reduce((sum, s) => sum + s.barberCommission, 0);
                const count = bSales.length;

                return (
                  <div
                    key={barber.id}
                    className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                          {barber.name}
                        </h5>
                        <span className="text-xs bg-slate-200/80 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                          {count} ventas
                        </span>
                      </div>

                      <div className="space-y-2 text-xs pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Comisión Ya Pagada:</span>
                          <span className="font-bold text-emerald-500">${paid.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">Comisión Pendiente:</span>
                          <span className="font-display font-extrabold text-base text-amber-500">${pending.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={pending === 0}
                      onClick={() => onSettleBarberCommissions(barber.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        pending > 0
                          ? 'bg-[#c5a059] hover:bg-[#d8b56d] text-black shadow-md cursor-pointer'
                          : 'bg-slate-200/80 dark:bg-[#02253f] border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{pending > 0 ? 'Liquidar Pendientes' : 'Al Día (Sin saldo)'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BASE DE DATOS DE CLIENTES & QR */}
      {/* ============================================================== */}
      {activeTab === 'clientes' && (
        <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Base de Datos de Clientes & Validación QR
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Historial de visitas, calificaciones de 10 estrellas y recompensas de fidelización
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059]">
              {clients.length} clientes registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                <tr>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Teléfono / Email</th>
                  <th className="py-2.5 px-3 text-center">Visitas</th>
                  <th className="py-2.5 px-3 text-center">Calificación</th>
                  <th className="py-2.5 px-3">Comentarios</th>
                  <th className="py-2.5 px-3">Recompensas IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {clients.map((cli) => (
                  <tr key={cli.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {cli.clientName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-800 dark:text-slate-200 font-semibold">{cli.clientPhone}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-300">{cli.clientEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                      {cli.totalVisits}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-[#c5a059]">
                      ★ {cli.rating} / 10
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-200 max-w-xs truncate font-medium">
                      {cli.comments || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {cli.rewards.freeFacialCleaning && (
                          <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            Limpieza Facial
                          </span>
                        )}
                        {cli.rewards.freeHaircut && (
                          <span className="text-[10px] bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                            Corte Gratis
                          </span>
                        )}
                        {!cli.rewards.freeFacialCleaning && !cli.rewards.freeHaircut && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">En progreso ({cli.totalVisits}/5)</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ENVÍO DE PROMOCIONES (BROADCAST) */}
      {/* ============================================================== */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Envío de Promociones Masivas (Broadcast)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Redacta un mensaje especial para enviarlo a los {clients.length} clientes registrados en tu base de datos.
              </p>
            </div>

            {broadcastSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>¡Mensaje masivo enviado a {clients.length} clientes registrados!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-200 font-bold block mb-1">
                  Título de la Promoción *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. ¡Jueves de 2x1 en Rituales de Barba en Legado Barber Club!"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-200 font-bold block mb-1">
                  Cuerpo del Mensaje *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Estimado cliente, este fin de semana disfruta de una bebida premium gratis con cualquiera de nuestras Experiencias..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#c5a059] text-black font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Difusión a {clients.length} Clientes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Past Broadcasts List */}
          {promotions.length > 0 && (
            <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-3">
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Historial de Promociones Enviadas
              </h4>
              <div className="space-y-3">
                {promotions.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-xs space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{p.date} · {p.recipientsCount} destinatarios</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200">{p.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. HISTORIAL Y EXCEL */}
      {/* ============================================================== */}
      {activeTab === 'historial' && (
        <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Historial de Transacciones
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Registro completo de facturación con desglose de comisiones 50/50
              </p>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Archivo Excel (.csv)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                <tr>
                  <th className="py-2.5 px-3">Factura</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Barbero</th>
                  <th className="py-2.5 px-3">Servicios & Extras</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Comisión 50%</th>
                  <th className="py-2.5 px-3 text-center">Liquidación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#c5a059] whitespace-nowrap">
                      {s.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">{s.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {s.barberName}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {s.selectedServices.map(srv => srv.name).join(', ') || 'Productos'}
                      </div>
                      {s.extraProducts.length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">
                          + {s.extraProducts.map(e => e.name).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">{s.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      ${s.total.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-500 whitespace-nowrap">
                      ${s.barberCommission.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.isCommissionPaid 
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}>
                        {s.isCommissionPaid ? 'Pagada' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. INVENTARIO */}
      {/* ============================================================== */}
      {activeTab === 'inventario' && (
        <div className="space-y-6">
          {/* New Item Form */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-white/20 dark:border-white/10 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Dar de Alta Nuevo Producto en Inventario
            </h3>
            <form onSubmit={handleCreateInventoryItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Nombre del artículo"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
              />
              <input
                type="text"
                placeholder="Categoría (Fijación, Barba, etc.)"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
              />
              <input
                type="number"
                required
                min={1}
                placeholder="Precio Venta ($ COP)"
                value={newItemPrice || ''}
                onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                className="rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
              />
              <input
                type="number"
                required
                min={1}
                placeholder="Stock Inicial"
                value={newItemStock || ''}
                onChange={(e) => setNewItemStock(parseInt(e.target.value, 10) || 0)}
                className="rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
              />
              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar al Inventario</span>
                </button>
              </div>
            </form>
          </div>

          {/* Inventory Table with Low Stock Alerts and Quick +/- */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl overflow-hidden">
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">
              Control de Stock & Alertas de Reabastecimiento
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                  <tr>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Precio</th>
                    <th className="py-2.5 px-3 text-center">Stock Actual</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3 text-right">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {inventory.map((item) => {
                    const isLowStock = item.stock < item.minStockAlert;
                    return (
                      <tr key={item.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">{item.category}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          ${item.price.toLocaleString('es-CO')}
                        </td>
                        <td className="py-3 px-3 text-center font-display font-bold text-base text-slate-900 dark:text-white">
                          {item.stock}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Stock Bajo (&lt; {item.minStockAlert})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                              <Check className="w-3 h-3" />
                              <span>Óptimo</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onUpdateInventoryStock(item.id, Math.max(0, item.stock - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-[#02253f] hover:bg-slate-300 dark:hover:bg-[#033457] border border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-slate-100 font-bold flex items-center justify-center cursor-pointer shadow-sm"
                              title="Restar 1 unidad"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateInventoryStock(item.id, item.stock + 1)}
                              className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-[#02253f] hover:bg-[#c5a059] hover:text-black border border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-slate-100 font-bold flex items-center justify-center cursor-pointer shadow-sm"
                              title="Sumar 1 unidad"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. PERSONAL */}
      {/* ============================================================== */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* New Barber Form */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Dar de Alta Nuevo Barbero en el Equipo
            </h3>
            <form onSubmit={handleCreateBarber} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Nombre del barbero"
                value={newBarberName}
                onChange={(e) => setNewBarberName(e.target.value)}
                className="rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
              />
              <input
                type="text"
                placeholder="Especialidades (separadas por comas)"
                value={newBarberSpecialties}
                onChange={(e) => setNewBarberSpecialties(e.target.value)}
                className="rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c5a059] text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dar de Alta</span>
                </button>
              </div>
            </form>
          </div>

          {/* Barbers Roster List */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Equipo de Barberos Activos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="p-5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-base text-slate-900 dark:text-white">{barber.name}</h5>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Activo
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {barber.specialties.map((spec, i) => (
                        <span key={i} className="text-[10px] bg-white dark:bg-[#031d33] px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {barbers.length > 1 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de dar de baja a ${barber.name}?`)) {
                            onDeleteBarber(barber.id);
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Dar de baja</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
