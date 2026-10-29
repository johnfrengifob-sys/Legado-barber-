import React, { useState, useEffect } from 'react';
import { 
  OFFICIAL_SERVICES, 
  INITIAL_BARBERS, 
  INITIAL_CLIENTS, 
  INITIAL_SALES, 
  INITIAL_EXPENSES, 
  INITIAL_INVENTORY, 
  INITIAL_APPOINTMENTS,
  BARBERSHOP_PINS
} from './data/mockData';
import { 
  Service, Barber, ClientRecord, Sale, Expense, InventoryItem, 
  PromotionBroadcast, Appointment, ActiveTheme, ActivePanel 
} from './types';
import { TopNav } from './components/TopNav';
import { HomePortal } from './components/HomePortal';
import { PinModal } from './components/PinModal';
import { ClientPortal } from './components/ClientPortal';
import { BarberPanel } from './components/BarberPanel';
import { AdminPanel } from './components/AdminPanel';
import {
  seedFirestoreIfEmpty,
  subscribeToBarbers,
  saveBarberToFirestore,
  deleteBarberFromFirestore,
  subscribeToClients,
  saveClientToFirestore,
  subscribeToAppointments,
  saveAppointmentToFirestore,
  subscribeToSales,
  saveSaleToFirestore,
  subscribeToExpenses,
  saveExpenseToFirestore,
  subscribeToInventory,
  saveInventoryItemToFirestore,
  subscribeToPromotions,
  savePromotionToFirestore,
  subscribeToAuth,
  logoutUser
} from './services/firebaseService';

