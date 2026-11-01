import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, DollarSign, TrendingUp, Users, Send, FileSpreadsheet, 
  Package, UserCheck, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Percent, ArrowRight, Download, CreditCard, Banknote, Scissors, 
  RefreshCw, Check, Sparkles, AlertCircle, FileText, UserPlus, X, Phone,
  QrCode, Copy, ExternalLink, Share2, Printer, Star, Edit3, Clock,
  Sliders, RotateCcw, Search, Tag, Eye, Globe, Smartphone, CheckCheck,
  Settings2, Info, Gift, ShieldCheck, Scan, UserMinus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Service, Barber, ClientRecord, Sale, Expense, InventoryItem, 
  PromotionBroadcast, ExpenseCategory, SaleItemExtra,
  BarberLiquidation, BarberContract, ServiceCategory, PriceChangeRecord
} from '../types';
import { BarberLiquidationManager } from './BarberLiquidationManager';
import { BarberContractManager } from './BarberContractManager';
import { SalesAnalyticsChart } from './SalesAnalyticsChart';

// Official public Shared App URL for Legado Barber Club in Google AI Studio
export const CLOUD_PUBLIC_URL = 'https://ais-pre-p3or5h4onxhacpe54j56ts-387828498531.us-west2.run.app';

/**
 * Resolves the public URL for customers to access the self-service portal
 * without facing 401/403 developer authorization barriers on other devices.
 */
export function computeClientPortalUrl(override?: string, preset: 'cloud' | 'origin' | 'custom' = 'cloud'): string {
  if (preset === 'custom' && override && override.trim()) {
    let clean = override.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    clean = clean.replace(/\/+$/, '');
    return `${clean}/?panel=clientes`;
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;

    // If user explicitly forced origin
    if (preset === 'origin') {
      return `${origin}${window.location.pathname}?panel=clientes`;
    }

    // Default 'cloud' or auto-detection:
    // In AI Studio developer sandbox, 'ais-dev-' requires internal developer IAM login.
    // Changing 'ais-dev-' to 'ais-pre-' converts it to the Public Shared App URL
    // accessible to ANY device (iPhone, Android, external laptops) without any login.
    if (origin.includes('ais-dev-')) {
      const publicOrigin = origin.replace('ais-dev-', 'ais-pre-');
      return `${publicOrigin}/?panel=clientes`;
    }

    // If running on localhost or 127.0.0.1, external phones will fail to connect.
    // Use the official public cloud preview link instead.
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return `${CLOUD_PUBLIC_URL}/?panel=clientes`;
    }

    // Otherwise (e.g. production domain or ais-pre-)
    return `${origin}${window.location.pathname}?panel=clientes`;
  }

  return `${CLOUD_PUBLIC_URL}/?panel=clientes`;
}

interface AdminPanelProps {
  services: Service[];
  barbers: Barber[];
  clients: ClientRecord[];
  sales: Sale[];
  expenses: Expense[];
  inventory: InventoryItem[];
  promotions: PromotionBroadcast[];
  liquidations?: BarberLiquidation[];
  contracts?: BarberContract[];
  priceChanges?: PriceChangeRecord[];
  onAddSale: (sale: Sale) => void;
  onUpdateSale?: (sale: Sale) => void;
  onDeleteSale?: (saleId: string) => void;
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onSettleBarberCommissions: (barberId: string) => void;
  onSaveLiquidation?: (liq: BarberLiquidation) => void;
  onSaveContract?: (contract: BarberContract) => void;
  onDeleteContract?: (contractId: string) => void;
  onSendBroadcast: (broadcast: PromotionBroadcast) => void;
  onUpdateInventoryStock: (itemId: string, newStock: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onAddBarber: (newBarber: Barber) => void;
  onToggleBarberStatus?: (barberId: string, active: boolean) => void;
  onDeleteBarber: (barberId: string) => void;
  onUpdateService?: (service: Service) => void;
  onAddService?: (newService: Service) => void;
  onDeleteService?: (serviceId: string) => void;
  onResetServices?: () => void;
  onRecordPriceChange?: (record: PriceChangeRecord) => void;
  onUpdateClient?: (client: ClientRecord) => void;
  onDeleteClient?: (clientId: string) => void;
  onAddClient?: (newClient: ClientRecord) => void;
}

type AdminTab = 
  | 'pos' 
  | 'servicios'
  | 'personal'
  | 'gastos' 
  | 'liquidacion' 
  | 'contratos' 
  | 'clientes' 
  | 'broadcast' 
  | 'historial' 
  | 'inventario';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  services,
  barbers,
  clients,
  sales,
  expenses,
  inventory,
  promotions,
  liquidations = [],
  contracts = [],
  priceChanges = [],
  onAddSale,
  onUpdateSale = () => {},
  onDeleteSale = () => {},
  onAddExpense,
  onUpdateExpense = () => {},
  onDeleteExpense = () => {},
  onSettleBarberCommissions,
  onSaveLiquidation = () => {},
  onSaveContract = () => {},
  onDeleteContract = () => {},
  onSendBroadcast,
  onUpdateInventoryStock,
  onAddInventoryItem,
  onAddBarber,
  onToggleBarberStatus = () => {},
  onDeleteBarber,
  onUpdateService = () => {},
  onAddService = () => {},
  onDeleteService = () => {},
  onResetServices = () => {},
  onRecordPriceChange = () => {},
  onUpdateClient = () => {},
  onDeleteClient = () => {},
  onAddClient = () => {}
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

