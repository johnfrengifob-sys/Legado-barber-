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
  {
    id: 'sale-101',
    invoiceNumber: 'FACT-001',
    date: '2026-10-29 09:30',
    barberId: 'barber-john',
    barberName: 'John',
    selectedServices: [
      OFFICIAL_SERVICES[0] // Corte Legado ($30.000)
    ],
    extraProducts: [],
    subtotal: 30000,
    discountPercent: 0,
    total: 30000,
    paymentMethod: 'efectivo',
    barberCommission: 15000, // 50%
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
    selectedServices: [
      OFFICIAL_SERVICES[9] // Experiencia Legado VIP ($75.000)
    ],
    extraProducts: [
      { id: 'ext-1', name: 'Pomada Mate', price: 35000 }
    ],
    subtotal: 110000,
    discountPercent: 0,
    total: 110000,
    paymentMethod: 'transferencia',
    barberCommission: 37500, // 50% de $75.000
    shopGain: 72500, // 50% de servicio ($37.500) + producto ($35.000)
    isCommissionPaid: false,
    clientName: 'Daniel Cifuentes'
  },
  {
    id: 'sale-103',
    invoiceNumber: 'FACT-003',
    date: '2026-10-28 16:40',
    barberId: 'barber-david',
    barberName: 'David',
    selectedServices: [
      OFFICIAL_SERVICES[1] // Ritual de Barba ($20.000)
    ],
    extraProducts: [],
    subtotal: 20000,
    discountPercent: 0,
    total: 20000,
    paymentMethod: 'efectivo',
    barberCommission: 10000,
    shopGain: 10000,
    isCommissionPaid: true, // already paid
    clientName: 'Samuel Restrepo'
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
  facebook: 'https://facebook.com/legadobarberclub',
  instagram: 'https://instagram.com/legadobarberclub',
  tiktok: 'https://tiktok.com/@legadobarberclub'
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
