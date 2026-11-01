import { Service, Barber, InventoryItem, ClientRecord, Sale, Expense, Appointment } from '../types';

export const OFFICIAL_SERVICES: Service[] = [
  // ESENCIALES
  {
    id: 'corte-legado',
    name: 'Corte Legado',
    category: 'esenciales',
    price: 30000,
    durationMinutes: 35,
    description: 'Corte clásico o degradado de precisión, asesoría morfológica y peinado final.'
  },
  {
    id: 'ritual-barba',
    name: 'Ritual de Barba',
    category: 'esenciales',
    price: 20000,
    durationMinutes: 30,
    description: 'Perfilado a navaja, toallas calientes aromáticas y aceites esenciales nutritivos.'
  },
  {
    id: 'corte-infantil',
    name: 'Corte Infantil',
    category: 'esenciales',
    price: 25000,
    durationMinutes: 30,
    description: 'Atención paciente para los más jóvenes, corte moderno y peinado con fijación suave.'
  },
  {
    id: 'limpieza-legado',
    name: 'Limpieza Legado',
    category: 'esenciales',
    price: 35000,
    durationMinutes: 35,
    description: 'Limpieza facial profunda, exfoliación suave, mascarilla purificante y tónico.'
  },
  {
    id: 'perfilado-cejas',
    name: 'Perfilado de Cejas',
    category: 'esenciales',
    price: 12000,
    durationMinutes: 15,
    description: 'Definición sutil con navaja fina y tijera para una mirada limpia y masculina.'
  },
  {
    id: 'legado-glow',
    name: 'Legado Glow',
    category: 'esenciales',
    price: 40000,
    durationMinutes: 40,
    description: 'Tratamiento facial energizante con vapor de ozono y suero revitalizante.'
  },

  // PREMIUM
  {
    id: 'exp-bronce',
    name: 'Experiencia Bronce',
    category: 'premium',
    price: 40000,
    durationMinutes: 45,
    description: 'Corte Legado + Ritual de Toalla Caliente con tónico capilar refrescante.'
  },
  {
    id: 'exp-plata',
    name: 'Experiencia Plata',
    category: 'premium',
    price: 45000,
    durationMinutes: 50,
    description: 'Corte de diseño + Perfilado de barba express y masaje capilar relajante.'
  },
  {
    id: 'exp-oro',
    name: 'Experiencia Oro',
    category: 'premium',
    price: 65000,
    durationMinutes: 65,
    description: 'Corte completo + Ritual completo de barba + Limpieza facial exfoliante con café de cortesía.'
  },
  {
    id: 'exp-legado-vip',
    name: 'Experiencia Legado VIP',
    category: 'premium',
    price: 75000,
    durationMinutes: 80,
    description: 'La experiencia definitiva: Corte, Barba, Mascarilla Negra detox, masaje y bebida premium.'
  },

  // COLORIMETRÍA
  {
    id: 'color-express',
    name: 'Color Express',
    category: 'colorimetria',
    price: 25000,
    durationMinutes: 30,
    description: 'Camuflaje sutil de canas en barba o cabello en 15 minutos sin efecto tinte artificial.'
  },
  {
    id: 'diseno-color-intermedio',
    name: 'Diseño de Color Intermedio',
    category: 'colorimetria',
    price: 90000,
    durationMinutes: 75,
    description: 'Mechas, reflejos texturizados o matización platinada superior.'
  },
  {
    id: 'protocolo-premium-color',
    name: 'Protocolo Premium de Color',
    category: 'colorimetria',
    price: 150000,
    durationMinutes: 120,
    description: 'Decoloración global de alta precisión, platinados nórdicos o fantasía con tratamiento de plex.'
  }
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-john',
    name: 'John',
    active: true,
    specialties: ['Cortes Clásicos', 'Degradados', 'Navaja Libre']
  },
  {
    id: 'barber-orian',
    name: 'Orian',
    active: true,
    specialties: ['Skin Fade', 'Colorimetría', 'Freestyle']
  },
  {
    id: 'barber-david',
    name: 'David',
    active: true,
    specialties: ['Rituales de Barba', 'Tratamientos Faciales', 'Taper Fade']
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Pomada Mate Legado',
    category: 'Fijación',
    price: 35000,
    stock: 14,
    minStockAlert: 5
  },
  {
    id: 'inv-2',
    name: 'Aceite Nutritivo para Barba con Argán',
    category: 'Cuidado Barba',
    price: 28000,
    stock: 8,
    minStockAlert: 5
  },
  {
    id: 'inv-3',
    name: 'Cera Moldeadora Brillo Natural',
    category: 'Fijación',
    price: 30000,
    stock: 3, // LOW STOCK
    minStockAlert: 5
  },
  {
    id: 'inv-4',
    name: 'Bálsamo Aftershave Calmante',
    category: 'Afeitado',
    price: 24000,
    stock: 12,
    minStockAlert: 5
  },
  {
    id: 'inv-5',
    name: 'Champú Anticaída con Biotina',
    category: 'Cuidado Capilar',
    price: 38000,
    stock: 4, // LOW STOCK
    minStockAlert: 5
  }
];