  // Expenses State & Actions (Edición, Eliminación y Búsqueda)
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('insumos');
  const [expSearchQuery, setExpSearchQuery] = useState('');
  const [expCategoryFilter, setExpCategoryFilter] = useState<'todos' | ExpenseCategory>('todos');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editExpDescription, setEditExpDescription] = useState('');
  const [editExpAmount, setEditExpAmount] = useState<number>(0);
  const [editExpCategory, setEditExpCategory] = useState<ExpenseCategory>('insumos');
  const [editExpDate, setEditExpDate] = useState('');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expFeedbackMsg, setExpFeedbackMsg] = useState('');
  const [historyView, setHistoryView] = useState<'ventas' | 'egresos'>('ventas');

  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New Inventory Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Grooming');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemStock, setNewItemStock] = useState<number>(10);

  // New Barber State & Modal
  const [addBarberModalOpen, setAddBarberModalOpen] = useState(false);
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberCedula, setNewBarberCedula] = useState('');
  const [newBarberPhone, setNewBarberPhone] = useState('');
  const [newBarberSpecialties, setNewBarberSpecialties] = useState('');
  const [barberSuccessMsg, setBarberSuccessMsg] = useState('');

  // Client QR Link & Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDomainPreset, setQrDomainPreset] = useState<'cloud' | 'origin' | 'custom'>(() => {
    return (localStorage.getItem('legado_qr_domain_preset') as any) || 'cloud';
  });
  const [customQrDomain, setCustomQrDomain] = useState<string>(() => {
    return localStorage.getItem('legado_custom_qr_domain') || '';
  });
  const [showQrSettings, setShowQrSettings] = useState(false);
  const [domainFeedbackMsg, setDomainFeedbackMsg] = useState('');

  // Services & Prices State
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<'todos' | ServiceCategory>('todos');
  const [serviceEdits, setServiceEdits] = useState<Record<string, {
    price: number;
    durationMinutes: number;
    name: string;
    description: string;
    category: ServiceCategory;
  }>>({});
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [bulkAdjustModalOpen, setBulkAdjustModalOpen] = useState(false);

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>('esenciales');
  const [newServicePrice, setNewServicePrice] = useState<number>(30000);
  const [newServiceDuration, setNewServiceDuration] = useState<number>(35);
  const [newServiceDescription, setNewServiceDescription] = useState('');

  // Bulk Price Adjust Form State
  const [bulkAdjustType, setBulkAdjustType] = useState<'fixed' | 'percent'>('fixed');
  const [bulkAdjustAmount, setBulkAdjustAmount] = useState<number>(5000);
  const [bulkAdjustDirection, setBulkAdjustDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkTargetCategory, setBulkTargetCategory] = useState<'todos' | ServiceCategory>('todos');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [priceHistorySearch, setPriceHistorySearch] = useState<string>('');

  // Sales (POS) Income Editing State (Valor, Fecha y Hora)
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editSaleTotal, setEditSaleTotal] = useState<number>(0);
  const [editSaleDate, setEditSaleDate] = useState<string>(''); // YYYY-MM-DD
  const [editSaleTime, setEditSaleTime] = useState<string>(''); // HH:mm
  const [editSaleBarberId, setEditSaleBarberId] = useState<string>('');
  const [editSalePaymentMethod, setEditSalePaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [editSaleClientName, setEditSaleClientName] = useState<string>('');
  const [editSaleSuccessMsg, setEditSaleSuccessMsg] = useState<string>('');
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Barber Deactivation & Management State (Dar de baja / Reactivar / Eliminar)
  const [barberStatusFilter, setBarberStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [barberToDeactivate, setBarberToDeactivate] = useState<Barber | null>(null);
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [barberFeedbackMsg, setBarberFeedbackMsg] = useState<string>('');

  // Client Management & QR Validation State
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientFilterStatus, setClientFilterStatus] = useState<'all' | 'rewards' | 'vip' | 'perfect'>('all');
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientVisits, setEditClientVisits] = useState<number>(1);
  const [editClientRating, setEditClientRating] = useState<number>(10);
  const [editClientComments, setEditClientComments] = useState('');
  const [editClientFreeFacial, setEditClientFreeFacial] = useState<boolean>(false);
  const [editClientFreeHaircut, setEditClientFreeHaircut] = useState<boolean>(false);
  const [editClientLastVisit, setEditClientLastVisit] = useState<string>('');

  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null);

  // New Client Modal
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientVisits, setNewClientVisits] = useState<number>(1);
  const [newClientRating, setNewClientRating] = useState<number>(10);
  const [newClientComments, setNewClientComments] = useState('');

  // Individual Client QR / Loyalty Pass Modal
  const [clientQrCard, setClientQrCard] = useState<ClientRecord | null>(null);
  const [copiedClientCardLink, setCopiedClientCardLink] = useState(false);

  // Live QR Cashier Validator Modal
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState(false);
  const [qrSearchTerm, setQrSearchTerm] = useState('');
  const [clientFeedbackMsg, setClientFeedbackMsg] = useState('');

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = clientSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        c.clientName.toLowerCase().includes(q) ||
        c.clientPhone.toLowerCase().includes(q) ||
        (c.clientEmail && c.clientEmail.toLowerCase().includes(q)) ||
        (c.comments && c.comments.toLowerCase().includes(q))
      );

      if (!matchesSearch) return false;

      if (clientFilterStatus === 'rewards') {
        return c.rewards.freeFacialCleaning || c.rewards.freeHaircut;
      }
      if (clientFilterStatus === 'vip') {
        return c.totalVisits >= 5;
      }
      if (clientFilterStatus === 'perfect') {
        return c.rating >= 10;
      }
      return true;
    });
  }, [clients, clientSearchQuery, clientFilterStatus]);

  // Handlers for client editing, deleting, creation, and QR validation
  const handleOpenEditClient = (cli: ClientRecord) => {
    setEditingClient(cli);
    setEditClientName(cli.clientName);
    setEditClientPhone(cli.clientPhone);
    setEditClientEmail(cli.clientEmail || '');
    setEditClientVisits(cli.totalVisits);
    setEditClientRating(cli.rating);
    setEditClientComments(cli.comments || '');
    setEditClientFreeFacial(!!cli.rewards.freeFacialCleaning);
    setEditClientFreeHaircut(!!cli.rewards.freeHaircut);
    setEditClientLastVisit(cli.lastVisit || new Date().toISOString().split('T')[0]);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const history = [...(editingClient.rewards?.history || [])];
    if (editClientFreeFacial && !editingClient.rewards.freeFacialCleaning) {
      if (!history.some(h => h.includes('Limpieza Facial'))) {
        history.push(`Limpieza Facial asignada (${new Date().toISOString().split('T')[0]})`);
      }
    }
    if (editClientFreeHaircut && !editingClient.rewards.freeHaircut) {
      if (!history.some(h => h.includes('Corte Gratis'))) {
        history.push(`Corte Gratis asignado (${new Date().toISOString().split('T')[0]})`);
      }
    }

    const updated: ClientRecord = {
      ...editingClient,
      clientName: editClientName.trim() || editingClient.clientName,
      clientPhone: editClientPhone.trim() || editingClient.clientPhone,
      clientEmail: editClientEmail.trim() || editingClient.clientEmail,
      totalVisits: Math.max(0, editClientVisits),
      rating: editClientRating,
      comments: editClientComments.trim(),
      lastVisit: editClientLastVisit || editingClient.lastVisit,
      rewards: {
        freeFacialCleaning: editClientFreeFacial,
        freeHaircut: editClientFreeHaircut,
        history
      }
    };

    onUpdateClient(updated);
    if (clientQrCard && clientQrCard.id === updated.id) {
      setClientQrCard(updated);
    }
    setEditingClient(null);
    setClientFeedbackMsg(`Cliente ${updated.clientName} actualizado exitosamente.`);
    setTimeout(() => setClientFeedbackMsg(''), 4000);
  };

  const handleConfirmDeleteClient = () => {
    if (!clientToDelete) return;
    const name = clientToDelete.clientName;
    const id = clientToDelete.id;
    onDeleteClient(id);
    if (clientQrCard && clientQrCard.id === id) {
      setClientQrCard(null);
    }
    setClientToDelete(null);
    setClientFeedbackMsg(`Cliente ${name} eliminado permanentemente.`);
    setTimeout(() => setClientFeedbackMsg(''), 4000);
  };

  const handleCreateNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const initialVisits = Math.max(1, newClientVisits);
    const newClient: ClientRecord = {
      id: `cli-${Date.now()}`,
      clientName: newClientName.trim(),
      clientPhone: newClientPhone.trim(),
      clientEmail: newClientEmail.trim() || `${newClientName.trim().toLowerCase().replace(/\s+/g, '')}@ejemplo.com`,
      rating: newClientRating,
      comments: newClientComments.trim() || 'Cliente registrado desde panel administrador.',
      lastVisit: today,
      totalVisits: initialVisits,
      rewards: {
        freeFacialCleaning: initialVisits >= 5,
        freeHaircut: initialVisits >= 10,
        history: [
          ...(initialVisits >= 5 ? ['Limpieza Facial Gratis desbloqueada'] : []),
          ...(initialVisits >= 10 ? ['Corte Gratis desbloqueado'] : [])
        ]
      }
    };

    onAddClient(newClient);
    setAddClientModalOpen(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientVisits(1);
    setNewClientRating(10);
    setNewClientComments('');
    setClientFeedbackMsg(`Cliente ${newClient.clientName} registrado exitosamente.`);
    setTimeout(() => setClientFeedbackMsg(''), 4000);
  };

  const handleQuickValidateVisit = (cli: ClientRecord) => {
    const newTotalVisits = cli.totalVisits + 1;
    const today = new Date().toISOString().split('T')[0];
    const history = [...(cli.rewards?.history || [])];
    let freeFacial = cli.rewards.freeFacialCleaning;
    let freeHaircut = cli.rewards.freeHaircut;
    let unlockedMsg = '';

    if (newTotalVisits % 10 === 0) {
      freeHaircut = true;
      history.push(`Corte Gratis (Visita #${newTotalVisits})`);
      unlockedMsg = `🎉 ¡Corte Gratis Desbloqueado para ${cli.clientName}!`;
    } else if (newTotalVisits % 5 === 0) {
      freeFacial = true;
      history.push(`Limpieza Facial Gratis (Visita #${newTotalVisits})`);
      unlockedMsg = `✨ ¡Limpieza Facial Gratis Desbloqueada para ${cli.clientName}!`;
    }

    const updated: ClientRecord = {
      ...cli,
      totalVisits: newTotalVisits,
      lastVisit: today,
      rewards: {
        freeFacialCleaning: freeFacial,
        freeHaircut: freeHaircut,
        history
      }
    };

    onUpdateClient(updated);
    if (clientQrCard && clientQrCard.id === updated.id) {
      setClientQrCard(updated);
    }

    try {
      confetti({
        particleCount: unlockedMsg ? 100 : 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#38ef7d', '#11998e', '#ffffff']
      });
    } catch (e) {}

    setClientFeedbackMsg(unlockedMsg || `¡Asistencia validada (+1 visita) para ${cli.clientName}! Total: ${newTotalVisits} visitas.`);
    setTimeout(() => setClientFeedbackMsg(''), 4000);
  };

  const handleRedeemReward = (cli: ClientRecord, rewardType: 'facial' | 'corte') => {
    const history = [...(cli.rewards?.history || [])];
    const today = new Date().toISOString().split('T')[0];

    let freeFacial = cli.rewards.freeFacialCleaning;
    let freeHaircut = cli.rewards.freeHaircut;

    if (rewardType === 'facial') {
      freeFacial = false;
      history.push(`Limpieza Facial canjeada en recepción el ${today}`);
    } else {
      freeHaircut = false;
      history.push(`Corte Gratis canjeado en recepción el ${today}`);
    }

    const updated: ClientRecord = {
      ...cli,
      rewards: {
        freeFacialCleaning: freeFacial,
        freeHaircut: freeHaircut,
        history
      }
    };

    onUpdateClient(updated);
    if (clientQrCard && clientQrCard.id === updated.id) {
      setClientQrCard(updated);
    }

    setClientFeedbackMsg(`Recompensa (${rewardType === 'facial' ? 'Limpieza Facial' : 'Corte Gratis'}) canjeada exitosamente para ${cli.clientName}.`);
    setTimeout(() => setClientFeedbackMsg(''), 4000);
  };

  // Helper to get active editable values for a service (fallback to service's current values)
  const getServiceEditValues = (service: Service) => {
    return serviceEdits[service.id] || {
      price: service.price,
      durationMinutes: service.durationMinutes,
      name: service.name,
      description: service.description,
      category: service.category
    };
  };

  const handleUpdateServiceField = (
    service: Service, 
    field: 'price' | 'durationMinutes' | 'name' | 'description' | 'category', 
    value: any
  ) => {
    const current = getServiceEditValues(service);
    setServiceEdits(prev => ({
      ...prev,
      [service.id]: {
        ...current,
        [field]: value
      }
    }));
  };

  const handleQuickDelta = (service: Service, delta: number) => {
    const current = getServiceEditValues(service);
    const newPrice = Math.max(0, current.price + delta);
    handleUpdateServiceField(service, 'price', newPrice);
  };

  const handleSaveSingleService = (service: Service) => {
    const edits = getServiceEditValues(service);
    if (edits.price < 0 || !edits.name.trim()) return;

    const oldPrice = service.price;
    const newPrice = Number(edits.price);

    const updated: Service = {
      id: service.id,
      name: edits.name.trim(),
      category: edits.category,
      price: newPrice,
      durationMinutes: Number(edits.durationMinutes) || 30,
      description: edits.description.trim()
    };

    onUpdateService(updated);

    // Save Price Change Audit Log if price actually changed
    if (oldPrice !== newPrice) {
      const now = new Date();
      const changeRecord: PriceChangeRecord = {
        id: `pc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        serviceId: service.id,
        serviceName: updated.name,
        oldPrice,
        newPrice,
        difference: newPrice - oldPrice,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 8),
        modifiedBy: 'Administración Legado',
        reason: 'Modificación manual directa de tarifa'
      };
      onRecordPriceChange(changeRecord);
    }

    setServiceSuccessMsg(`¡Tarifa de "${updated.name}" actualizada a $${updated.price.toLocaleString('es-CO')} COP y registrada en auditoría!`);
    setTimeout(() => setServiceSuccessMsg(''), 5000);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || newServicePrice <= 0) return;

    const newService: Service = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory,
      price: Number(newServicePrice),
      durationMinutes: Number(newServiceDuration) || 30,
      description: newServiceDescription.trim() || 'Servicio personalizado de barbería en Legado Barber Club.'
    };

    onAddService(newService);

    // Record initial price in audit log
    const now = new Date();
    const changeRecord: PriceChangeRecord = {
      id: `pc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      serviceId: newService.id,
      serviceName: newService.name,
      oldPrice: 0,
      newPrice: newService.price,
      difference: newService.price,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 8),
      modifiedBy: 'Administración Legado',
      reason: 'Creación de nuevo servicio en catálogo'
    };
    onRecordPriceChange(changeRecord);

    setNewServiceName('');
    setNewServicePrice(30000);
    setNewServiceDuration(35);
    setNewServiceDescription('');
    setAddServiceModalOpen(false);
    setServiceSuccessMsg(`¡Servicio "${newService.name}" creado con éxito a $${newService.price.toLocaleString('es-CO')} COP!`);
    setTimeout(() => setServiceSuccessMsg(''), 4500);
  };

  const handleApplyBulkAdjust = () => {
    const targetServices = services.filter(s => 
      bulkTargetCategory === 'todos' ? true : s.category === bulkTargetCategory
    );

    if (targetServices.length === 0) return;

    const now = new Date();
    let recordsCreated = 0;

    targetServices.forEach(s => {
      let newPrice = s.price;
      if (bulkAdjustType === 'fixed') {
        newPrice = bulkAdjustDirection === 'increase' 
          ? s.price + bulkAdjustAmount 
          : Math.max(0, s.price - bulkAdjustAmount);
      } else {
        const factor = bulkAdjustDirection === 'increase' ? (1 + bulkAdjustAmount / 100) : (1 - bulkAdjustAmount / 100);
        newPrice = Math.round((s.price * factor) / 1000) * 1000;
      }

      const finalPrice = Math.max(1000, newPrice);

      const updated: Service = {
        ...s,
        price: finalPrice
      };

      onUpdateService(updated);

      if (s.price !== finalPrice) {
        recordsCreated++;
        const changeRecord: PriceChangeRecord = {
          id: `pc-${Date.now()}-${s.id}-${Math.random().toString(36).substring(2, 5)}`,
          serviceId: s.id,
          serviceName: updated.name,
          oldPrice: s.price,
          newPrice: finalPrice,
          difference: finalPrice - s.price,
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 8),
          modifiedBy: 'Administración Legado',
          reason: `Ajuste masivo (${bulkAdjustDirection === 'increase' ? '+' : '-'}${bulkAdjustAmount}${bulkAdjustType === 'percent' ? '%' : ' COP'})`
        };
        onRecordPriceChange(changeRecord);
      }

      setServiceEdits(prev => ({
        ...prev,
        [s.id]: {
          ...getServiceEditValues(s),
          price: updated.price
        }
      }));
    });

    setBulkAdjustModalOpen(false);
    setServiceSuccessMsg(`¡Ajuste masivo aplicado exitosamente a ${targetServices.length} servicios! Se guardaron ${recordsCreated} registros de auditoría.`);
    setTimeout(() => setServiceSuccessMsg(''), 5500);
  };

  const handleConfirmResetPrices = () => {
    onResetServices();
    setServiceEdits({});
    setShowResetConfirmModal(false);
    setServiceSuccessMsg('¡Tarifas oficiales de Legado Barber Club restablecidas exitosamente!');
    setTimeout(() => setServiceSuccessMsg(''), 4500);
  };

  // Sale Income Editing Handlers
  const handleOpenEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setEditSaleTotal(sale.total);
    setEditSaleBarberId(sale.barberId);
    setEditSalePaymentMethod(sale.paymentMethod);
    setEditSaleClientName(sale.clientName || 'Cliente General');

    // Parse date and time from sale.date (e.g. "2026-11-01 14:30" or "2026-11-01")
    if (sale.date && sale.date.includes(' ')) {
      const parts = sale.date.split(' ');
      setEditSaleDate(parts[0]);
      setEditSaleTime(parts[1]?.slice(0, 5) || '12:00');
    } else if (sale.date && sale.date.includes('T')) {
      const parts = sale.date.split('T');
      setEditSaleDate(parts[0]);
      setEditSaleTime(parts[1]?.slice(0, 5) || '12:00');
    } else {
      setEditSaleDate(sale.date || new Date().toISOString().split('T')[0]);
      setEditSaleTime(new Date().toTimeString().slice(0, 5));
    }
  };

  const handleSaveEditedSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale || editSaleTotal <= 0 || !editSaleDate) return;

    const selectedBarber = barbers.find(b => b.id === editSaleBarberId) || {
      id: editingSale.barberId,
      name: editingSale.barberName
    };

    const finalDateTime = `${editSaleDate} ${editSaleTime || '12:00'}`.trim();
    const newTotal = Number(editSaleTotal);
    const newCommission = Math.round(newTotal * 0.5);
    const newShopGain = newTotal - newCommission;

    const updatedSale: Sale = {
      ...editingSale,
      total: newTotal,
      subtotal: newTotal,
      date: finalDateTime,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      paymentMethod: editSalePaymentMethod,
      clientName: editSaleClientName.trim() || 'Cliente General',
      barberCommission: newCommission,
      shopGain: newShopGain
    };

    onUpdateSale(updatedSale);
    setEditingSale(null);
    setEditSaleSuccessMsg(`¡Ingreso de venta (${updatedSale.invoiceNumber}) actualizado a $${updatedSale.total.toLocaleString('es-CO')} COP (${updatedSale.date}) con éxito!`);
    setTimeout(() => setEditSaleSuccessMsg(''), 5000);
  };

  const handleConfirmDeleteSale = () => {
    if (!saleToDelete) return;
    onDeleteSale(saleToDelete.id);
    setSaleToDelete(null);
    setEditSaleSuccessMsg(`¡Registro de venta ${saleToDelete.invoiceNumber} eliminado del sistema!`);
    setTimeout(() => setEditSaleSuccessMsg(''), 4500);
  };

  // Barber Status (Dar de baja / Reactivar / Eliminar) Handlers
  const handleConfirmDeactivateBarber = () => {
    if (!barberToDeactivate) return;
    onToggleBarberStatus(barberToDeactivate.id, false);
    setBarberFeedbackMsg(`¡Barbero "${barberToDeactivate.name}" dado de baja (marcado como inactivo)! Sus ventas históricas y liquidaciones quedan resguardadas.`);
    setBarberToDeactivate(null);
    setTimeout(() => setBarberFeedbackMsg(''), 5500);
  };

  const handleConfirmReactivateBarber = (barber: Barber) => {
    onToggleBarberStatus(barber.id, true);
    setBarberFeedbackMsg(`¡Barbero "${barber.name}" reactivado con éxito y disponible nuevamente para atención y POS!`);
    setTimeout(() => setBarberFeedbackMsg(''), 5500);
  };

  const handleConfirmDeleteBarber = () => {
    if (!barberToDelete) return;
    onDeleteBarber(barberToDelete.id);
    setBarberFeedbackMsg(`¡Barbero "${barberToDelete.name}" eliminado definitivamente del equipo!`);
    setBarberToDelete(null);
    setTimeout(() => setBarberFeedbackMsg(''), 5500);
  };

  const handleConfirmDeleteService = () => {
    if (!serviceToDelete) return;
    onDeleteService(serviceToDelete.id);
    setServiceSuccessMsg(`Servicio "${serviceToDelete.name}" eliminado del catálogo.`);
    setServiceToDelete(null);
    setTimeout(() => setServiceSuccessMsg(''), 4500);
  };

  // Computed public client link for QR attendance and ratings (cloud public URL without auth barriers)
  const clientPortalUrl = useMemo(() => {
    return computeClientPortalUrl(customQrDomain, qrDomainPreset);
  }, [customQrDomain, qrDomainPreset]);

  const handleCopyClientLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(clientPortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleOpenClientLink = () => {
    if (typeof window !== 'undefined') {
      window.open(clientPortalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `¡Hola! Bienvenido a Legado Barber Club. Registra tu asistencia en recepción, califica a tu barbero y acumula visitas para cortes gratis aquí: ${clientPortalUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveQrPreset = (newPreset: 'cloud' | 'origin' | 'custom', customVal?: string) => {
    setQrDomainPreset(newPreset);
    localStorage.setItem('legado_qr_domain_preset', newPreset);
    if (customVal !== undefined) {
      setCustomQrDomain(customVal);
      localStorage.setItem('legado_custom_qr_domain', customVal);
    }
    setDomainFeedbackMsg('¡Configuración de enlace público guardada!');
    setTimeout(() => setDomainFeedbackMsg(''), 3000);
  };

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
    setExpFeedbackMsg(`¡Egreso "${newExp.description}" de $${newExp.amount.toLocaleString('es-CO')} registrado exitosamente!`);
    setTimeout(() => setExpFeedbackMsg(''), 4500);
  };

  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setEditExpDescription(exp.description);
    setEditExpAmount(exp.amount);
    setEditExpCategory(exp.category);
    setEditExpDate(exp.date || new Date().toISOString().split('T')[0]);
  };

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editExpDescription.trim() || editExpAmount <= 0) return;

    const updatedExp: Expense = {
      ...editingExpense,
      description: editExpDescription.trim(),
      amount: Number(editExpAmount),
      category: editExpCategory,
      date: editExpDate || editingExpense.date
    };

    onUpdateExpense(updatedExp);
    setEditingExpense(null);
    setExpFeedbackMsg(`¡Egreso "${updatedExp.description}" actualizado a $${updatedExp.amount.toLocaleString('es-CO')} COP con éxito!`);
    setTimeout(() => setExpFeedbackMsg(''), 4500);
  };

  const handleConfirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    const desc = expenseToDelete.description;
    const amount = expenseToDelete.amount;
    onDeleteExpense(expenseToDelete.id);
    setExpenseToDelete(null);
    setExpFeedbackMsg(`¡Egreso "${desc}" (-$${amount.toLocaleString('es-CO')} COP) eliminado del registro!`);
    setTimeout(() => setExpFeedbackMsg(''), 4500);
  };

  const handleExportExpensesCsv = () => {
    const headers = ['ID', 'Fecha', 'Categoria', 'Descripcion', 'Monto'];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      `"${e.category}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount
    ]);
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Legado_Barber_Club_Egresos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        : ['Cortes Clásicos', 'Degradados / Fade', 'Perfilado de Barba'],
      cedula: newBarberCedula.trim() || undefined,
      phone: newBarberPhone.trim() || undefined
    };

    onAddBarber(newBarber);
    setPosBarberId(newBarber.id);
    setNewBarberName('');
    setNewBarberSpecialties('');
    setNewBarberCedula('');
    setNewBarberPhone('');
    setAddBarberModalOpen(false);
    setBarberSuccessMsg(`¡Barbero "${newBarber.name}" ingresado con éxito y listo para atender!`);
    setTimeout(() => setBarberSuccessMsg(''), 5000);
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
    { id: 'servicios', label: 'Tarifas & Servicios', icon: Scissors },
    { id: 'personal', label: 'Barberos / Personal', icon: UserCheck },
    { id: 'gastos', label: 'Gastos y Egresos', icon: DollarSign },
    { id: 'liquidacion', label: 'Liquidar Barbero (Firmas & PDF)', icon: TrendingUp },
    { id: 'contratos', label: 'Contratos & Normativa (20 Días)', icon: FileText },
    { id: 'clientes', label: 'Clientes & QR', icon: Users },
    { id: 'broadcast', label: 'Promociones Masivas', icon: Send },
    { id: 'historial', label: 'Historial & Excel', icon: FileSpreadsheet },
    { id: 'inventario', label: 'Inventario', icon: Package },
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
                Control financiero, tarifas de servicios, comisiones 50/50 y personal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('servicios')}
              className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[40px] ${
                activeTab === 'servicios'
                  ? 'bg-[#c5a059] text-black shadow-md font-extrabold'
                  : 'bg-slate-200/80 dark:bg-[#02253f] hover:bg-[#c5a059]/20 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/15'
              }`}
              title="Modificar valores y tarifas de los servicios"
            >
              <Scissors className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
              <span className="truncate">Modificar Tarifas</span>
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[40px]"
              title="Ver y compartir enlace de asistencia QR y calificación"
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Link QR Clientes</span>
            </button>

            <button
              onClick={() => setAddBarberModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[40px]"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Ingresar Barbero</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Exportar Excel (.csv)</span>
            </button>
          </div>
        </div>

        {/* Success toast if service updated */}
        {serviceSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{serviceSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setServiceSuccessMsg('')}
              className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Success toast if barber status changed or removed */}
        {barberFeedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0" />
              <span>{barberFeedbackMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setBarberFeedbackMsg('')}
              className="text-xs text-[#c5a059] hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Success toast if sale income updated */}
        {editSaleSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{editSaleSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setEditSaleSuccessMsg('')}
              className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Success toast if expense updated or removed */}
        {expFeedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{expFeedbackMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setExpFeedbackMsg('')}
              className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Scrollable Navigation Tabs with responsive padding and snapping */}
        <div className="relative pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold scrollbar-none sm:scrollbar-thin scrollbar-thumb-[#c5a059]/40 snap-x">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 px-3.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer snap-start shrink-0 min-h-[42px] ${
                    isActive
                      ? 'bg-[#c5a059] text-black shadow-md font-extrabold'
                      : 'bg-slate-100/90 dark:bg-[#02253f] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300/80 dark:border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                    1. Barbero que atiende:
                  </label>
                  <button
                    type="button"
                    onClick={() => setAddBarberModalOpen(true)}
                    className="text-xs font-bold text-[#c5a059] hover:text-[#d4af37] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Ingresar nuevo barbero</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(barbers.filter(b => b.active !== false).length > 0 
                    ? barbers.filter(b => b.active !== false) 
                    : barbers
                  ).map((b) => {
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
                  <button
                    type="button"
                    onClick={() => setAddBarberModalOpen(true)}
                    className="py-3 px-4 rounded-2xl border border-dashed border-[#c5a059]/60 hover:border-[#c5a059] hover:bg-[#c5a059]/10 text-[#c5a059] text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-bold">+ Ingresar</span>
                  </button>
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    2. Selección Múltiple de Servicios:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('servicios')}
                      className="text-xs text-[#c5a059] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      title="Ir al gestor de tarifas para cambiar los precios oficiales"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Modificar Tarifas</span>
                    </button>
                    <span className="text-xs text-slate-500 font-bold">
                      · {posSelectedServices.length} seleccionados
                    </span>
                  </div>
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
      {/* 2. GESTOR DE TARIFAS Y SERVICIOS                               */}
      {/* ============================================================== */}
      {activeTab === 'servicios' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Controls Card */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/10 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
                    Gestor de Tarifas y Catálogo de Servicios
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                  Modifica los precios al público, duración en minutos y nombres de cada servicio. Las modificaciones se sincronizan automáticamente en el terminal de cobro (POS), el portal de clientes y el sistema de reservas.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setBulkAdjustModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-200/90 dark:bg-[#02253f] hover:bg-slate-300 dark:hover:bg-[#033458] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Ajustar todas las tarifas o una categoría por porcentaje o valor fijo"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Ajuste Masivo (+ / -)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-200/90 dark:bg-[#02253f] hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Restablecer tarifas a valores oficiales originales"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Originales</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddServiceModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Crear Nuevo Servicio</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Servicios</span>
                <span className="text-xl font-display font-black text-slate-900 dark:text-white">{services.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25">
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block">Esenciales</span>
                <span className="text-xl font-display font-black text-cyan-600 dark:text-cyan-400">
                  {services.filter(s => s.category === 'esenciales').length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#c5a059]/15 border border-[#c5a059]/30">
                <span className="text-[10px] uppercase font-bold text-[#c5a059] block">Experiencias Premium</span>
                <span className="text-xl font-display font-black text-[#c5a059]">
                  {services.filter(s => s.category === 'premium').length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25">
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Colorimetría</span>
                <span className="text-xl font-display font-black text-purple-600 dark:text-purple-400">
                  {services.filter(s => s.category === 'colorimetria').length}
                </span>
              </div>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
                {[
                  { id: 'todos', label: 'Todos', count: services.length },
                  { id: 'esenciales', label: 'Esenciales', count: services.filter(s => s.category === 'esenciales').length },
                  { id: 'premium', label: 'Premium', count: services.filter(s => s.category === 'premium').length },
                  { id: 'colorimetria', label: 'Colorimetría', count: services.filter(s => s.category === 'colorimetria').length },
                ].map((cat) => {
                  const isSelected = serviceCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setServiceCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow-sm'
                          : 'bg-slate-100/90 dark:bg-[#02253f] border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:border-[#c5a059]/40'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar servicio por nombre..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#c5a059]"
                />
                {serviceSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setServiceSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services
              .filter(s => {
                const matchesCategory = serviceCategoryFilter === 'todos' || s.category === serviceCategoryFilter;
                const matchesSearch = !serviceSearchQuery.trim() || 
                  s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                  s.description.toLowerCase().includes(serviceSearchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
              })
              .map((service) => {
                const edits = getServiceEditValues(service);
                const hasUnsavedChanges = 
                  edits.price !== service.price ||
                  edits.durationMinutes !== service.durationMinutes ||
                  edits.name !== service.name ||
                  edits.description !== service.description ||
                  edits.category !== service.category;

                const categoryTheme = service.category === 'premium'
                  ? { badge: 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/40', border: 'border-[#c5a059]/30 hover:border-[#c5a059]' }
                  : service.category === 'colorimetria'
                  ? { badge: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40', border: 'border-purple-500/30 hover:border-purple-400' }
                  : { badge: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40', border: 'border-cyan-500/30 hover:border-cyan-400' };

                return (
                  <div
                    key={service.id}
                    className={`liquid-glass-card rounded-3xl p-5 border shadow-xl flex flex-col justify-between transition-all duration-200 ${categoryTheme.border} ${
                      hasUnsavedChanges ? 'ring-2 ring-[#c5a059]' : ''
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${categoryTheme.badge}`}>
                          {edits.category === 'premium' ? 'Premium' : edits.category === 'colorimetria' ? 'Colorimetría' : 'Esencial'}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>{edits.durationMinutes} min</span>
                        </div>
                      </div>

                      {/* Service Name Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Nombre del Servicio
                        </label>
                        <input
                          type="text"
                          value={edits.name}
                          onChange={(e) => handleUpdateServiceField(service, 'name', e.target.value)}
                          className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 px-3 py-2 font-display font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      {/* Price Editing Zone */}
                      <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                            Valor / Tarifa (COP) *
                          </label>
                          <span className="font-display font-black text-base text-[#c5a059]">
                            ${Number(edits.price).toLocaleString('es-CO')}
                          </span>
                        </div>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={edits.price}
                            onChange={(e) => handleUpdateServiceField(service, 'price', Number(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-[#011d32] border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        {/* Quick +/- Delta Buttons */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleQuickDelta(service, -5000)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold transition-colors cursor-pointer"
                            title="Descontar $5.000 COP"
                          >
                            - $5.000
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDelta(service, 5000)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold transition-colors cursor-pointer"
                            title="Aumentar $5.000 COP"
                          >
                            + $5.000
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDelta(service, 10000)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold transition-colors cursor-pointer"
                            title="Aumentar $10.000 COP"
                          >
                            + $10.000
                          </button>
                        </div>
                      </div>

                      {/* Duration & Category Row */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Duración (Min)
                          </label>
                          <input
                            type="number"
                            min="5"
                            step="5"
                            value={edits.durationMinutes}
                            onChange={(e) => handleUpdateServiceField(service, 'durationMinutes', Number(e.target.value) || 30)}
                            className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 px-3 py-1.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Categoría
                          </label>
                          <select
                            value={edits.category}
                            onChange={(e) => handleUpdateServiceField(service, 'category', e.target.value as ServiceCategory)}
                            className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 px-2 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] cursor-pointer"
                          >
                            <option value="esenciales">Esenciales</option>
                            <option value="premium">Premium</option>
                            <option value="colorimetria">Colorimetría</option>
                          </select>
                        </div>
                      </div>

                      {/* Description Textarea */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          Descripción Comercial
                        </label>
                        <textarea
                          rows={2}
                          value={edits.description}
                          onChange={(e) => handleUpdateServiceField(service, 'description', e.target.value)}
                          placeholder="Detalles de lo que incluye el servicio..."
                          className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#c5a059] resize-none"
                        />
                      </div>

                      {/* 50/50 Live Commission Calculation */}
                      <div className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-[#02253f]/80 border border-slate-300/60 dark:border-white/10 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span>Comisión Barbero (50%):</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            ${Math.round(edits.price * 0.5).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span>Ganancia Sede Legado (50%):</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            ${Math.round(edits.price * 0.5).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceToDelete(service)}
                        className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-2.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer min-h-[40px] flex items-center justify-center"
                        title="Eliminar este servicio del catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveSingleService(service)}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                          hasUnsavedChanges
                            ? 'bg-[#c5a059] hover:bg-[#d4af37] text-black shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{hasUnsavedChanges ? 'Guardar Cambios' : 'Tarifa Guardada'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* ============================================================== */}
          {/* REGISTRO Y AUDITORÍA DE CAMBIOS DE PRECIOS                     */}
          {/* ============================================================== */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                      Registro de Auditoría de Cambios de Precio
                    </h4>
                    <span className="text-xs bg-[#c5a059]/20 text-[#c5a059] px-2.5 py-0.5 rounded-full font-bold">
                      {priceChanges.length} cambios guardados
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Historial oficial e inmutable de variaciones de tarifas con fecha, hora, tarifa previa, nueva tarifa y diferencia
                  </p>
                </div>
              </div>

              {priceChanges.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por servicio o fecha..."
                      value={priceHistorySearch}
                      onChange={(e) => setPriceHistorySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              )}
            </div>

            {priceChanges.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-100/60 dark:bg-[#02253f]/40 border border-dashed border-slate-300/80 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs space-y-1">
                <Info className="w-6 h-6 mx-auto mb-2 text-[#c5a059]" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">Aún no se han guardado modificaciones de precios en esta sesión.</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Cada vez que modifiques una tarifa individual o apliques un ajuste masivo, el sistema registrará automáticamente el cambio con fecha y hora exacta.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
                <table className="w-full text-left text-xs min-w-[720px]">
                  <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                    <tr>
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Servicio</th>
                      <th className="py-2.5 px-3 text-right">Tarifa Anterior</th>
                      <th className="py-2.5 px-3 text-right">Nueva Tarifa</th>
                      <th className="py-2.5 px-3 text-center">Variación</th>
                      <th className="py-2.5 px-3">Motivo / Modificado por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {priceChanges
                      .filter(pc => !priceHistorySearch.trim() || pc.serviceName.toLowerCase().includes(priceHistorySearch.toLowerCase()) || pc.date.includes(priceHistorySearch))
                      .map((pc) => {
                        const isIncrease = pc.difference > 0;
                        const isDecrease = pc.difference < 0;
                        return (
                          <tr key={pc.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono">
                              {pc.date} · {pc.time}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              {pc.serviceName}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              ${pc.oldPrice.toLocaleString('es-CO')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#c5a059] whitespace-nowrap">
                              ${pc.newPrice.toLocaleString('es-CO')}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {isIncrease && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                  +${pc.difference.toLocaleString('es-CO')}
                                </span>
                              )}
                              {isDecrease && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                                  -${Math.abs(pc.difference).toLocaleString('es-CO')}
                                </span>
                              )}
                              {!isIncrease && !isDecrease && (
                                <span className="text-slate-400 text-[10px] font-bold">Sin variación</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                              <span className="font-semibold">{pc.reason || 'Modificación manual'}</span>
                              <span className="text-[10px] text-slate-400 block">Por {pc.modifiedBy}</span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. GASTOS Y EGRESOS */}
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

          {/* Expenses Analytics & KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="liquid-glass-card rounded-2xl p-3.5 border border-slate-200/80 dark:border-white/15 shadow-sm">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Total Egresos Registrados
                </span>
                <span className="w-5 h-5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-3 h-3" />
                </span>
              </div>
              <div className="font-display font-extrabold text-lg text-rose-600 dark:text-rose-400">
                -${totalExpensesAmount.toLocaleString('es-CO')}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Salidas operativas del negocio
              </span>
            </div>

            <div className="liquid-glass-card rounded-2xl p-3.5 border border-slate-200/80 dark:border-white/15 shadow-sm">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                  Total Comprobantes
                </span>
                <span className="w-5 h-5 rounded-md bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3" />
                </span>
              </div>
              <div className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                {expenses.length} <span className="text-xs font-normal text-slate-500">registros</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Asientos de egreso en historial
              </span>
            </div>

            <div className="liquid-glass-card rounded-2xl p-3.5 border border-slate-200/80 dark:border-white/15 shadow-sm">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gasto Promedio por Asiento
                </span>
                <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3 h-3" />
                </span>
              </div>
              <div className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                ${expenses.length > 0 ? Math.round(totalExpensesAmount / expenses.length).toLocaleString('es-CO') : 0}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Cálculo medio por transacción
              </span>
            </div>
          </div>

          {/* Expenses List with Search, Filter, Edit and Delete */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Historial de Egresos Registrados
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Gestiona, edita montos, modifica fechas o elimina asientos de egreso con actualización inmediata de balances
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExpensesCsv}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Exportar egresos a formato Excel (.csv)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.csv)</span>
                </button>
              </div>
            </div>

            {/* Search and Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar egreso por descripción, notas o fecha (ej. luz, toallas, 2026-11)..."
                  value={expSearchQuery}
                  onChange={(e) => setExpSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#c5a059]"
                />
                {expSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setExpSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={expCategoryFilter}
                  onChange={(e) => setExpCategoryFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] cursor-pointer"
                >
                  <option value="todos">Todas las Categorías</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="insumos">Insumos</option>
                  <option value="servicios">Servicios</option>
                  <option value="sueldos">Sueldos</option>
                  <option value="publicidad">Publicidad</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {expenses.filter(e => {
              if (expCategoryFilter !== 'todos' && e.category !== expCategoryFilter) return false;
              if (expSearchQuery.trim()) {
                const q = expSearchQuery.toLowerCase().trim();
                return e.description.toLowerCase().includes(q) || e.date.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
              }
              return true;
            }).length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-100/60 dark:bg-[#02253f]/40 border border-dashed border-slate-300/80 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs space-y-1">
                <Info className="w-6 h-6 mx-auto mb-2 text-[#c5a059]" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  No se encontraron egresos con los filtros aplicados.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {expSearchQuery || expCategoryFilter !== 'todos' ? 'Intenta modificar el término de búsqueda o seleccionar otra categoría.' : 'Aún no se han registrado egresos. Puedes crear el primero en el formulario superior.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                      <th className="py-2.5 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {expenses
                      .filter(e => {
                        if (expCategoryFilter !== 'todos' && e.category !== expCategoryFilter) return false;
                        if (expSearchQuery.trim()) {
                          const q = expSearchQuery.toLowerCase().trim();
                          return e.description.toLowerCase().includes(q) || e.date.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map((exp) => {
                        let badgeColor = 'bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-300';
                        if (exp.category === 'alquiler') badgeColor = 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300';
                        else if (exp.category === 'insumos') badgeColor = 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300';
                        else if (exp.category === 'servicios') badgeColor = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
                        else if (exp.category === 'sueldos') badgeColor = 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300';
                        else if (exp.category === 'publicidad') badgeColor = 'bg-pink-500/15 border-pink-500/30 text-pink-700 dark:text-pink-300';
                        else if (exp.category === 'mantenimiento') badgeColor = 'bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-300';

                        return (
                          <tr key={exp.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono font-medium">
                              {exp.date}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className={`capitalize px-2.5 py-1 rounded-full border text-[11px] font-bold ${badgeColor}`}>
                                {exp.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                              {exp.description}
                            </td>
                            <td className="py-3 px-3 text-right font-display font-bold text-rose-500 whitespace-nowrap text-sm">
                              -${exp.amount.toLocaleString('es-CO')}
                            </td>
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditExpense(exp)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/30 font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                  title="Editar descripción, monto, categoría o fecha de este egreso"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpenseToDelete(exp)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                  title="Eliminar este egreso del historial"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. RESUMEN Y LIQUIDACIÓN DE PAGOS (CON FIRMAS Y PDF) */}
      {/* ============================================================== */}
      {activeTab === 'liquidacion' && (
        <BarberLiquidationManager
          barbers={barbers}
          sales={sales}
          liquidations={liquidations}
          totalSalesRevenue={totalSalesRevenue}
          totalExpensesAmount={totalExpensesAmount}
          netCashFlow={netCashFlow}
          totalShopGains={totalShopGains}
          totalBarberPaidCommissions={totalBarberPaidCommissions}
          onSaveLiquidation={onSaveLiquidation}
          onSettleBarberCommissions={onSettleBarberCommissions}
        />
      )}

      {/* ============================================================== */}
      {/* CONTRATOS DE ARRENDAMIENTO DE PUESTO (PREAVISO 20 DÍAS) */}
      {/* ============================================================== */}
      {activeTab === 'contratos' && (
        <BarberContractManager
          barbers={barbers}
          contracts={contracts}
          onSaveContract={onSaveContract}
          onDeleteContract={onDeleteContract}
        />
      )}

      {/* ============================================================== */}
      {/* 4. BASE DE DATOS DE CLIENTES & QR */}
      {/* ============================================================== */}
      {activeTab === 'clientes' && (
        <div className="space-y-6">
          {/* Card Destacada: Enlace Oficial de Asistencia QR & Calificación 10★ */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#9b7b38] text-black flex items-center justify-center font-bold shadow-lg shadow-[#c5a059]/25 shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                      Enlace de Asistencia QR & Calificación 10★
                    </h3>
                    <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                      Público para Clientes
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Comparte este enlace por WhatsApp o genera el código QR para colocarlo en recepción o estaciones de corte
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Ver / Imprimir Código QR</span>
                </button>
              </div>
            </div>

            {/* Input con la URL directa y botones de acción rápida */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <span>Enlace Web Directo del Portal de Clientes:</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  (Ábrelo en cualquier móvil o tablet para registrar visitas)
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 p-2.5 rounded-2xl">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#031d33] rounded-xl border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto select-all">
                  <span className="text-[#c5a059] font-bold select-none">URL:</span>
                  <span className="font-semibold">{clientPortalUrl}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyClientLink}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent('¡Hola! Registra tu asistencia y califica tu experiencia en Legado Barber Club para acumular visitas y ganar cortes gratis aquí: ' + clientPortalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    title="Enviar enlace por WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  <a
                    href={clientPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center transition-all cursor-pointer"
                    title="Probar portal de cliente en nueva pestaña"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* 3 Quick highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-[#032540] border border-slate-200 dark:border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Escaneo Instantáneo</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Sin descargar apps ni registros engorrosos</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-[#032540] border border-slate-200 dark:border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Calificación 10 Estrellas</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Evaluación transparente del barbero</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-[#032540] border border-slate-200 dark:border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Fidelización Automática</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Desbloquea cortes y limpiezas gratis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Base de Datos de Clientes & Validación QR */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-5">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                    Base de Datos de Clientes & Validación QR
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059]">
                    {clients.length} clientes
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Edita datos, elimina registros, genera carnets QR individuales y valida visitas o canjes en caja en tiempo real.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setQrSearchTerm('');
                    setQrScannerModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-200/80 dark:bg-[#02253f] hover:bg-[#c5a059] hover:text-black text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  title="Escanear o buscar cliente para validar visita en caja"
                >
                  <Scan className="w-4 h-4 text-[#c5a059]" />
                  <span>Validar QR en Caja</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddClientModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#c5a059]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nuevo Cliente</span>
                </button>
              </div>
            </div>

            {/* Success Feedback Alert */}
            {clientFeedbackMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{clientFeedbackMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setClientFeedbackMsg('')}
                  className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Search Input & Status Filter Pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
                {clientSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setClientSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setClientFilterStatus('all')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    clientFilterStatus === 'all'
                      ? 'bg-[#c5a059] text-black shadow-sm'
                      : 'bg-slate-200/70 dark:bg-[#02253f] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#033355]'
                  }`}
                >
                  Todos ({clients.length})
                </button>

                <button
                  type="button"
                  onClick={() => setClientFilterStatus('rewards')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    clientFilterStatus === 'rewards'
                      ? 'bg-[#c5a059] text-black shadow-sm'
                      : 'bg-slate-200/70 dark:bg-[#02253f] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#033355]'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                  <span>Con Recompensa ({clients.filter(c => c.rewards.freeFacialCleaning || c.rewards.freeHaircut).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClientFilterStatus('vip')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    clientFilterStatus === 'vip'
                      ? 'bg-[#c5a059] text-black shadow-sm'
                      : 'bg-slate-200/70 dark:bg-[#02253f] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#033355]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>VIP (+5) ({clients.filter(c => c.totalVisits >= 5).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClientFilterStatus('perfect')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    clientFilterStatus === 'perfect'
                      ? 'bg-[#c5a059] text-black shadow-sm'
                      : 'bg-slate-200/70 dark:bg-[#02253f] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#033355]'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-[#c5a059] fill-[#c5a059]" />
                  <span>10★ ({clients.filter(c => c.rating >= 10).length})</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
              <table className="w-full text-left text-xs min-w-[860px]">
                <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                  <tr>
                    <th className="py-3 px-3.5">Cliente</th>
                    <th className="py-3 px-3.5">Teléfono / WhatsApp</th>
                    <th className="py-3 px-3 text-center">Visitas</th>
                    <th className="py-3 px-3 text-center">Calificación</th>
                    <th className="py-3 px-3.5">Comentarios / Notas</th>
                    <th className="py-3 px-3.5">Recompensas IA</th>
                    <th className="py-3 px-3 text-center">Pase QR</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((cli) => {
                      const hasRewards = cli.rewards.freeFacialCleaning || cli.rewards.freeHaircut;
                      return (
                        <tr key={cli.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                          {/* Client Name & ID */}
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {cli.clientName}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>ID: {cli.id}</span>
                              {cli.lastVisit && (
                                <span className="text-slate-400">· Última: {cli.lastVisit}</span>
                              )}
                            </div>
                          </td>

                          {/* Phone / Email */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-800 dark:text-slate-200 font-semibold">{cli.clientPhone}</span>
                              {cli.clientPhone && (
                                <a
                                  href={`https://wa.me/57${cli.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${cli.clientName}! Te saludamos de Legado Barber Club. Tienes ${cli.totalVisits} visitas acumuladas en tu carnet de fidelización.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-500 hover:text-emerald-600 p-0.5"
                                  title="Enviar WhatsApp al cliente"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                              {cli.clientEmail || '—'}
                            </div>
                          </td>

                          {/* Visits with Quick +1 button */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#02253f] px-2 py-1 rounded-xl border border-slate-200 dark:border-white/10">
                              <span className="font-display font-extrabold text-sm text-[#c5a059]">
                                {cli.totalVisits}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuickValidateVisit(cli)}
                                className="w-5 h-5 rounded-md bg-[#c5a059] hover:bg-[#d4af37] text-black font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                title="Sumar +1 visita instantánea (validar asistencia en caja)"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Rating */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="font-bold text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-lg border border-[#c5a059]/20">
                              ★ {cli.rating} / 10
                            </span>
                          </td>

                          {/* Comments */}
                          <td className="py-3 px-3.5 text-slate-700 dark:text-slate-200 max-w-[220px]">
                            <p className="truncate font-medium text-xs" title={cli.comments || 'Sin comentarios registrados'}>
                              {cli.comments || '—'}
                            </p>
                            {cli.rewards.history && cli.rewards.history.length > 0 && (
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5" title={cli.rewards.history.join(' | ')}>
                                ✓ {cli.rewards.history[cli.rewards.history.length - 1]}
                              </div>
                            )}
                          </td>

                          {/* Rewards & Redemption */}
                          <td className="py-3 px-3.5">
                            <div className="flex flex-col gap-1">
                              {cli.rewards.freeFacialCleaning && (
                                <div className="inline-flex items-center justify-between gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  <span>Limpieza Facial</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRedeemReward(cli, 'facial')}
                                    className="bg-emerald-600 text-white px-1.5 py-0.2 rounded hover:bg-emerald-500 cursor-pointer"
                                    title="Marcar recompensa como canjeada"
                                  >
                                    Canjear
                                  </button>
                                </div>
                              )}
                              {cli.rewards.freeHaircut && (
                                <div className="inline-flex items-center justify-between gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  <span>Corte Gratis</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRedeemReward(cli, 'corte')}
                                    className="bg-blue-600 text-white px-1.5 py-0.2 rounded hover:bg-blue-500 cursor-pointer"
                                    title="Marcar recompensa como canjeada"
                                  >
                                    Canjear
                                  </button>
                                </div>
                              )}
                              {!hasRewards && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  Progreso ({cli.totalVisits % 5}/5 para beneficio)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Pase QR Button */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setCopiedClientCardLink(false);
                                setClientQrCard(cli);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-[#02253f] hover:bg-[#c5a059] hover:text-black text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/15 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                              title="Ver código QR personalizado y pase de membresía del cliente"
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#c5a059]" />
                              <span>Carnet QR</span>
                            </button>
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditClient(cli)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/30 font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                title="Editar datos, visitas y recompensas de este cliente"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setClientToDelete(cli)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                title="Eliminar cliente de la base de datos"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#c5a059]" />
                        <p className="font-semibold text-xs">No se encontraron clientes que coincidan con la búsqueda.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setClientSearchQuery('');
                            setClientFilterStatus('all');
                          }}
                          className="mt-2 text-xs text-[#c5a059] font-bold hover:underline"
                        >
                          Limpiar filtros de búsqueda
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
        <div className="space-y-6">
          {/* Compact Informative KPI Metric Containers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Ingresos Totales Ventas */}
            <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 dark:border-white/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                  Ingresos Totales
                </span>
                <span className="w-5 h-5 rounded-md bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center shrink-0">
                  <DollarSign className="w-3 h-3" />
                </span>
              </div>
              <div className="font-display font-extrabold text-sm sm:text-base lg:text-lg text-[#c5a059] truncate">
                ${totalSalesRevenue.toLocaleString('es-CO')}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                {sales.length} ventas registradas
              </span>
            </div>

            {/* Ganancia Neta Sede */}
            <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 dark:border-white/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
                  Ganancia Sede
                </span>
                <span className="w-5 h-5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3 h-3" />
                </span>
              </div>
              <div className="font-display font-extrabold text-sm sm:text-base lg:text-lg text-blue-600 dark:text-blue-400 truncate">
                ${totalShopGains.toLocaleString('es-CO')}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                Participación barbería (50%)
              </span>
            </div>

            {/* Comisiones Pagadas */}
            <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 dark:border-white/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                  Comisiones Barberos
                </span>
                <span className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Scissors className="w-3 h-3" />
                </span>
              </div>
              <div className="font-display font-extrabold text-sm sm:text-base lg:text-lg text-amber-600 dark:text-amber-400 truncate">
                ${totalBarberPaidCommissions.toLocaleString('es-CO')}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                Liquidadas al equipo
              </span>
            </div>

            {/* Flujo de Caja Neto */}
            <div className="liquid-glass-card rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 dark:border-white/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                  Flujo de Caja Neto
                </span>
                <span className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Banknote className="w-3 h-3" />
                </span>
              </div>
              <div className={`font-display font-extrabold text-sm sm:text-base lg:text-lg truncate ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                ${netCashFlow.toLocaleString('es-CO')}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                Ventas - Egresos
              </span>
            </div>
          </div>

          {/* Panel Gráfico Interactivo: Ventas de Día (Horas de mayor flujo), Semana (Efectivo), Mes y Año */}
          <SalesAnalyticsChart sales={sales} barbers={barbers} />

          {/* Dual History Table Card (Ventas e Ingresos / Egresos y Gastos) */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-5">
            {/* View Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryView('ventas')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    historyView === 'ventas'
                      ? 'bg-[#c5a059] text-black shadow-md font-extrabold'
                      : 'bg-slate-100/90 dark:bg-[#02253f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ventas e Ingresos ({sales.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryView('egresos')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    historyView === 'egresos'
                      ? 'bg-rose-500 text-white shadow-md font-extrabold'
                      : 'bg-slate-100/90 dark:bg-[#02253f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Egresos y Gastos ({expenses.length})</span>
                </button>
              </div>

              {historyView === 'ventas' ? (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Ventas (.csv)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExportExpensesCsv}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Egresos (.csv)</span>
                </button>
              )}
            </div>

            {/* Sub-header description */}
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                {historyView === 'ventas' ? 'Historial de Transacciones e Ingresos' : 'Historial de Egresos & Salidas de Caja'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {historyView === 'ventas'
                  ? 'Registro completo de facturación. Haz clic en "Modificar" para editar el valor o en el icono de papelera para eliminar.'
                  : 'Historial oficial de egresos registrados. Haz clic en "Editar" para modificar monto, categoría o fecha, o en "Eliminar" para descartar.'}
              </p>
            </div>

            {/* VIEW 1: VENTAS */}
            {historyView === 'ventas' && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
                <table className="w-full text-left text-xs min-w-[820px]">
                  <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                    <tr>
                      <th className="py-2.5 px-3">Factura</th>
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Barbero</th>
                      <th className="py-2.5 px-3">Servicios & Extras</th>
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3 text-right">Total Ingreso</th>
                      <th className="py-2.5 px-3 text-right">Comisión 50%</th>
                      <th className="py-2.5 px-3 text-center">Liquidación</th>
                      <th className="py-2.5 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {sales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#c5a059] whitespace-nowrap">
                          {s.invoiceNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                          {s.date}
                        </td>
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
                          {s.clientName && s.clientName !== 'Cliente General' && (
                            <div className="text-[10px] text-[#c5a059] font-medium">
                              Cliente: {s.clientName}
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
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSale(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/30 font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                              title="Modificar valor, fecha y hora de este ingreso"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modificar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSaleToDelete(s)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                              title="Eliminar este registro de venta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW 2: EGRESOS */}
            {historyView === 'egresos' && (
              <div className="space-y-4">
                {/* Search and Category Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar egreso por descripción o fecha..."
                      value={expSearchQuery}
                      onChange={(e) => setExpSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#c5a059]"
                    />
                    {expSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setExpSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={expCategoryFilter}
                      onChange={(e) => setExpCategoryFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] cursor-pointer"
                    >
                      <option value="todos">Todas las Categorías</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="insumos">Insumos</option>
                      <option value="servicios">Servicios</option>
                      <option value="sueldos">Sueldos</option>
                      <option value="publicidad">Publicidad</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                </div>

                {expenses.filter(e => {
                  if (expCategoryFilter !== 'todos' && e.category !== expCategoryFilter) return false;
                  if (expSearchQuery.trim()) {
                    const q = expSearchQuery.toLowerCase().trim();
                    return e.description.toLowerCase().includes(q) || e.date.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
                  }
                  return true;
                }).length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-100/60 dark:bg-[#02253f]/40 border border-dashed border-slate-300/80 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs space-y-1">
                    <Info className="w-6 h-6 mx-auto mb-2 text-[#c5a059]" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      No se encontraron egresos con los filtros aplicados.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase tracking-wider font-bold border-b border-slate-300/80 dark:border-white/15">
                        <tr>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Categoría</th>
                          <th className="py-2.5 px-3">Descripción</th>
                          <th className="py-2.5 px-3 text-right">Monto</th>
                          <th className="py-2.5 px-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                        {expenses
                          .filter(e => {
                            if (expCategoryFilter !== 'todos' && e.category !== expCategoryFilter) return false;
                            if (expSearchQuery.trim()) {
                              const q = expSearchQuery.toLowerCase().trim();
                              return e.description.toLowerCase().includes(q) || e.date.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
                            }
                            return true;
                          })
                          .map((exp) => {
                            let badgeColor = 'bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-300';
                            if (exp.category === 'alquiler') badgeColor = 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300';
                            else if (exp.category === 'insumos') badgeColor = 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300';
                            else if (exp.category === 'servicios') badgeColor = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
                            else if (exp.category === 'sueldos') badgeColor = 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300';
                            else if (exp.category === 'publicidad') badgeColor = 'bg-pink-500/15 border-pink-500/30 text-pink-700 dark:text-pink-300';
                            else if (exp.category === 'mantenimiento') badgeColor = 'bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-300';

                            return (
                              <tr key={exp.id} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                                <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono font-medium">
                                  {exp.date}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span className={`capitalize px-2.5 py-1 rounded-full border text-[11px] font-bold ${badgeColor}`}>
                                    {exp.category}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                                  {exp.description}
                                </td>
                                <td className="py-3 px-3 text-right font-display font-bold text-rose-500 whitespace-nowrap text-sm">
                                  -${exp.amount.toLocaleString('es-CO')}
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditExpense(exp)}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/30 font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                      title="Editar descripción, monto, categoría o fecha de este egreso"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Editar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setExpenseToDelete(exp)}
                                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                      title="Eliminar este egreso del historial"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
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
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
              <table className="w-full text-left text-xs min-w-[640px]">
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
      {/* 8. BARBEROS / PERSONAL */}
      {/* ============================================================== */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* New Barber Form Card */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    Ingresar Nuevo Barbero al Equipo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registro directo con liquidación 50/50, disponibilidad en POS y contratos legales
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateBarber} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Nombre Completo del Barbero *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Esteban Pérez"
                    value={newBarberName}
                    onChange={(e) => setNewBarberName(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Cédula / Documento (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 1.020.954.210"
                    value={newBarberCedula}
                    onChange={(e) => setNewBarberCedula(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Teléfono / WhatsApp (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 312 890 1234"
                    value={newBarberPhone}
                    onChange={(e) => setNewBarberPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Especialidades (separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Fade, Barba, Corte Clásico, Diseños"
                  value={newBarberSpecialties}
                  onChange={(e) => setNewBarberSpecialties(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Fade / Degradado', 'Barba & Perfilado', 'Cortes Clásicos', 'Colorimetría', 'Diseños', 'Cejas'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const current = newBarberSpecialties.trim();
                        if (current.includes(chip)) return;
                        setNewBarberSpecialties(current ? `${current}, ${chip}` : chip);
                      }}
                      className="text-[10px] bg-slate-200/70 dark:bg-[#032a48] hover:bg-[#c5a059] hover:text-black text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  El barbero ingresado se sincroniza automáticamente con la nube y estará disponible en el selector de ventas POS.
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ingresar Barbero</span>
                </button>
              </div>
            </form>
          </div>

          {/* Barbers Roster List */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div>
                <h4 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Equipo de Barberos</span>
                  <span className="text-xs bg-[#c5a059]/20 text-[#c5a059] px-2.5 py-0.5 rounded-full font-bold">
                    {barbers.length} registrados
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Gestiona el estado laboral (Activo / De Baja) y vinculación de cada barbero
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Pills */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBarberStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      barberStatusFilter === 'all'
                        ? 'bg-[#c5a059] text-black shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Todos ({barbers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarberStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      barberStatusFilter === 'active'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Activos ({barbers.filter(b => b.active !== false).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarberStatusFilter('inactive')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      barberStatusFilter === 'inactive'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    De Baja ({barbers.filter(b => b.active === false).length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setAddBarberModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Ingresar Barbero</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {barbers
                .filter(b => {
                  if (barberStatusFilter === 'active') return b.active !== false;
                  if (barberStatusFilter === 'inactive') return b.active === false;
                  return true;
                })
                .map((barber) => {
                  const isActive = barber.active !== false;
                  return (
                    <div
                      key={barber.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 shadow-sm transition-all ${
                        isActive
                          ? 'bg-slate-100/90 dark:bg-[#02253f] border-slate-300/80 dark:border-white/20 hover:border-[#c5a059]/40'
                          : 'bg-slate-100/50 dark:bg-[#021f35]/50 border-amber-500/30 opacity-90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-[#c5a059]/20 text-[#c5a059]'
                                : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                            }`}>
                              {barber.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{barber.name}</h5>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {barber.id}</span>
                            </div>
                          </div>

                          {isActive ? (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                              Activo
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                              De Baja (Inactivo)
                            </span>
                          )}
                        </div>

                        {!isActive && (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-medium my-2">
                            Dado de baja del equipo. No recibe nuevas ventas en POS.
                          </div>
                        )}

                        {(barber.phone || barber.cedula) && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mt-2">
                            {barber.cedula && <div>Cédula: {barber.cedula}</div>}
                            {barber.phone && <div>Tel: {barber.phone}</div>}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {barber.specialties.map((spec, i) => (
                            <span key={i} className="text-[10px] bg-white dark:bg-[#031d33] px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 font-medium">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => setBarberToDeactivate(barber)}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                            title="Dar de baja a este barbero (marcar como inactivo sin perder historial)"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Dar de baja</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConfirmReactivateBarber(barber)}
                            className="text-xs text-emerald-700 dark:text-emerald-300 hover:text-white font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 border border-emerald-500/30 transition-all cursor-pointer"
                            title="Reactivar barbero en el equipo y disponible para POS"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reactivar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setBarberToDelete(barber)}
                          className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Eliminar permanentemente del registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK ADD BARBER MODAL (Accessible from any tab in Admin)       */}
      {/* ============================================================== */}
      {addBarberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Ingresar Nuevo Barbero
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alta inmediata en el equipo y disponible en POS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddBarberModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBarber} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Nombre Completo del Barbero *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Julián David Castro"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Cédula / Documento (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 1.020.890.123"
                    value={newBarberCedula}
                    onChange={(e) => setNewBarberCedula(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Teléfono / WhatsApp (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 310 456 7890"
                    value={newBarberPhone}
                    onChange={(e) => setNewBarberPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Especialidades
                </label>
                <input
                  type="text"
                  placeholder="Ej. Fade, Barba, Corte Clásico, Diseños"
                  value={newBarberSpecialties}
                  onChange={(e) => setNewBarberSpecialties(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Fade / Degradado', 'Barba & Perfilado', 'Cortes Clásicos', 'Colorimetría', 'Diseños'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const current = newBarberSpecialties.trim();
                        if (current.includes(chip)) return;
                        setNewBarberSpecialties(current ? `${current}, ${chip}` : chip);
                      }}
                      className="text-[10px] bg-slate-200/70 dark:bg-[#032a48] hover:bg-[#c5a059] hover:text-black text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/25 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-bold text-[#c5a059]">Condición comercial:</span> Esquema oficial de liquidación de comisiones 50/50 sobre servicios realizados y registro automático en contratos y POS.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddBarberModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ingresar Barbero</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PRINTABLE QR CODE MODAL FOR CLIENT CHECK-IN & RATING            */}
      {/* ============================================================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    Código QR de Asistencia y Calificación
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Legado Barber Club · Recepción y Mostrador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Public Domain Success Banner */}
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Enlace Público para Celulares Activo</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    {qrDomainPreset === 'cloud' ? 'Público Cloud (ais-pre)' : qrDomainPreset === 'origin' ? 'Origen Navegador' : 'Personalizado'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-tight">
                  Este código QR genera el enlace público sin restricciones de desarrollador para que tus clientes puedan escanearlo desde cualquier teléfono móvil (Android o iPhone) sin marcar error.
                </p>
              </div>
            </div>

            {/* Printable Graphic Card */}
            <div id="printable-qr-card" className="bg-white text-slate-950 p-5 sm:p-6 rounded-3xl shadow-xl text-center space-y-3.5 border border-slate-200">
              <div className="space-y-1">
                <div className="font-display font-extrabold text-xl tracking-wider text-[#011d32]">
                  LEGADO <span className="text-[#c5a059]">BARBER CLUB</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                  Asistencia & Fidelización Exclusiva
                </div>
              </div>

              {/* Scannable QR Code */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-inner inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(clientPortalUrl)}&bgcolor=ffffff&color=011d32&margin=6`}
                  alt="Código QR de Asistencia y Calificación"
                  className="w-52 h-52 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Escanea con tu celular
                </div>
                <p className="text-[11px] text-slate-600 leading-snug max-w-xs mx-auto">
                  Registra tu visita en caja, califica a tu barbero y acumula visitas para cortes y limpiezas gratis.
                </p>
              </div>

              <div 
                onClick={handleCopyClientLink}
                title="Click para copiar enlace"
                className="pt-2 border-t border-slate-100 text-[11px] font-mono text-[#011d32] bg-slate-50 hover:bg-slate-100 p-2 rounded-xl truncate select-all cursor-pointer transition-colors flex items-center justify-between gap-2"
              >
                <span className="truncate">{clientPortalUrl}</span>
                <span className="text-[10px] text-[#c5a059] font-bold shrink-0">
                  {copiedLink ? '¡Copiado!' : 'Copiar'}
                </span>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyClientLink}
                className="py-2.5 px-2 rounded-xl bg-slate-200/90 dark:bg-slate-800 hover:bg-[#c5a059] hover:text-black text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenClientLink}
                className="py-2.5 px-2 rounded-xl bg-slate-200/90 dark:bg-slate-800 hover:bg-[#c5a059] hover:text-black text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Abrir enlace en pestaña nueva para verificar su funcionamiento"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Probar Enlace</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Compartir enlace con clientes vía WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 px-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                title="Imprimir tarjeta para colocar en recepción"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>

            {/* Domain Configuration Toggle & Section */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 space-y-3">
              <button
                type="button"
                onClick={() => setShowQrSettings(!showQrSettings)}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-[#c5a059] dark:hover:text-[#c5a059] flex items-center gap-1.5 font-bold transition-colors cursor-pointer w-full justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Ajustes de Dominio / URL del Código QR</span>
                </span>
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  {showQrSettings ? 'Ocultar' : 'Configurar'}
                </span>
              </button>

              {showQrSettings && (
                <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-[#02253f] border border-slate-200 dark:border-white/10 space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Selecciona cómo se genera el enlace para los clientes:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveQrPreset('cloud')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        qrDomainPreset === 'cloud'
                          ? 'border-[#c5a059] bg-[#c5a059]/15 text-slate-900 dark:text-white font-bold ring-1 ring-[#c5a059]'
                          : 'border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#c5a059]">
                        <Globe className="w-3 h-3" />
                        <span>Cloud Público</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ais-pre (Recomendado para celulares de clientes)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveQrPreset('origin')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        qrDomainPreset === 'origin'
                          ? 'border-[#c5a059] bg-[#c5a059]/15 text-slate-900 dark:text-white font-bold ring-1 ring-[#c5a059]'
                          : 'border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#c5a059]">
                        <Smartphone className="w-3 h-3" />
                        <span>Navegador Actual</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Dominio exacto donde abres el admin
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveQrPreset('custom')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        qrDomainPreset === 'custom'
                          ? 'border-[#c5a059] bg-[#c5a059]/15 text-slate-900 dark:text-white font-bold ring-1 ring-[#c5a059]'
                          : 'border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#c5a059]">
                        <Edit3 className="w-3 h-3" />
                        <span>Personalizado</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Escribir tu propio dominio web o IP local
                      </div>
                    </button>
                  </div>

                  {qrDomainPreset === 'custom' && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Dominio o URL Base:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customQrDomain}
                          onChange={(e) => setCustomQrDomain(e.target.value)}
                          placeholder="https://legadobarberclub.com"
                          className="flex-1 rounded-xl bg-white dark:bg-[#031d33] border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveQrPreset('custom', customQrDomain)}
                          className="px-3.5 py-2 bg-[#c5a059] text-black font-bold rounded-xl text-xs hover:bg-[#d4af37] transition-all cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Ejemplo: https://legadobarberclub.com o http://192.168.1.100:3000
                      </p>
                    </div>
                  )}

                  {domainFeedbackMsg && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{domainFeedbackMsg}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Informative explanation note */}
              <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Info className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>¿Por qué marcaba error en otros celulares antes?</span>
                </div>
                <p className="leading-relaxed">
                  Los enlaces privados de desarrollo (<code className="font-mono text-slate-800 dark:text-slate-200">ais-dev-</code> o <code className="font-mono text-slate-800 dark:text-slate-200">localhost</code>) exigen credenciales de programador. Ahora, el código QR genera automáticamente el enlace público (<code className="font-mono text-[#c5a059]">ais-pre-</code>) accesible desde cualquier teléfono o navegador externo sin pedir clave.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREAR NUEVO SERVICIO EN EL CATÁLOGO                     */}
      {/* ============================================================== */}
      {addServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Crear Nuevo Servicio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alta en el catálogo oficial de Legado Barber Club
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Ritual Barba Real & Toalla Caliente"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Categoría *
                  </label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as ServiceCategory)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#c5a059] cursor-pointer"
                  >
                    <option value="esenciales">Esenciales</option>
                    <option value="premium">Premium</option>
                    <option value="colorimetria">Colorimetría</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Valor / Tarifa (COP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="35000"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(Number(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Duración (min) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    placeholder="35"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value) || 30)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Descripción Comercial (lo que ve el cliente)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles del procedimiento, productos utilizados y técnica aplicada..."
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#c5a059] resize-none"
                />
              </div>

              {/* Commission Preview 50/50 */}
              <div className="p-3 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/25 text-[11px] space-y-1.5">
                <div className="font-bold text-[#c5a059] flex items-center justify-between">
                  <span>Liquidación Comercial 50/50:</span>
                  <span>${newServicePrice.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>· Barbero comisiona:</span>
                  <span className="font-bold text-amber-500">${Math.round(newServicePrice * 0.5).toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>· Ganancia sede Legado:</span>
                  <span className="font-bold text-blue-500">${Math.round(newServicePrice * 0.5).toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddServiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Servicio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AJUSTE MASIVO DE TARIFAS (+ / -)                        */}
      {/* ============================================================== */}
      {bulkAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Ajuste Masivo de Tarifas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Actualiza simultáneamente varias o todas las tarifas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Categoría a Modificar
                </label>
                <select
                  value={bulkTargetCategory}
                  onChange={(e) => setBulkTargetCategory(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#c5a059] cursor-pointer"
                >
                  <option value="todos">Todos los servicios ({services.length})</option>
                  <option value="esenciales">Solo Esenciales ({services.filter(s => s.category === 'esenciales').length})</option>
                  <option value="premium">Solo Experiencias Premium ({services.filter(s => s.category === 'premium').length})</option>
                  <option value="colorimetria">Solo Colorimetría ({services.filter(s => s.category === 'colorimetria').length})</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Tipo de Modificación
                  </label>
                  <div className="flex gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-[#02253f] border border-slate-300 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setBulkAdjustType('fixed');
                        setBulkAdjustAmount(5000);
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        bulkAdjustType === 'fixed'
                          ? 'bg-[#c5a059] text-black shadow-sm'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Monto Fijo ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkAdjustType('percent');
                        setBulkAdjustAmount(10);
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        bulkAdjustType === 'percent'
                          ? 'bg-[#c5a059] text-black shadow-sm'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Porcentaje (%)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Sentido del Ajuste
                  </label>
                  <div className="flex gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-[#02253f] border border-slate-300 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setBulkAdjustDirection('increase')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        bulkAdjustDirection === 'increase'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      + Aumentar
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkAdjustDirection('decrease')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        bulkAdjustDirection === 'decrease'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      - Rebajar
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {bulkAdjustType === 'fixed' ? 'Valor a Ajustar en Pesos COP' : 'Porcentaje a Ajustar (%)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {bulkAdjustType === 'fixed' ? '$' : '%'}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step={bulkAdjustType === 'fixed' ? 1000 : 1}
                    value={bulkAdjustAmount}
                    onChange={(e) => setBulkAdjustAmount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {bulkAdjustType === 'fixed' ? (
                    [2000, 3000, 5000, 10000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBulkAdjustAmount(val)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-[#c5a059] hover:text-black cursor-pointer transition-colors"
                      >
                        ${val.toLocaleString('es-CO')}
                      </button>
                    ))
                  ) : (
                    [5, 10, 15, 20].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBulkAdjustAmount(val)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-[#c5a059] hover:text-black cursor-pointer transition-colors"
                      >
                        {val}%
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 space-y-2">
                <span className="font-bold text-[11px] text-[#c5a059] uppercase tracking-wider block">
                  Vista Previa del Cambio:
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {services
                    .filter(s => bulkTargetCategory === 'todos' ? true : s.category === bulkTargetCategory)
                    .slice(0, 3)
                    .map((s) => {
                      let previewPrice = s.price;
                      if (bulkAdjustType === 'fixed') {
                        previewPrice = bulkAdjustDirection === 'increase'
                          ? s.price + bulkAdjustAmount
                          : Math.max(0, s.price - bulkAdjustAmount);
                      } else {
                        const factor = bulkAdjustDirection === 'increase' ? (1 + bulkAdjustAmount / 100) : (1 - bulkAdjustAmount / 100);
                        previewPrice = Math.round((s.price * factor) / 1000) * 1000;
                      }
                      return (
                        <div key={s.id} className="flex items-center justify-between py-0.5 border-b border-slate-200/50 dark:border-white/5 last:border-none">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{s.name}</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-slate-400 line-through">${s.price.toLocaleString('es-CO')}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-bold text-[#c5a059]">${previewPrice.toLocaleString('es-CO')}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkAdjust}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Aplicar Ajuste Masivo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MODIFICAR INGRESO / VENTA (VALOR, FECHA Y HORA)         */}
      {/* ============================================================== */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Modificar Ingreso de Venta
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {editingSale.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSale(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSale} className="space-y-4 text-xs">
              {/* Monto del Ingreso */}
              <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Valor Total del Ingreso ($ COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">$</span>
                  <input
                    type="number"
                    required
                    min={1}
                    step={1000}
                    value={editSaleTotal || ''}
                    onChange={(e) => setEditSaleTotal(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white dark:bg-[#011d32] border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                {/* 50/50 Live Recalculation */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
                    <span className="text-amber-600 dark:text-amber-400 font-bold block">Comisión Barbero (50%)</span>
                    <span className="font-bold text-amber-500 text-sm">
                      ${Math.round(editSaleTotal * 0.5).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30">
                    <span className="text-blue-600 dark:text-blue-400 font-bold block">Ganancia Sede (50%)</span>
                    <span className="font-bold text-blue-500 text-sm">
                      ${(editSaleTotal - Math.round(editSaleTotal * 0.5)).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fecha y Hora Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Fecha del Ingreso *
                  </label>
                  <input
                    type="date"
                    required
                    value={editSaleDate}
                    onChange={(e) => setEditSaleDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Hora del Ingreso (HH:mm) *
                  </label>
                  <input
                    type="time"
                    required
                    value={editSaleTime}
                    onChange={(e) => setEditSaleTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Barbero que atendió */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Barbero Responsable del Servicio:
                </label>
                <select
                  value={editSaleBarberId}
                  onChange={(e) => setEditSaleBarberId(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#c5a059] cursor-pointer"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.active === false ? '(De Baja)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Método de pago y Nombre de cliente */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Método de Pago:
                  </label>
                  <select
                    value={editSalePaymentMethod}
                    onChange={(e) => setEditSalePaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#c5a059] cursor-pointer"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Cliente (opcional):
                  </label>
                  <input
                    type="text"
                    value={editSaleClientName}
                    onChange={(e) => setEditSaleClientName(e.target.value)}
                    placeholder="Cliente General"
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Modificación de Ingreso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR ELIMINAR INGRESO DE VENTA                     */}
      {/* ============================================================== */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-[calc(100vw-2rem)] sm:max-w-md liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-rose-500/30 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  ¿Eliminar este registro de venta?
                </h3>
                <span className="font-mono text-xs text-rose-500 font-bold">
                  {saleToDelete.invoiceNumber}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#02253f] border border-slate-200 dark:border-white/10 text-xs space-y-1">
              <div><strong className="text-slate-800 dark:text-slate-200">Fecha:</strong> {saleToDelete.date}</div>
              <div><strong className="text-slate-800 dark:text-slate-200">Barbero:</strong> {saleToDelete.barberName}</div>
              <div><strong className="text-slate-800 dark:text-slate-200">Monto:</strong> ${saleToDelete.total.toLocaleString('es-CO')} COP</div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Esta acción eliminará el registro de la contabilidad y recalculará automáticamente los ingresos totales de la sede.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSale}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR DAR DE BAJA A BARBERO                         */}
      {/* ============================================================== */}
      {barberToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-[calc(100vw-2rem)] sm:max-w-md liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-amber-500/30 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  ¿Dar de baja a {barberToDeactivate.name}?
                </h3>
                <span className="text-xs text-amber-500 font-semibold">
                  Cambio de estado a Inactivo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              El barbero <strong className="text-slate-900 dark:text-white">{barberToDeactivate.name}</strong> pasará a estado <strong>De Baja (Inactivo)</strong>. Ya no aparecerá en las opciones de venta del terminal POS ni en nuevas reservas, pero se mantendrán intactas todas sus comisiones, ventas históricas, contratos y liquidaciones anteriores. Podrás reactivarlo en cualquier momento con un clic.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBarberToDeactivate(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivateBarber}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all cursor-pointer text-xs"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Confirmar y Dar de Baja</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR ELIMINAR DEFINITIVAMENTE A BARBERO           */}
      {/* ============================================================== */}
      {barberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-[calc(100vw-2rem)] sm:max-w-md liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-rose-500/30 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  ¿Eliminar a {barberToDelete.name}?
                </h3>
                <span className="text-xs text-rose-500 font-semibold">
                  Retiro permanente del equipo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Estás seguro de eliminar permanentemente a <strong className="text-slate-900 dark:text-white">{barberToDelete.name}</strong> del catálogo de personal de Legado Barber Club?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBarberToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBarber}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR ELIMINAR SERVICIO DEL CATÁLOGO               */}
      {/* ============================================================== */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-[calc(100vw-2rem)] sm:max-w-md liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-rose-500/30 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  ¿Eliminar este servicio?
                </h3>
                <span className="text-xs text-rose-500 font-semibold">
                  Catálogo Oficial
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#02253f] border border-slate-200 dark:border-white/10 text-xs space-y-1">
              <div><strong className="text-slate-800 dark:text-slate-200">Servicio:</strong> {serviceToDelete.name}</div>
              <div><strong className="text-slate-800 dark:text-slate-200">Tarifa:</strong> ${serviceToDelete.price.toLocaleString('es-CO')} COP</div>
              <div><strong className="text-slate-800 dark:text-slate-200">Duración:</strong> {serviceToDelete.durationMinutes} min</div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              El servicio será eliminado del catálogo de la barbería y ya no aparecerá en el terminal POS ni en el portal de clientes para reservas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteService}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Servicio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR RESTABLECER TARIFAS ORIGINALES               */}
      {/* ============================================================== */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-[calc(100vw-2rem)] sm:max-w-md liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-[#c5a059]/30 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-[#c5a059]">
              <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-[#c5a059]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  ¿Restablecer Tarifas Originales?
                </h3>
                <span className="text-xs text-[#c5a059] font-semibold">
                  Legado Barber Club
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Todas las tarifas actuales del catálogo se restablecerán a los valores estándar de lanzamiento (Corte Legado $30.000, Ritual de Barba $20.000, Limpieza Legado $35.000, etc.).
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPrices}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 transition-all cursor-pointer text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sí, Restablecer Todo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: EDITAR CLIENTE                                        */}
      {/* ============================================================== */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    Editar Datos del Cliente
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ID: {editingClient.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-4 text-xs">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Nombre Completo *</span>
                </label>
                <input
                  type="text"
                  required
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Teléfono y Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Teléfono / WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editClientPhone}
                    onChange={(e) => setEditClientPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={editClientEmail}
                    onChange={(e) => setEditClientEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Visitas & Última Visita */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Visitas Totales Acumuladas *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditClientVisits(Math.max(0, editClientVisits - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-[#02253f] hover:bg-slate-300 dark:hover:bg-[#033457] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-extrabold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editClientVisits}
                      onChange={(e) => setEditClientVisits(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="flex-1 text-center font-display font-extrabold text-sm rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-[#c5a059] py-2 focus:outline-none focus:border-[#c5a059]"
                    />
                    <button
                      type="button"
                      onClick={() => setEditClientVisits(editClientVisits + 1)}
                      className="w-9 h-9 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-extrabold flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Fecha de Última Visita
                  </label>
                  <input
                    type="date"
                    value={editClientLastVisit}
                    onChange={(e) => setEditClientLastVisit(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Rating 10-Stars Slider */}
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#c5a059] fill-[#c5a059]" />
                    <span>Calificación de Servicio (1 a 10)</span>
                  </span>
                  <span className="font-display font-extrabold text-sm text-[#c5a059] bg-[#c5a059]/15 px-2.5 py-0.5 rounded-full border border-[#c5a059]/30">
                    {editClientRating} / 10 ★
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={editClientRating}
                  onChange={(e) => setEditClientRating(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                />
                <div className="flex items-center justify-between pt-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setEditClientRating(starVal)}
                      className="cursor-pointer group p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          starVal <= editClientRating
                            ? 'text-[#c5a059] fill-[#c5a059]'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Beneficios & Recompensas IA Checkboxes */}
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 space-y-2">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  Recompensas Disponibles para Canje:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editClientFreeFacial}
                      onChange={(e) => setEditClientFreeFacial(e.target.checked)}
                      className="rounded accent-[#c5a059] w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">Limpieza Facial Gratis</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Hito cada 5 visitas</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editClientFreeHaircut}
                      onChange={(e) => setEditClientFreeHaircut(e.target.checked)}
                      className="rounded accent-[#c5a059] w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-blue-600 dark:text-blue-400">Corte Gratis</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Hito cada 10 visitas</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Comentarios */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Comentarios, Preferencias o Notas de Servicio
                </label>
                <textarea
                  rows={2}
                  value={editClientComments}
                  onChange={(e) => setEditClientComments(e.target.value)}
                  placeholder="Preferencias de corte, productos favoritos, detalles especiales..."
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingClient;
                    setEditingClient(null);
                    setClientToDelete(toDel);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-500 hover:text-white hover:bg-rose-600 font-bold flex items-center gap-1 transition-all cursor-pointer text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Cliente</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CONFIRMAR ELIMINAR CLIENTE                            */}
      {/* ============================================================== */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-[calc(100vw-2rem)] sm:max-w-md liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-rose-500/30 space-y-5 my-auto max-h-[88vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  ¿Eliminar este cliente?
                </h3>
                <span className="font-bold text-xs text-rose-500">
                  {clientToDelete.clientName}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#02253f] border border-slate-200 dark:border-white/10 text-xs space-y-1.5">
              <div><strong className="text-slate-800 dark:text-slate-200">Teléfono:</strong> {clientToDelete.clientPhone}</div>
              <div><strong className="text-slate-800 dark:text-slate-200">Visitas acumuladas:</strong> {clientToDelete.totalVisits}</div>
              <div><strong className="text-slate-800 dark:text-slate-200">Calificación:</strong> {clientToDelete.rating} / 10 ★</div>
              {clientToDelete.rewards.freeFacialCleaning && (
                <div className="text-emerald-500 font-bold">✓ Tiene Limpieza Facial pendiente</div>
              )}
              {clientToDelete.rewards.freeHaircut && (
                <div className="text-blue-500 font-bold">✓ Tiene Corte Gratis pendiente</div>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Esta acción eliminará el registro permanentemente de la base de datos de Legado Barber Club. Su historial de visitas y carnet QR quedarán inhabilitados.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClient}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Permanentemente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: REGISTRAR NUEVO CLIENTE                               */}
      {/* ============================================================== */}
      {addClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    Registrar Nuevo Cliente
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alta directa en la base de datos de fidelización
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddClientModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Santiago Benítez"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 312 345 6789"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Correo Electrónico (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="santiago@ejemplo.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Visitas Iniciales
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newClientVisits}
                    onChange={(e) => setNewClientVisits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Calificación Inicial (1 a 10)
                  </label>
                  <select
                    value={newClientRating}
                    onChange={(e) => setNewClientRating(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#c5a059] cursor-pointer"
                  >
                    {[10, 9, 8, 7, 6, 5].map((val) => (
                      <option key={val} value={val}>{val} Estrellas ★</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Notas de Preferencia o Servicio (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre su estilo favorito o barbero habitual..."
                  value={newClientComments}
                  onChange={(e) => setNewClientComments(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setAddClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1.5 shadow-lg shadow-[#c5a059]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Dar de Alta Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CARNET QR & MEMBRESÍA DIGITAL DEL CLIENTE             */}
      {/* ============================================================== */}
      {clientQrCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-md liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    Carnet Digital & Validación QR
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ID: {clientQrCard.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClientQrCard(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Graphic Digital Card */}
            <div id="client-printable-card" className="bg-gradient-to-b from-[#011d32] to-[#022846] text-white p-5 rounded-3xl border border-[#c5a059]/40 shadow-xl space-y-3.5 text-center">
              <div className="space-y-0.5">
                <div className="font-display font-black text-lg tracking-wider text-white">
                  LEGADO <span className="text-[#c5a059]">BARBER CLUB</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">
                  Membresía Exclusiva de Fidelización
                </div>
              </div>

              {/* Scannable Client QR */}
              <div className="p-3 bg-white rounded-2xl inline-block shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(clientPortalUrl + '&client=' + clientQrCard.id + '&phone=' + clientQrCard.clientPhone)}&bgcolor=ffffff&color=011d32&margin=4`}
                  alt={`Código QR de ${clientQrCard.clientName}`}
                  className="w-44 h-44 mx-auto object-contain rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="font-display font-bold text-base text-white">
                  {clientQrCard.clientName}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {clientQrCard.clientPhone}
                </div>
              </div>

              {/* Progress & Stats */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Visitas Acumuladas</span>
                  <span className="font-display font-extrabold text-[#c5a059] text-sm">
                    {clientQrCard.totalVisits} visitas
                  </span>
                </div>

                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c5a059] to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((clientQrCard.totalVisits || 1) % 10) * 10)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Próximo beneficio en {5 - (clientQrCard.totalVisits % 5)} visitas</span>
                  <span className="text-[#c5a059] font-semibold">Limpieza / Corte Gratis</span>
                </div>
              </div>

              {/* Unlocked Reward Highlights */}
              {(clientQrCard.rewards.freeFacialCleaning || clientQrCard.rewards.freeHaircut) && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold space-y-1">
                  <div>🎉 ¡Beneficios listos para canjear!</div>
                  <div className="flex flex-wrap justify-center gap-1.5 text-[11px]">
                    {clientQrCard.rewards.freeFacialCleaning && (
                      <span className="bg-emerald-600/60 px-2 py-0.5 rounded-full">Limpieza Facial</span>
                    )}
                    {clientQrCard.rewards.freeHaircut && (
                      <span className="bg-blue-600/60 px-2 py-0.5 rounded-full">Corte Gratis</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Toolbar */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickValidateVisit(clientQrCard)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>+1 Validar Visita</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toEdit = clientQrCard;
                    setClientQrCard(null);
                    handleOpenEditClient(toEdit);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-200/80 dark:bg-[#02253f] hover:bg-slate-300 dark:hover:bg-[#033457] border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-[#c5a059]" />
                  <span>Editar Cliente</span>
                </button>
              </div>

              {/* Canjear buttons if available */}
              {clientQrCard.rewards.freeFacialCleaning && (
                <button
                  type="button"
                  onClick={() => handleRedeemReward(clientQrCard, 'facial')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Canjear Limpieza Facial Gratis</span>
                </button>
              )}

              {clientQrCard.rewards.freeHaircut && (
                <button
                  type="button"
                  onClick={() => handleRedeemReward(clientQrCard, 'corte')}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Canjear Corte Gratis</span>
                </button>
              )}

              {/* Sharing & WhatsApp */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/57${clientQrCard.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${clientQrCard.clientName}! Te compartimos tu carnet digital de fidelización en Legado Barber Club. Cuentas con ${clientQrCard.totalVisits} visitas acumuladas.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const toDel = clientQrCard;
                    setClientQrCard(null);
                    setClientToDelete(toDel);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Registro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: VALIDADOR QR & ESCANEO EN CAJA EN TIEMPO REAL         */}
      {/* ============================================================== */}
      {qrScannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl liquid-glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    Validador QR de Caja en Tiempo Real
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ingresa o escanea el teléfono o código del cliente para registrar visita o canjear
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrScannerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick search / scanner input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Escanear QR o Teclear Celular / Código de Cliente:
              </label>
              <div className="relative">
                <Scan className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5a059]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ej. 312 456 7890 o cli-1 o nombre..."
                  value={qrSearchTerm}
                  onChange={(e) => setQrSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-3 rounded-2xl bg-white dark:bg-[#02253f] border-2 border-[#c5a059]/40 focus:border-[#c5a059] text-slate-900 dark:text-white font-mono text-sm focus:outline-none shadow-sm"
                />
                {qrSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setQrSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results list */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {clients
                .filter(c => {
                  if (!qrSearchTerm.trim()) return true;
                  const q = qrSearchTerm.toLowerCase().trim();
                  return (
                    c.clientName.toLowerCase().includes(q) ||
                    c.clientPhone.toLowerCase().includes(q) ||
                    c.id.toLowerCase().includes(q)
                  );
                })
                .slice(0, 5)
                .map((cli) => {
                  const hasReward = cli.rewards.freeFacialCleaning || cli.rewards.freeHaircut;
                  return (
                    <div
                      key={cli.id}
                      className="p-4 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/15 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {cli.clientName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {cli.clientPhone} · {cli.totalVisits} visitas registradas
                          </div>
                        </div>

                        <span className="font-bold text-xs text-[#c5a059] bg-[#c5a059]/15 px-2.5 py-1 rounded-full border border-[#c5a059]/30">
                          ★ {cli.rating} / 10
                        </span>
                      </div>

                      {/* Reward pills if unlocked */}
                      {hasReward && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {cli.rewards.freeFacialCleaning && (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-xl font-bold">
                              <span>Limpieza Facial Lista</span>
                              <button
                                type="button"
                                onClick={() => handleRedeemReward(cli, 'facial')}
                                className="bg-emerald-600 text-white px-2 py-0.5 rounded-md hover:bg-emerald-500 text-[11px]"
                              >
                                Canjear
                              </button>
                            </div>
                          )}
                          {cli.rewards.freeHaircut && (
                            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-400 px-2.5 py-1 rounded-xl font-bold">
                              <span>Corte Gratis Listo</span>
                              <button
                                type="button"
                                onClick={() => handleRedeemReward(cli, 'corte')}
                                className="bg-blue-600 text-white px-2 py-0.5 rounded-md hover:bg-blue-500 text-[11px]"
                              >
                                Canjear
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setQrScannerModalOpen(false);
                              handleOpenEditClient(cli);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-[#c5a059] hover:text-black transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQrScannerModalOpen(false);
                              setClientToDelete(cli);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/20 transition-colors"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setQrScannerModalOpen(false);
                              setClientQrCard(cli);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-[#c5a059] hover:text-black font-bold flex items-center gap-1 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Ver Carnet</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickValidateVisit(cli)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a059] to-[#9b7b38] text-black font-bold flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>+1 Validar Visita</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {clients.filter(c => {
                if (!qrSearchTerm.trim()) return true;
                const q = qrSearchTerm.toLowerCase().trim();
                return (
                  c.clientName.toLowerCase().includes(q) ||
                  c.clientPhone.toLowerCase().includes(q) ||
                  c.id.toLowerCase().includes(q)
                );
              }).length === 0 && (
                <div className="p-6 text-center text-slate-400 space-y-2">
                  <p className="text-xs">No se encontró ningún cliente con ese teléfono o código.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewClientPhone(qrSearchTerm.replace(/\D/g, ''));
                      setQrScannerModalOpen(false);
                      setAddClientModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#c5a059] text-black rounded-xl font-bold text-xs hover:bg-[#d4af37] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Crear Nuevo Cliente con este número</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDITAR EGRESO REGISTRADO                                */}
      {/* ============================================================== */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-6 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/20 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    Modificar Egreso Registrado
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ID: {editingExpense.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExpense} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Descripción del Gasto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra de toallas, recibo de internet..."
                  value={editExpDescription}
                  onChange={(e) => setEditExpDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Monto ($ COP) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editExpAmount || ''}
                    onChange={(e) => setEditExpAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Categoría *
                  </label>
                  <select
                    value={editExpCategory}
                    onChange={(e) => setEditExpCategory(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#c5a059] cursor-pointer"
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Fecha del Asiento Contable (YYYY-MM-DD) *
                </label>
                <input
                  type="date"
                  required
                  value={editExpDate}
                  onChange={(e) => setEditExpDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/20 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Al guardar los cambios, el balance de egresos y el flujo de caja neto de la barbería se recalcularán de inmediato.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Modificación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONFIRMAR ELIMINACIÓN DE EGRESO                         */}
      {/* ============================================================== */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md liquid-glass-card rounded-3xl p-6 sm:p-7 shadow-2xl relative border border-rose-500/30 space-y-4 my-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  ¿Eliminar este Egreso?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Esta acción revertirá la salida de dinero en la contabilidad
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-[#02253f] border border-slate-300/80 dark:border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fecha:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{expenseToDelete.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Categoría:</span>
                <span className="capitalize font-bold text-[#c5a059]">{expenseToDelete.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Descripción:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {expenseToDelete.description}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="font-bold text-slate-700 dark:text-slate-300">Monto a Descontar:</span>
                <span className="font-display font-extrabold text-base text-rose-500">
                  -${expenseToDelete.amount.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Al confirmar, el monto se sumará de nuevo al Flujo de Caja Neto de Legado Barber Club.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExpense}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Egreso</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
