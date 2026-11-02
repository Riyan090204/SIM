"use client";

import React from "react";
import { 
  Compass, 
  Receipt, 
  Users, 
  BarChart3, 
  PlusCircle, 
  CalendarPlus,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  activeTab: "dashboard" | "invoices" | "bookings";
  setActiveTab: (tab: "dashboard" | "invoices" | "bookings") => void;
  onOpenCreateInvoice: () => void;
  onOpenCreateBooking: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCreateInvoice,
  onOpenCreateBooking,
}: NavbarProps) {
  const { user, signOut } = useAuth();
  const [logoError, setLogoError] = React.useState(false);

  return (
    <>
      {/* ─── TOP HEADER ─── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18">
            
            {/* Logo & Brand Info */}
            <div className="flex items-center gap-2 sm:gap-3">
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
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl shadow-xs shrink-0"
                />
              ) : (
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                    Pangandaran<span className="text-teal-600">Hub</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Tour & Travel
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                  Invoice & Sistem Finansial Wisata
                </p>
              </div>
            </div>

            {/* Navigation Tabs (Desktop & Tablet: hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === "dashboard"
                    ? "bg-white text-teal-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Finansial</span>
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === "invoices"
                    ? "bg-white text-teal-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Invoice</span>
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === "bookings"
                    ? "bg-white text-teal-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Booking</span>
              </button>
            </nav>

            {/* Action Buttons & User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* + Booking (Visible on tablet & desktop) */}
              <button
                onClick={onOpenCreateBooking}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                <CalendarPlus className="w-4 h-4 text-slate-600" />
                <span>+ Booking</span>
              </button>

              {/* + Invoice Button */}
              <button
                onClick={onOpenCreateInvoice}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 rounded-lg shadow-sm shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Buat Invoice</span>
                <span className="sm:hidden text-xs">Invoice</span>
              </button>

              {/* User Profile & Logout */}
              {user && (
                <div className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 ml-0.5 sm:ml-1 border-l border-slate-200">
                  <div className="hidden xl:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]" title={user.email || ""}>
                      {user.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-teal-600 font-medium">Tim Pangandaran</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    title={`Keluar (${user.email})`}
                    className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition-colors border border-rose-200/60 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE BOTTOM NAVIGATION BAR (md:hidden) ─── */}
      {/* Native App-like bottom bar for effortless one-handed thumb navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl md:hidden no-print safe-area-pb">
        <div className="grid grid-cols-4 items-center h-16 px-1">
          {/* Tab 1: Finansial */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "dashboard"
                ? "text-teal-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === "dashboard" ? "bg-teal-50" : ""}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Finansial</span>
          </button>

          {/* Tab 2: Invoice */}
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "invoices"
                ? "text-teal-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === "invoices" ? "bg-teal-50" : ""}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Invoice</span>
          </button>

          {/* Tab 3: Booking */}
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === "bookings"
                ? "text-teal-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === "bookings" ? "bg-teal-50" : ""}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Booking</span>
          </button>

          {/* Quick Action: + Booking */}
          <button
            onClick={onOpenCreateBooking}
            className="flex flex-col items-center justify-center py-1 text-slate-700 hover:text-teal-700 transition-all"
          >
            <div className="p-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-teal-100 hover:text-teal-700">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">+ Booking</span>
          </button>
        </div>
      </div>
    </>
  );
}