export const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: 'cli-1',
    clientName: 'Carlos Martínez',
    clientEmail: 'carlos.m@example.com',
    clientPhone: '3124567890',
    rating: 10,
    comments: 'Excelente atención de John, el degradado quedó perfecto.',
    lastVisit: '2026-10-28',
    totalVisits: 4, // Proxima visita es la 5 (desbloquea Limpieza Facial Gratis!)
    rewards: {
      freeFacialCleaning: false,
      freeHaircut: false,
      history: []
    }
  },
  {
    id: 'cli-2',
    clientName: 'Andrés Gómez',
    clientEmail: 'andres.g@example.com',
    clientPhone: '3209876543',
    rating: 9,
    comments: 'Gran experiencia con Orian, muy puntual y buen café.',
    lastVisit: '2026-10-25',
    totalVisits: 9, // Proxima visita es la 10 (desbloquea Corte Gratis!)
    rewards: {
      freeFacialCleaning: true, // Ya usó o ganó la de 5
      freeHaircut: false,
      history: ['Limpieza Facial Gratis (Visita 5)']
    }
  },
  {
    id: 'cli-3',
    clientName: 'Felipe Morales',
    clientEmail: 'felipe.m@example.com',
    clientPhone: '3157778899',
    rating: 10,
    comments: 'El ritual de barba de David es el mejor de la ciudad.',
    lastVisit: '2026-10-22',
    totalVisits: 11,
    rewards: {
      freeFacialCleaning: true,
      freeHaircut: true,
      history: ['Limpieza Facial Gratis (Visita 5)', 'Corte Gratis (Visita 10)']
    }
  }
];