export default function App() {
  // Theme State (light, dark, system)
  const [theme, setTheme] = useState<ActiveTheme>(() => {
    const saved = localStorage.getItem('legado_theme') as ActiveTheme;
    return saved || 'system';
  });

  // Current Active Panel (home, clientes, barberos, admin)
  const [currentPanel, setCurrentPanel] = useState<ActivePanel>('home');

  // PIN Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinTarget, setPinTarget] = useState<'barberos' | 'admin'>('barberos');

  // Firebase auth & cloud state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(true);

  // Persistent Business State in localStorage & Firebase
  const [services] = useState<Service[]>(OFFICIAL_SERVICES);

  const [barbers, setBarbers] = useState<Barber[]>(() => {
    const saved = localStorage.getItem('legado_barbers_v2');
    return saved ? JSON.parse(saved) : INITIAL_BARBERS;
  });

  const [clients, setClients] = useState<ClientRecord[]>(() => {
    const saved = localStorage.getItem('legado_clients_v2');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('legado_sales_v2');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('legado_expenses_v2');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('legado_inventory_v2');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('legado_appointments_v2');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [promotions, setPromotions] = useState<PromotionBroadcast[]>(() => {
    const saved = localStorage.getItem('legado_promotions_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize and Seed Firestore if first startup
  useEffect(() => {
    seedFirestoreIfEmpty();
  }, []);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUserEmail(user?.email || null);
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to Firebase Firestore Collections in Real-Time
  useEffect(() => {
    try {
      const unsubBarbers = subscribeToBarbers((data) => {
        setBarbers(data);
        setIsCloudSynced(true);
      });
      const unsubClients = subscribeToClients((data) => {
        setClients(data);
        setIsCloudSynced(true);
      });
      const unsubAppts = subscribeToAppointments((data) => {
        setAppointments(data);
        setIsCloudSynced(true);
      });
      const unsubSales = subscribeToSales((data) => {
        setSales(data);
        setIsCloudSynced(true);
      });
      const unsubExpenses = subscribeToExpenses((data) => {
        setExpenses(data);
        setIsCloudSynced(true);
      });
      const unsubInventory = subscribeToInventory((data) => {
        setInventory(data);
        setIsCloudSynced(true);
      });
      const unsubPromotions = subscribeToPromotions((data) => {
        setPromotions(data);
        setIsCloudSynced(true);
      });

      return () => {
        unsubBarbers();
        unsubClients();
        unsubAppts();
        unsubSales();
        unsubExpenses();
        unsubInventory();
        unsubPromotions();
      };
    } catch (e) {
      console.warn('Real-time Firestore listeners running in local mode:', e);
      setIsCloudSynced(false);
    }
  }, []);

  // Theme Sync effect (support Light, Dark, System)
  useEffect(() => {
    localStorage.setItem('legado_theme', theme);
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        document.body.style.backgroundColor = '#011d32';
        document.body.style.color = '#f8fafc';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  // Sync state to localStorage as offline cache
  useEffect(() => {
    localStorage.setItem('legado_barbers_v2', JSON.stringify(barbers));
  }, [barbers]);

  useEffect(() => {
    localStorage.setItem('legado_clients_v2', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('legado_sales_v2', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('legado_expenses_v2', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('legado_inventory_v2', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('legado_appointments_v2', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('legado_promotions_v2', JSON.stringify(promotions));
  }, [promotions]);

  // PIN Access Handlers
  const handleOpenPin = (target: 'barberos' | 'admin') => {
    setPinTarget(target);
    setPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setPinModalOpen(false);
    setCurrentPanel(pinTarget);
  };

  // AI Loyalty & QR Check-in Engine
  const handleRegisterVisit = (clientData: {
    name: string;
    email: string;
    phone: string;
    rating: number;
    comments: string;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const cleanPhone = clientData.phone.replace(/\D/g, '');

    // Check if client exists
    const existingIndex = clients.findIndex(c => 
      c.clientPhone.replace(/\D/g, '') === cleanPhone || 
      (c.clientEmail && c.clientEmail.toLowerCase() === clientData.email.toLowerCase())
    );

    let updatedClient: ClientRecord;
    let rewardUnlocked: string | null = null;

    if (existingIndex !== -1) {
      const existing = clients[existingIndex];
      const newTotalVisits = existing.totalVisits + 1;
      const history = [...existing.rewards.history];
      let freeFacialCleaning = existing.rewards.freeFacialCleaning;
      let freeHaircut = existing.rewards.freeHaircut;

      // AI Rules:
      // Cada 5 visitas: Limpieza Facial Gratis
      // Cada 10 visitas: Corte Gratis (alternando beneficios)
      if (newTotalVisits % 10 === 0) {
        rewardUnlocked = `🎉 ¡CORTE GRATIS DESBLOQUEADO (Visita #${newTotalVisits})!`;
        freeHaircut = true;
        history.push(`Corte Gratis (Visita ${newTotalVisits})`);
      } else if (newTotalVisits % 5 === 0) {
        rewardUnlocked = `✨ ¡LIMPIEZA FACIAL GRATIS DESBLOQUEADA (Visita #${newTotalVisits})!`;
        freeFacialCleaning = true;
        history.push(`Limpieza Facial Gratis (Visita ${newTotalVisits})`);
      }

      updatedClient = {
        ...existing,
        clientName: clientData.name,
        clientEmail: clientData.email || existing.clientEmail,
        rating: clientData.rating,
        comments: clientData.comments || existing.comments,
        lastVisit: today,
        totalVisits: newTotalVisits,
        rewards: {
          freeFacialCleaning,
          freeHaircut,
          history
        }
      };

      setClients(prev => {
        const next = [...prev];
        next[existingIndex] = updatedClient;
        return next;
      });
    } else {
      // New Client
      const newTotalVisits = 1;
      updatedClient = {
        id: `cli-${Date.now()}`,
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        rating: clientData.rating,
        comments: clientData.comments,
        lastVisit: today,
        totalVisits: newTotalVisits,
        rewards: {
          freeFacialCleaning: false,
          freeHaircut: false,
          history: []
        }
      };

      setClients(prev => [updatedClient, ...prev]);
    }

    // Save to Firestore
    saveClientToFirestore(updatedClient).catch((err) => {
      console.warn('Could not sync client to Firestore:', err);
    });

    return { updatedClient, rewardUnlocked };
  };

  // Appointments Handlers
  const handleBookAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
    saveAppointmentToFirestore(apt).catch((err) => {
      console.warn('Could not sync appointment to Firestore:', err);
    });
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, status: Appointment['status']) => {
    setAppointments(prev => {
      const updatedList = prev.map(apt => (apt.id === appointmentId ? { ...apt, status } : apt));
      const targetApt = updatedList.find(a => a.id === appointmentId);
      if (targetApt) {
        saveAppointmentToFirestore(targetApt).catch(console.warn);
      }
      return updatedList;
    });
  };

  // Sales (POS) Handlers
  const handleAddSale = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
    saveSaleToFirestore(sale).catch((err) => {
      console.warn('Could not sync sale to Firestore:', err);
    });

    // Optional inventory decrement for products in sale
    if (sale.extraProducts.length > 0) {
      setInventory(prev =>
        prev.map(item => {
          const matched = sale.extraProducts.find(
            e => e.name.toLowerCase().includes(item.name.toLowerCase()) || 
                 item.name.toLowerCase().includes(e.name.toLowerCase())
          );
          if (matched) {
            const updatedItem = { ...item, stock: Math.max(0, item.stock - 1) };
            saveInventoryItemToFirestore(updatedItem).catch(console.warn);
            return updatedItem;
          }
          return item;
        })
      );
    }
  };

  // Expenses Handlers
  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    saveExpenseToFirestore(expense).catch((err) => {
      console.warn('Could not sync expense to Firestore:', err);
    });
  };

  // Settle Barber Commissions
  const handleSettleBarberCommissions = (barberId: string) => {
    setSales(prev => {
      const updatedSales = prev.map(s => {
        if (s.barberId === barberId) {
          const settled = { ...s, isCommissionPaid: true };
          saveSaleToFirestore(settled).catch(console.warn);
          return settled;
        }
        return s;
      });
      return updatedSales;
    });
  };

  // Promotion Broadcast Handlers
  const handleSendBroadcast = (broadcast: PromotionBroadcast) => {
    setPromotions(prev => [broadcast, ...prev]);
    savePromotionToFirestore(broadcast).catch((err) => {
      console.warn('Could not sync promotion to Firestore:', err);
    });
  };

  // Inventory Handlers
  const handleUpdateInventoryStock = (itemId: string, newStock: number) => {
    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const next = { ...item, stock: newStock };
          saveInventoryItemToFirestore(next).catch(console.warn);
          return next;
        }
        return item;
      });
      return updated;
    });
  };

  const handleAddInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
    saveInventoryItemToFirestore(item).catch((err) => {
      console.warn('Could not sync inventory to Firestore:', err);
    });
  };

  // Barbers Management Handlers
  const handleAddBarber = (newBarber: Barber) => {
    setBarbers(prev => [...prev, newBarber]);
    saveBarberToFirestore(newBarber).catch((err) => {
      console.warn('Could not sync barber to Firestore:', err);
    });
  };

  const handleDeleteBarber = (barberId: string) => {
    setBarbers(prev => prev.filter(b => b.id !== barberId));
    deleteBarberFromFirestore(barberId).catch((err) => {
      console.warn('Could not delete barber from Firestore:', err);
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Top Navbar with Logo, Breadcrumbs, Theme Switcher and Firebase status */}
      <TopNav
        currentPanel={currentPanel}
        onNavigateHome={() => setCurrentPanel('home')}
        activeTheme={theme}
        onChangeTheme={setTheme}
        isCloudSynced={isCloudSynced}
        currentUserEmail={currentUserEmail}
        onLogout={logoutUser}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPanel === 'home' && (
          <HomePortal
            onSelectClients={() => setCurrentPanel('clientes')}
            onSelectBarbers={() => handleOpenPin('barberos')}
            onSelectAdmin={() => handleOpenPin('admin')}
          />
        )}

        {currentPanel === 'clientes' && (
          <ClientPortal
            services={services}
            barbers={barbers}
            clients={clients}
            onRegisterVisit={handleRegisterVisit}
            onBookAppointment={handleBookAppointment}
          />
        )}

        {currentPanel === 'barberos' && (
          <BarberPanel
            barbers={barbers}
            sales={sales}
            appointments={appointments}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          />
        )}

        {currentPanel === 'admin' && (
          <AdminPanel
            services={services}
            barbers={barbers}
            clients={clients}
            sales={sales}
            expenses={expenses}
            inventory={inventory}
            promotions={promotions}
            onAddSale={handleAddSale}
            onAddExpense={handleAddExpense}
            onSettleBarberCommissions={handleSettleBarberCommissions}
            onSendBroadcast={handleSendBroadcast}
            onUpdateInventoryStock={handleUpdateInventoryStock}
            onAddInventoryItem={handleAddInventoryItem}
            onAddBarber={handleAddBarber}
            onDeleteBarber={handleDeleteBarber}
          />
        )}
      </main>

      {/* Secure PIN Keypad Modal (PIN Barberos: 2346 | PIN Admin: 3546) with Google Auth */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        targetPin={pinTarget === 'barberos' ? BARBERSHOP_PINS.barberos : BARBERSHOP_PINS.admin}
        panelTitle={pinTarget === 'barberos' ? 'Panel Barberos' : 'Panel Administrador'}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
}
