"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  isFirebaseReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatAuthError = (errCode: string): string => {
    switch (errCode) {
      case "auth/invalid-email":
        return "Format email tidak valid. Pastikan penulisan benar.";
      case "auth/user-not-found":
        return "Akun dengan email ini tidak ditemukan. Silakan daftar terlebih dahulu.";
      case "auth/wrong-password":
        return "Kata sandi salah. Periksa kembali huruf besar/kecil.";
      case "auth/invalid-credential":
        return "Email atau kata sandi tidak cocok. Silakan coba lagi.";
      case "auth/email-already-in-use":
        return "Email ini sudah terdaftar. Silakan pilih tab 'Masuk'.";
      case "auth/weak-password":
        return "Kata sandi terlalu pendek. Gunakan minimal 6 karakter.";
      case "auth/operation-not-allowed":
      case "auth/configuration-not-found":
        return "Fitur Authentication belum diaktifkan di Firebase Console! Buka Firebase Console > Build > Authentication, klik 'Get started' (Mulai), lalu aktifkan provider 'Email/Password'.";
      case "auth/too-many-requests":
        return "Terlalu banyak percobaan gagal. Akses ditangguhkan sementara demi keamanan.";
      case "auth/network-request-failed":
        return "Gagal terhubung ke server. Periksa koneksi internet Anda.";
      default:
        return `Gagal memproses akun (${errCode || "unknown error"}). Pastikan Authentication sudah aktif di Firebase Console.`;
    }
  };


  const signIn = async (email: string, pass: string) => {
    if (!auth) {
      return { 
        success: false, 
        error: "Konfigurasi Firebase belum aktif di .env.local" 
      };
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true };
    } catch (error: unknown) {
      console.warn("Firebase Auth SignIn Error:", error);
      const err = error as { code?: string };
      return { 
        success: false, 
        error: formatAuthError(err.code || "") 
      };
    }
  };

  const signUp = async (email: string, pass: string) => {
    if (!auth) {
      return { 
        success: false, 
        error: "Konfigurasi Firebase belum aktif di .env.local" 
      };
    }
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true };
    } catch (error: unknown) {
      console.warn("Firebase Auth SignUp Error:", error);
      const err = error as { code?: string };
      return { 
        success: false, 
        error: formatAuthError(err.code || "") 
      };
    }
  };


  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isFirebaseReady: isFirebaseConfigured && !!auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