export const INITIAL_SALES: Sale[] = [
  // --- HOY: 2026-11-01 (Domingo de alta afluencia con horas pico) ---
  {
    id: 'sale-201',
    invoiceNumber: 'FACT-101',
    date: '2026-11-01 09:30',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[0]], // Corte Legado $30.000
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: false,
    clientName: 'Alejandro Morales'
  },
  {
    id: 'sale-202',
    invoiceNumber: 'FACT-102',
    date: '2026-11-01 10:15',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[1]], // Ritual Barba $20.000
    extraProducts: [],
    subtotal: 20000,
    discountPercent: 0,
    total: 20000,
    paymentMethod: 'transferencia',
    barberCommission: 10000,
    shopGain: 10000,
    isCommissionPaid: false,
    clientName: 'Carlos Montoya'
  },
  {
    id: 'sale-203',
    invoiceNumber: 'FACT-103',
    date: '2026-11-01 11:30',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[3]], // Corte + Barba $45.000
    extraProducts: [{ id: 'ext-p1', name: 'Pomada Mate', price: 35000 }],
    subtotal: 80000,
    discountPercent: 0,
    total: 80000,
    paymentMethod: 'efectivo',
    barberCommission: 22500,
    shopGain: 57500,
    isCommissionPaid: false,
    clientName: 'Santiago Vargas'
  },
  // HORA PICO 14:00 - 16:00
  {
    id: 'sale-204',
    invoiceNumber: 'FACT-104',
    date: '2026-11-01 14:00',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[9]], // Experiencia Legado VIP $75.000
    extraProducts: [],
    subtotal: 75000,
    discountPercent: 0,
    total: 75000,
    paymentMethod: 'efectivo',
    barberCommission: 37500,
    shopGain: 37500,
    isCommissionPaid: false,
    clientName: 'Andrés Gil'
  },
  {
    id: 'sale-205',
    invoiceNumber: 'FACT-105',
    date: '2026-11-01 14:45',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[0]], // Corte Legado $30.000
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: false,
    clientName: 'Nicolás Ospina'
  },
  {
    id: 'sale-206',
    invoiceNumber: 'FACT-106',
    date: '2026-11-01 15:15',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[4]], // Limpieza Facial $35.000
    extraProducts: [{ id: 'ext-p2', name: 'Aceite Barba', price: 28000 }],
    subtotal: 63000,
    discountPercent: 0,
    total: 63000,
    paymentMethod: 'transferencia',
    barberCommission: 17500,
    shopGain: 45500,
    isCommissionPaid: false,
    clientName: 'Felipe Morales'
  },
  {
    id: 'sale-207',
    invoiceNumber: 'FACT-107',
    date: '2026-11-01 16:30',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[3]], // Corte + Barba $45.000
    extraProducts: [],
    subtotal: 45000,
    discountPercent: 0,
    total: 45000,
    paymentMethod: 'efectivo',
    barberCommission: 22500,
    shopGain: 22500,
    isCommissionPaid: false,
    clientName: 'Esteban Quintero'
  },
  {
    id: 'sale-208',
    invoiceNumber: 'FACT-108',
    date: '2026-11-01 17:45',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[0]], // Corte Legado $30.000
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'transferencia',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: false,
    clientName: 'Daniel Cifuentes'
  },
  {
    id: 'sale-209',
    invoiceNumber: 'FACT-109',
    date: '2026-11-01 19:00',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[1]], // Ritual Barba $20.000
    extraProducts: [],
    subtotal: 20000,
    discountPercent: 0,
    total: 20000,
    paymentMethod: 'efectivo',
    barberCommission: 10000,
    shopGain: 10000,
    isCommissionPaid: false,
    clientName: 'Camilo Jaramillo'
  },

  // --- AYER / SÁBADO: 2026-10-31 (Día pico de la semana) ---
  {
    id: 'sale-150',
    invoiceNumber: 'FACT-090',
    date: '2026-10-31 10:00',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[0]],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: true,
    clientName: 'Manuel Santos'
  },
  {
    id: 'sale-151',
    invoiceNumber: 'FACT-091',
    date: '2026-10-31 11:30',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[9]], // VIP $75.000
    extraProducts: [],
    subtotal: 75000,
    discountPercent: 0,
    total: 75000,
    paymentMethod: 'efectivo',
    barberCommission: 37500,
    shopGain: 37500,
    isCommissionPaid: true,
    clientName: 'Guillermo Duque'
  },
  {
    id: 'sale-152',
    invoiceNumber: 'FACT-092',
    date: '2026-10-31 14:00',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[3]],
    extraProducts: [{ id: 'ext-p3', name: 'Cera Fijación', price: 30000 }],
    subtotal: 75000,
    discountPercent: 0,
    total: 75000,
    paymentMethod: 'efectivo',
    barberCommission: 22500,
    shopGain: 52500,
    isCommissionPaid: true,
    clientName: 'Samuel Restrepo'
  },
  {
    id: 'sale-153',
    invoiceNumber: 'FACT-093',
    date: '2026-10-31 15:30',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[3]],
    extraProducts: [],
    subtotal: 45000,
    discountPercent: 0,
    total: 45000,
    paymentMethod: 'transferencia',
    barberCommission: 22500,
    shopGain: 22500,
    isCommissionPaid: true,
    clientName: 'Rodrigo Gómez'
  },
  {
    id: 'sale-154',
    invoiceNumber: 'FACT-094',
    date: '2026-10-31 17:00',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[0]],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: true,
    clientName: 'Tomás Herrera'
  },

  // --- VIERNES: 2026-10-30 ---
  {
    id: 'sale-140',
    invoiceNumber: 'FACT-080',
    date: '2026-10-30 11:00',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[0]],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: true,
    clientName: 'Julián Castro'
  },
  {
    id: 'sale-141',
    invoiceNumber: 'FACT-081',
    date: '2026-10-30 15:00',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[3]],
    extraProducts: [],
    subtotal: 45000,
    discountPercent: 0,
    total: 45000,
    paymentMethod: 'transferencia',
    barberCommission: 22500,
    shopGain: 22500,
    isCommissionPaid: true,
    clientName: 'Sebastián Posada'
  },
  {
    id: 'sale-142',
    invoiceNumber: 'FACT-082',
    date: '2026-10-30 16:30',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[9]],
    extraProducts: [],
    subtotal: 75000,
    discountPercent: 0,
    total: 75000,
    paymentMethod: 'efectivo',
    barberCommission: 37500,
    shopGain: 37500,
    isCommissionPaid: true,
    clientName: 'Ignacio Ruiz'
  },

  // --- JUEVES: 2026-10-29 ---
  {
    id: 'sale-101',
    invoiceNumber: 'FACT-001',
    date: '2026-10-29 09:30',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[0]],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: false,
    clientName: 'Mateo Rojas'
  },
  {
    id: 'sale-102',
    invoiceNumber: 'FACT-002',
    date: '2026-10-29 10:15',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[9]],
    extraProducts: [{ id: 'ext-1', name: 'Pomada Mate', price: 35000 }],
    subtotal: 110000,
    discountPercent: 0,
    total: 110000,
    paymentMethod: 'transferencia',
    barberCommission: 37500,
    shopGain: 72500,
    isCommissionPaid: false,
    clientName: 'Daniel Cifuentes'
  },

  // --- MIÉRCOLES: 2026-10-28 ---
  {
    id: 'sale-103',
    invoiceNumber: 'FACT-003',
    date: '2026-10-28 16:40',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[1]],
    extraProducts: [],
    subtotal: 20000,
    discountPercent: 0,
    total: 20000,
    paymentMethod: 'efectivo',
    barberCommission: 10000,
    shopGain: 10000,
    isCommissionPaid: true,
    clientName: 'Samuel Restrepo'
  },
  {
    id: 'sale-104',
    invoiceNumber: 'FACT-004',
    date: '2026-10-28 14:10',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[0]],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: true,
    clientName: 'Gabriel Velez'
  },

  // --- MARTES: 2026-10-27 ---
  {
    id: 'sale-105',
    invoiceNumber: 'FACT-005',
    date: '2026-10-27 15:20',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[3]],
    extraProducts: [],
    subtotal: 45000,
    discountPercent: 0,
    total: 45000,
    paymentMethod: 'transferencia',
    barberCommission: 22500,
    shopGain: 22500,
    isCommissionPaid: true,
    clientName: 'Lucas Correa'
  },

  // --- LUNES: 2026-10-26 ---
  {
    id: 'sale-106',
    invoiceNumber: 'FACT-006',
    date: '2026-10-26 12:30',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[0]],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: true,
    clientName: 'Esteban Pino'
  },

  // --- HISTÓRICOS MESES ANTERIORES DE 2026 (Para gráfico anual) ---
  // Septiembre 2026
  {
    id: 'sale-hist-09-1',
    invoiceNumber: 'FACT-SEP-01',
    date: '2026-09-15 15:00',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[9]],
    extraProducts: [],
    subtotal: 75000,
    discountPercent: 0,
    total: 75000,
    paymentMethod: 'efectivo',
    barberCommission: 37500,
    shopGain: 37500,
    isCommissionPaid: true,
    clientName: 'Cliente General'
  },
  {
    id: 'sale-hist-09-2',
    invoiceNumber: 'FACT-SEP-02',
    date: '2026-09-20 16:30',
    barberId: 'barber-orian',
    barberName: 'Orian',
    selectedServices: [OFFICIAL_SERVICES[3]],
    extraProducts: [],
    subtotal: 45000,
    discountPercent: 0,
    total: 45000,
    paymentMethod: 'transferencia',
    barberCommission: 22500,
    shopGain: 22500,
    isCommissionPaid: true,
    clientName: 'Cliente General'
  },
  // Agosto 2026
  {
    id: 'sale-hist-08-1',
    invoiceNumber: 'FACT-AGO-01',
    date: '2026-08-18 14:00',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [OFFICIAL_SERVICES[0]],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000,
    shopGain: 15000,
    isCommissionPaid: true,
    clientName: 'Cliente General'
  },
  // Julio 2026
  {
    id: 'sale-hist-07-1',
    invoiceNumber: 'FACT-JUL-01',
    date: '2026-07-12 11:30',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [OFFICIAL_SERVICES[3]],
    extraProducts: [],
    subtotal: 45000,
    discountPercent: 0,
    total: 45000,
    paymentMethod: 'transferencia',
    barberCommission: 22500,
    shopGain: 22500,
    isCommissionPaid: true,
    clientName: 'Cliente General'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-10-25',
    description: 'Compra de toallas de microfibra y navajas descartables',
    amount: 140000,
    category: 'insumos'
  },
  {
    id: 'exp-2',
    date: '2026-10-27',
    description: 'Pago servicio de internet de alta velocidad local',
    amount: 85000,
    category: 'servicios'
  },
  {
    id: 'exp-3',
    date: '2026-10-20',
    description: 'Campaña publicitaria en Instagram y TikTok',
    amount: 120000,
    category: 'publicidad'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-201',
    bookingCode: 'LEG-771',
    clientName: 'Alejandro Morales',
    clientPhone: '3118901234',
    serviceId: 'corte-legado',
    serviceName: 'Corte Legado',
    barberId: 'barber-john',
    barberName: 'John',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '14:00',
    price: 30000,
    status: 'confirmada',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt-202',
    bookingCode: 'LEG-772',
    clientName: 'Santiago Vargas',
    clientPhone: '3156789012',
    serviceId: 'exp-legado-vip',
    serviceName: 'Experiencia Legado VIP',
    barberId: 'barber-orian',
    barberName: 'Orian',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '15:30',
    price: 75000,
    status: 'confirmada',
    createdAt: new Date().toISOString()
  },
  {
    id: 'apt-203',
    bookingCode: 'LEG-773',
    clientName: 'Esteban Quintero',
    clientPhone: '3189990011',
    serviceId: 'ritual-barba',
    serviceName: 'Ritual de Barba',
    barberId: 'barber-david',
    barberName: 'David',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '16:45',
    price: 20000,
    status: 'confirmada',
    createdAt: new Date().toISOString()
  }
];

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=61590237701835',
  instagram: 'https://www.instagram.com/legado_barberclub/',
  tiktok: 'https://www.tiktok.com/@legado_barberclub?_r=1&_t=ZS-9B1AAxU6gJ2'
};

export const TIME_SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '12:00', '12:45',
  '14:00', '14:45', '15:30', '16:15', '17:00', '17:45',
  '18:30', '19:15', '20:00'
];

export const BARBERSHOP_PINS = {
  barberos: '2346',
  admin: '3546'
};
