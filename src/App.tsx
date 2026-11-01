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
  PromotionBroadcast, Appointment, ActiveTheme, ActivePanel,
  BarberLiquidation, BarberContract, PriceChangeRecord 
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
  deleteClientFromFirestore,
  subscribeToAppointments,
  saveAppointmentToFirestore,
  subscribeToSales,
  saveSaleToFirestore,
  subscribeToExpenses,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  subscribeToInventory,
  saveInventoryItemToFirestore,
  subscribeToPromotions,
  savePromotionToFirestore,
  subscribeToLiquidations,
  saveLiquidationToFirestore,
  subscribeToContracts,
  saveContractToFirestore,
  deleteContractFromFirestore,
  subscribeToServices,
  saveServiceToFirestore,
  deleteServiceFromFirestore,
  subscribeToPriceChanges,
  savePriceChangeToFirestore,
  deleteSaleFromFirestore,
  subscribeToAuth,
  logoutUser
} from './services/firebaseService';

export default function App() {
  // Theme State (light, dark, system)
  const [theme, setTheme] = useState<ActiveTheme>(() => {
    const saved = localStorage.getItem('legado_theme') as ActiveTheme;
    return saved || 'system';
  });

  // Helper to determine initial panel from URL
  const getPanelFromUrl = (): ActivePanel => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const requested = (params.get('panel') || params.get('view') || params.get('portal'))?.toLowerCase();
      if (requested === 'clientes' || params.has('asistencia') || params.has('qr')) {
        return 'clientes';
      }
      if (requested === 'barberos') return 'barberos';
      if (requested === 'admin') return 'admin';
      
      const hash = window.location.hash.toLowerCase();
      if (hash === '#qr' || hash === '#clientes' || hash === '#asistencia') {
        return 'clientes';
      }
      if (hash === '#barberos') return 'barberos';
      if (hash === '#admin') return 'admin';
    }
    return 'home';
  };

  // Current Active Panel (home, clientes, barberos, admin) with URL param support for QR link
  const [currentPanel, setCurrentPanel] = useState<ActivePanel>(() => getPanelFromUrl());

  // URL Sync for direct QR code link & navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const resolved = getPanelFromUrl();
      setCurrentPanel(resolved);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToPanel = (panel: ActivePanel) => {
    setCurrentPanel(panel);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (panel === 'home') {
        url.searchParams.delete('panel');
        url.hash = '';
      } else {
        url.searchParams.set('panel', panel);
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  // PIN Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinTarget, setPinTarget] = useState<'barberos' | 'admin'>('barberos');

  // Firebase auth & cloud state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(true);

  // Persistent Business State in localStorage & Firebase
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('legado_services_v2');
    return saved ? JSON.parse(saved) : OFFICIAL_SERVICES;
  });

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= INITIAL_SALES.length) {
            return parsed;
          }
          // Merge missing initial sales by ID
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const additions = INITIAL_SALES.filter(s => !existingIds.has(s.id));
          return [...parsed, ...additions];
        }
      } catch (e) {
        console.error('Error parsing sales from storage:', e);
      }
    }
    return INITIAL_SALES;
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

  const [liquidations, setLiquidations] = useState<BarberLiquidation[]>(() => {
    const saved = localStorage.getItem('legado_liquidations_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [contracts, setContracts] = useState<BarberContract[]>(() => {
    const saved = localStorage.getItem('legado_contracts_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [priceChanges, setPriceChanges] = useState<PriceChangeRecord[]>(() => {
    const saved = localStorage.getItem('legado_price_changes_v1');
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
      const unsubLiquidations = subscribeToLiquidations((data) => {
        setLiquidations(data);
        setIsCloudSynced(true);
      });
      const unsubContracts = subscribeToContracts((data) => {
        setContracts(data);
        setIsCloudSynced(true);
      });
      const unsubServices = subscribeToServices((data) => {
        if (data && data.length > 0) {
          setServices(data);
          setIsCloudSynced(true);
        }
      });
      const unsubPriceChanges = subscribeToPriceChanges((data) => {
        if (data) {
          setPriceChanges(data);
          setIsCloudSynced(true);
        }
      });

      return () => {
        unsubBarbers();
        unsubClients();
        unsubAppts();
        unsubSales();
        unsubExpenses();
        unsubInventory();
        unsubPromotions();
        unsubLiquidations();
        unsubContracts();
        unsubServices();
        unsubPriceChanges();
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
        document.body.style.backgroundColor = '#011d32';
        document.body.style.color = '#f8fafc';
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

  useEffect(() => {
    localStorage.setItem('legado_services_v2', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('legado_price_changes_v1', JSON.stringify(priceChanges));
  }, [priceChanges]);

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

  // Client Management Handlers (Edit, Delete, Add directly from Admin Database & QR)
  const handleUpdateClient = (updatedClient: ClientRecord) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    saveClientToFirestore(updatedClient).catch((err) => {
      console.warn('Could not sync updated client to Firestore:', err);
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    deleteClientFromFirestore(clientId).catch((err) => {
      console.warn('Could not delete client from Firestore:', err);
    });
  };

  const handleAddClient = (newClient: ClientRecord) => {
    setClients(prev => [newClient, ...prev]);
    saveClientToFirestore(newClient).catch((err) => {
      console.warn('Could not sync new client to Firestore:', err);
    });
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

  const handleUpdateSale = (updatedSale: Sale) => {
    setSales(prev => prev.map(s => (s.id === updatedSale.id ? updatedSale : s)));
    saveSaleToFirestore(updatedSale).catch((err) => {
      console.warn('Could not sync updated sale to Firestore:', err);
    });
  };

  const handleDeleteSale = (saleId: string) => {
    setSales(prev => prev.filter(s => s.id !== saleId));
    deleteSaleFromFirestore(saleId).catch((err) => {
      console.warn('Could not delete sale from Firestore:', err);
    });
  };

  // Expenses Handlers
  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    saveExpenseToFirestore(expense).catch((err) => {
      console.warn('Could not sync expense to Firestore:', err);
    });
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => (e.id === updatedExpense.id ? updatedExpense : e)));
    saveExpenseToFirestore(updatedExpense).catch((err) => {
      console.warn('Could not sync updated expense to Firestore:', err);
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    deleteExpenseFromFirestore(expenseId).catch((err) => {
      console.warn('Could not delete expense from Firestore:', err);
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

  const handleToggleBarberStatus = (barberId: string, active: boolean) => {
    setBarbers(prev =>
      prev.map(b => {
        if (b.id === barberId) {
          const updated = { ...b, active };
          saveBarberToFirestore(updated).catch((err) => {
            console.warn('Could not update barber status in Firestore:', err);
          });
          return updated;
        }
        return b;
      })
    );
  };

  const handleDeleteBarber = (barberId: string) => {
    setBarbers(prev => prev.filter(b => b.id !== barberId));
    deleteBarberFromFirestore(barberId).catch((err) => {
      console.warn('Could not delete barber from Firestore:', err);
    });
  };

  // Liquidation Handlers
  const handleSaveLiquidation = (liq: BarberLiquidation) => {
    setLiquidations(prev => [liq, ...prev.filter(l => l.id !== liq.id)]);
    saveLiquidationToFirestore(liq).catch((err) => {
      console.warn('Could not sync liquidation to Firestore:', err);
    });

    // Mark corresponding sales as commission paid
    if (liq.saleIds && liq.saleIds.length > 0) {
      setSales(prev =>
        prev.map(s => {
          if (liq.saleIds.includes(s.id)) {
            const updated = { ...s, isCommissionPaid: true };
            saveSaleToFirestore(updated).catch(console.warn);
            return updated;
          }
          return s;
        })
      );
    }
  };

  // Contract Handlers
  const handleSaveContract = (contract: BarberContract) => {
    setContracts(prev => [contract, ...prev.filter(c => c.id !== contract.id)]);
    saveContractToFirestore(contract).catch((err) => {
      console.warn('Could not sync contract to Firestore:', err);
    });
  };

  const handleDeleteContract = (contractId: string) => {
    setContracts(prev => prev.filter(c => c.id !== contractId));
    deleteContractFromFirestore(contractId).catch((err) => {
      console.warn('Could not delete contract from Firestore:', err);
    });
  };

  // Service Management Handlers
  const handleUpdateService = (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    saveServiceToFirestore(updatedService).catch((err) => {
      console.warn('Could not sync service to Firestore:', err);
    });
  };

  const handleAddService = (newService: Service) => {
    setServices(prev => [...prev, newService]);
    saveServiceToFirestore(newService).catch((err) => {
      console.warn('Could not sync new service to Firestore:', err);
    });
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    deleteServiceFromFirestore(serviceId).catch((err) => {
      console.warn('Could not delete service from Firestore:', err);
    });
  };

  const handleResetServices = () => {
    setServices(OFFICIAL_SERVICES);
    OFFICIAL_SERVICES.forEach(s => {
      saveServiceToFirestore(s).catch(console.warn);
    });
  };

  const handleRecordPriceChange = (record: PriceChangeRecord) => {
    setPriceChanges(prev => [record, ...prev.filter(r => r.id !== record.id)]);
    savePriceChangeToFirestore(record).catch((err) => {
      console.warn('Could not sync price change audit log to Firestore:', err);
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Top Navbar with Logo, Breadcrumbs, Theme Switcher and Firebase status */}
      <TopNav
        currentPanel={currentPanel}
        onNavigateHome={() => navigateToPanel('home')}
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
            onSelectClients={() => navigateToPanel('clientes')}
            onSelectBarbers={() => handleOpenPin('barberos')}
            onSelectAdmin={() => handleOpenPin('admin')}
          />
        )}

        {currentPanel === 'clientes' && (
          <ClientPortal
            services={services && services.length > 0 ? services : OFFICIAL_SERVICES}
            barbers={barbers && barbers.length > 0 ? barbers : INITIAL_BARBERS}
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
            liquidations={liquidations}
            contracts={contracts}
            priceChanges={priceChanges}
            onAddSale={handleAddSale}
            onUpdateSale={handleUpdateSale}
            onDeleteSale={handleDeleteSale}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onSettleBarberCommissions={handleSettleBarberCommissions}
            onSaveLiquidation={handleSaveLiquidation}
            onSaveContract={handleSaveContract}
            onDeleteContract={handleDeleteContract}
            onSendBroadcast={handleSendBroadcast}
            onUpdateInventoryStock={handleUpdateInventoryStock}
            onAddInventoryItem={handleAddInventoryItem}
            onAddBarber={handleAddBarber}
            onToggleBarberStatus={handleToggleBarberStatus}
            onDeleteBarber={handleDeleteBarber}
            onUpdateService={handleUpdateService}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            onResetServices={handleResetServices}
            onRecordPriceChange={handleRecordPriceChange}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            onAddClient={handleAddClient}
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
