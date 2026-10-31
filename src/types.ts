export type ServiceCategory = 'esenciales' | 'premium' | 'colorimetria';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  description: string;
}

export interface Barber {
  id: string;
  name: string;
  active: boolean;
  specialties: string[];
  phone?: string;
  cedula?: string;
}

export interface ClientRecord {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  rating: number; // 1 to 10
  comments: string;
  lastVisit: string;
  totalVisits: number;
  rewards: {
    freeFacialCleaning: boolean; // Unlocks every 5 visits
    freeHaircut: boolean; // Unlocks every 10 visits
    history: string[];
  };
}

export interface Appointment {
  id: string;
  bookingCode: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  price: number;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  createdAt: string;
}

export interface SaleItemExtra {
  id: string;
  name: string;
  price: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD HH:mm
  barberId: string;
  barberName: string;
  selectedServices: Service[];
  extraProducts: SaleItemExtra[];
  subtotal: number;
  discountPercent: 0 | 25 | 50;
  total: number;
  paymentMethod: 'efectivo' | 'transferencia';
  barberCommission: number; // 50%
  shopGain: number; // 50%
  isCommissionPaid: boolean;
  clientName?: string;
}

export type ExpenseCategory = 
  | 'alquiler' 
  | 'insumos' 
  | 'servicios' 
  | 'sueldos' 
  | 'publicidad' 
  | 'mantenimiento' 
  | 'otros';

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStockAlert: number;
}

export interface PromotionBroadcast {
  id: string;
  date: string;
  title: string;
  message: string;
  recipientsCount: number;
}

export interface BarberLiquidation {
  id: string;
  voucherNumber: string;
  barberId: string;
  barberName: string;
  barberPhone?: string;
  date: string;
  totalServicesCount: number;
  totalEarnedCommission: number;
  deductionAmount: number;
  deductionReason?: string;
  netPaidAmount: number;
  paymentMethod: 'efectivo' | 'transferencia';
  notes?: string;
  adminSignature?: string;
  barberSignature?: string;
  status: 'completada' | 'pendiente_firma';
  saleIds: string[];
}

export interface BarberContract {
  id: string;
  contractNumber: string;
  barberId: string;
  barberName: string;
  barberCedula: string;
  barberPhone: string;
  barberAddress: string;
  percentageCut: number; // e.g. 50%
  startDate: string;
  noticeDays: number; // 20 days
  termsAccepted: boolean;
  barberSignature?: string;
  adminSignature?: string;
  status: 'activo' | 'finalizado';
}

export type ActiveTheme = 'light' | 'dark' | 'system';
export type ActivePanel = 'home' | 'clientes' | 'barberos' | 'admin';
