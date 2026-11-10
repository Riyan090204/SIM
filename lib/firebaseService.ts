import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { Booking, Invoice } from "@/types";

// Helper untuk membersihkan nilai `undefined` agar Firestore tidak error
function sanitizeForFirestore<T extends object>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitizeForFirestore(value as object);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/* ========================================================
   BOOKING OPERATIONS
   ======================================================== */

/**
 * Berlangganan (realtime listener) data bookings dari Firestore.
 */
export function subscribeBookings(
  onData: (bookings: Booking[]) => void,
  onError?: (error: Error) => void,
  currentUserEmail?: string | null
): Unsubscribe {
  if (!db || !isFirebaseConfigured) {
    return () => {};
  }

  try {
    const colRef = collection(db, "bookings");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const bookings: Booking[] = [];
        const normEmail = (currentUserEmail || "").toLowerCase().trim();
        snapshot.forEach((docSnap) => {
          const item = { id: docSnap.id, ...docSnap.data() } as Booking;
          const itemEmail = (item.userEmail || "").toLowerCase().trim();

          const belongsToCurrent =
            itemEmail === normEmail ||
            (!itemEmail && (normEmail === "pangandaranwisata09@gmail.com" || !normEmail));

          if (belongsToCurrent) {
            bookings.push(item);
          }
        });
        // Urutkan secara client-side agar tidak memerlukan Firestore composite index
        bookings.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        console.log(`[Firestore] Bookings snapshot loaded for ${normEmail}: ${bookings.length} item(s)`);
        onData(bookings);
      },
      (error) => {
        console.error("Firestore onSnapshot bookings error:", error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error("Gagal membuat query bookings:", error);
    return () => {};
  }
}

/**
 * Menyimpan data booking ke Firestore (Create atau Update).
 */
export async function saveBookingToFirestore(
  booking: Booking,
  userEmail?: string | null,
  userId?: string | null
): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firebase belum dikonfigurasi.");
  }
  const dataToSave: Booking = {
    ...booking,
    userEmail: booking.userEmail || userEmail || undefined,
    userId: booking.userId || userId || undefined,
  };
  const cleanData = sanitizeForFirestore(dataToSave);
  const docRef = doc(db, "bookings", booking.id);
  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Menghapus booking dari Firestore berdasarkan ID.
 */
export async function deleteBookingFromFirestore(id: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firebase belum dikonfigurasi.");
  }
  await deleteDoc(doc(db, "bookings", id));
}

/* ========================================================
   INVOICE OPERATIONS
   ======================================================== */

/**
 * Berlangganan (realtime listener) data invoices dari Firestore.
 */
export function subscribeInvoices(
  onData: (invoices: Invoice[]) => void,
  onError?: (error: Error) => void,
  currentUserEmail?: string | null
): Unsubscribe {
  if (!db || !isFirebaseConfigured) {
    return () => {};
  }

  try {
    const colRef = collection(db, "invoices");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const invoices: Invoice[] = [];
        const normEmail = (currentUserEmail || "").toLowerCase().trim();
        snapshot.forEach((docSnap) => {
          const item = { id: docSnap.id, ...docSnap.data() } as Invoice;
          const itemEmail = (item.userEmail || "").toLowerCase().trim();

          const belongsToCurrent =
            itemEmail === normEmail ||
            (!itemEmail && (normEmail === "pangandaranwisata09@gmail.com" || !normEmail));

          if (belongsToCurrent) {
            invoices.push(item);
          }
        });
        // Urutkan secara client-side
        invoices.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        console.log(`[Firestore] Invoices snapshot loaded for ${normEmail}: ${invoices.length} item(s)`);
        onData(invoices);
      },
      (error) => {
        console.error("Firestore onSnapshot invoices error:", error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error("Gagal membuat query invoices:", error);
    return () => {};
  }
}

/**
 * Menyimpan data invoice ke Firestore (Create atau Update).
 */
export async function saveInvoiceToFirestore(
  invoice: Invoice,
  userEmail?: string | null,
  userId?: string | null
): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firebase belum dikonfigurasi.");
  }
  const dataToSave: Invoice = {
    ...invoice,
    userEmail: invoice.userEmail || userEmail || undefined,
    userId: invoice.userId || userId || undefined,
  };
  const cleanData = sanitizeForFirestore(dataToSave);
  const docRef = doc(db, "invoices", invoice.id);
  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Menghapus invoice dari Firestore berdasarkan ID.
 */
export async function deleteInvoiceFromFirestore(id: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firebase belum dikonfigurasi.");
  }
  await deleteDoc(doc(db, "invoices", id));
}

/* ========================================================
   MIGRATION / SYNC HELPER (LOCAL STORAGE -> FIRESTORE)
   ======================================================== */

/**
 * Memindahkan data yang sebelumnya tersimpan di localStorage ke Firestore Cloud.
 */
export async function syncLocalDataToFirestore(
  localBookings: Booking[],
  localInvoices: Invoice[]
): Promise<{ bookingsCount: number; invoicesCount: number }> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firebase belum aktif atau belum dikonfigurasi.");
  }

  const batch = writeBatch(db);
  let bookingsCount = 0;
  let invoicesCount = 0;

  for (const b of localBookings) {
    if (b.id) {
      const bRef = doc(db, "bookings", b.id);
      batch.set(bRef, sanitizeForFirestore(b), { merge: true });
      bookingsCount++;
    }
  }

  for (const inv of localInvoices) {
    if (inv.id) {
      const invRef = doc(db, "invoices", inv.id);
      batch.set(invRef, sanitizeForFirestore(inv), { merge: true });
      invoicesCount++;
    }
  }

  await batch.commit();
  return { bookingsCount, invoicesCount };
}
