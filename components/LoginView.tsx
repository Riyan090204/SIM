"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Compass, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Info
} from "lucide-react";

export default function LoginView() {
  const { signIn, signUp, isFirebaseReady } = useAuth();
  
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Silakan lengkapi email dan kata sandi.");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setErrorMessage("Kata sandi minimal 6 karakter.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Konfirmasi kata sandi tidak cocok.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Gagal masuk. Periksa kembali email dan kata sandi.");
        }
      } else {
        const res = await signUp(email, password);
        if (res.success) {
          setSuccessMessage("Akun berhasil dibuat! Anda otomatis masuk.");
        } else {
          setErrorMessage(res.error || "Gagal membuat akun.");
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || "Terjadi kesalahan pada sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/40 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Container Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-xl mb-3 backdrop-blur-md">
            {!logoError ? (
              <img
                src="/logo.PNG"
                alt="PangandaranHub"
                onError={(e) => {
                  if ((e.currentTarget as HTMLImageElement).src.endsWith("/logo.PNG")) {
                    (e.currentTarget as HTMLImageElement).src = "/logo.png";
                  } else {
                    setLogoError(true);
                  }
                }}
                className="w-14 h-14 object-contain rounded-xl"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            Pangandaran<span className="text-teal-400">Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Sistem Finansial & Invoice Wisata
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8">
          
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Tim</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {!isFirebaseReady && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Konfigurasi Firebase belum terdeteksi di <code className="bg-amber-950 px-1 py-0.5 rounded text-amber-200">.env.local</code>. Pastikan variabel API key sudah lengkap.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pangandaranhub.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Only for Register) */}
            {mode === "register" && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ulangi Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 hover:from-teal-500 hover:to-sky-500 active:scale-[0.99] shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Dashboard</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Akun Tim</span>
                </>
              )}
            </button>
          </form>

          {/* Shared Account Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/80">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Satu akun tim dapat dipakai bersama secara realtime</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} PangandaranHub Management. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
