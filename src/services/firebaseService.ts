import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { OperationType, handleFirestoreError } from '../utils/firestoreErrors';
import { 
  Barber, 
  ClientRecord, 
  Appointment, 
  Sale, 
  Expense, 
  InventoryItem, 
  PromotionBroadcast,
  BarberLiquidation,
  BarberContract,
  Service,
  PriceChangeRecord
} from '../types';
import { 
  INITIAL_BARBERS, 
  INITIAL_CLIENTS, 
  INITIAL_SALES, 
  INITIAL_EXPENSES, 
  INITIAL_INVENTORY, 
  INITIAL_APPOINTMENTS,
  OFFICIAL_SERVICES 
} from '../data/mockData';

// Google Authentication
export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ==========================================
// FIRESTORE CRUD & REAL-TIME SYNC
// ==========================================

// --- BARBERS ---
export const subscribeToBarbers = (onData: (data: Barber[]) => void) => {
  const path = 'barbers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Barber[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Barber);
      });
      onData(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveBarberToFirestore = async (barber: Barber) => {
  const path = `barbers/${barber.id}`;
  try {
    await setDoc(doc(db, 'barbers', barber.id), barber);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteBarberFromFirestore = async (barberId: string) => {
  const path = `barbers/${barberId}`;
  try {
    await deleteDoc(doc(db, 'barbers', barberId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- CLIENTS ---
export const subscribeToClients = (onData: (data: ClientRecord[]) => void) => {
  const path = 'clients';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: ClientRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as ClientRecord);
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveClientToFirestore = async (client: ClientRecord) => {
  const path = `clients/${client.id}`;
  try {
    await setDoc(doc(db, 'clients', client.id), client);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

// --- APPOINTMENTS ---
export const subscribeToAppointments = (onData: (data: Appointment[]) => void) => {
  const path = 'appointments';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Appointment);
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveAppointmentToFirestore = async (apt: Appointment) => {
  const path = `appointments/${apt.id}`;
  try {
    await setDoc(doc(db, 'appointments', apt.id), apt);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteAppointmentFromFirestore = async (aptId: string) => {
  const path = `appointments/${aptId}`;
  try {
    await deleteDoc(doc(db, 'appointments', aptId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- SALES ---
export const subscribeToSales = (onData: (data: Sale[]) => void) => {
  const path = 'sales';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Sale[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Sale);
      });
      onData(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveSaleToFirestore = async (sale: Sale) => {
  const path = `sales/${sale.id}`;
  try {
    await setDoc(doc(db, 'sales', sale.id), sale);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteSaleFromFirestore = async (saleId: string) => {
  const path = `sales/${saleId}`;
  try {
    await deleteDoc(doc(db, 'sales', saleId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- PRICE CHANGES AUDIT LOG ---
export const subscribeToPriceChanges = (onData: (data: PriceChangeRecord[]) => void) => {
  const path = 'price_changes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: PriceChangeRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as PriceChangeRecord);
      });
      // Sort newest first
      list.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
      onData(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const savePriceChangeToFirestore = async (record: PriceChangeRecord) => {
  const path = `price_changes/${record.id}`;
  try {
    await setDoc(doc(db, 'price_changes', record.id), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deletePriceChangeFromFirestore = async (recordId: string) => {
  const path = `price_changes/${recordId}`;
  try {
    await deleteDoc(doc(db, 'price_changes', recordId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- EXPENSES ---
export const subscribeToExpenses = (onData: (data: Expense[]) => void) => {
  const path = 'expenses';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Expense);
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveExpenseToFirestore = async (expense: Expense) => {
  const path = `expenses/${expense.id}`;
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteExpenseFromFirestore = async (expenseId: string) => {
  const path = `expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- INVENTORY ---
export const subscribeToInventory = (onData: (data: InventoryItem[]) => void) => {
  const path = 'inventory';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: InventoryItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as InventoryItem);
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveInventoryItemToFirestore = async (item: InventoryItem) => {
  const path = `inventory/${item.id}`;
  try {
    await setDoc(doc(db, 'inventory', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

// --- PROMOTIONS ---
export const subscribeToPromotions = (onData: (data: PromotionBroadcast[]) => void) => {
  const path = 'promotions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: PromotionBroadcast[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as PromotionBroadcast);
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const savePromotionToFirestore = async (promo: PromotionBroadcast) => {
  const path = `promotions/${promo.id}`;
  try {
    await setDoc(doc(db, 'promotions', promo.id), promo);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

// --- LIQUIDATIONS ---
export const subscribeToLiquidations = (onData: (data: BarberLiquidation[]) => void) => {
  const path = 'liquidations';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: BarberLiquidation[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as BarberLiquidation);
      });
      onData(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveLiquidationToFirestore = async (liq: BarberLiquidation) => {
  const path = `liquidations/${liq.id}`;
  try {
    await setDoc(doc(db, 'liquidations', liq.id), liq);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteLiquidationFromFirestore = async (liqId: string) => {
  const path = `liquidations/${liqId}`;
  try {
    await deleteDoc(doc(db, 'liquidations', liqId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- CONTRACTS ---
export const subscribeToContracts = (onData: (data: BarberContract[]) => void) => {
  const path = 'contracts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: BarberContract[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as BarberContract);
      });
      onData(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveContractToFirestore = async (contract: BarberContract) => {
  const path = `contracts/${contract.id}`;
  try {
    await setDoc(doc(db, 'contracts', contract.id), contract);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteContractFromFirestore = async (contractId: string) => {
  const path = `contracts/${contractId}`;
  try {
    await deleteDoc(doc(db, 'contracts', contractId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// Services & Prices Collection
export const subscribeToServices = (onData: (services: Service[]) => void) => {
  const path = 'services';
  return onSnapshot(
    collection(db, 'services'),
    (snapshot) => {
      if (snapshot.empty) return;
      const list: Service[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Service);
      });
      onData(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

export const saveServiceToFirestore = async (service: Service) => {
  const path = `services/${service.id}`;
  try {
    await setDoc(doc(db, 'services', service.id), service);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteServiceFromFirestore = async (serviceId: string) => {
  const path = `services/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'services', serviceId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// Seed initial database collections on first startup if Firestore is empty
export const seedFirestoreIfEmpty = async () => {
  try {
    const barbersSnap = await getDocs(collection(db, 'barbers'));
    if (barbersSnap.empty) {
      for (const b of INITIAL_BARBERS) {
        await setDoc(doc(db, 'barbers', b.id), b);
      }
      for (const c of INITIAL_CLIENTS) {
        await setDoc(doc(db, 'clients', c.id), c);
      }
      for (const inv of INITIAL_INVENTORY) {
        await setDoc(doc(db, 'inventory', inv.id), inv);
      }
      for (const exp of INITIAL_EXPENSES) {
        await setDoc(doc(db, 'expenses', exp.id), exp);
      }
      for (const s of INITIAL_SALES) {
        await setDoc(doc(db, 'sales', s.id), s);
      }
      for (const apt of INITIAL_APPOINTMENTS) {
        await setDoc(doc(db, 'appointments', apt.id), apt);
      }
      for (const srv of OFFICIAL_SERVICES) {
        await setDoc(doc(db, 'services', srv.id), srv);
      }
    }
  } catch (e) {
    console.warn('Initial seeding skipped or already present in Firestore:', e);
  }
};
