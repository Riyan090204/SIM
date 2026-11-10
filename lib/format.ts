import { Invoice } from "@/types";
import { getAccountProfile } from "./accountConfig";

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function generateWhatsAppMessage(inv: Invoice): string {
  const profile = getAccountProfile(inv.userEmail);
  return `*INVOICE PEMESANAN TRIP - ${profile.name.toUpperCase()}*
----------------------------------------
*No. Invoice:* ${inv.nomorInvoice}
*Nama Pemesan:* ${inv.namaPemesan}
*Paket Layanan:* ${inv.paketLayanan}
*Tanggal Pelaksanaan:* ${formatDateIndo(inv.tanggalPelaksanaan)}
*Jumlah Peserta:* ${inv.tipeHitungan === "non-satuan" ? "-" : `${inv.qty} Pax`}
*Status Pembayaran:* ${inv.status}

*RINCIAN BIAYA:*
- Paket Utama ${inv.tipeHitungan === "non-satuan" ? "(-)" : `(${inv.qty} Pax)`}: ${formatRupiah(inv.total)}
${inv.layananTambahan && inv.layananTambahan.length > 0 ? inv.layananTambahan.map(item => `- ${item.nama} ${item.pakaiSatuan === false ? "(-)" : `(${item.qty}x)`}: ${formatRupiah(item.total)}`).join("\n") + "\n" : ""}----------------------------------------
*GRAND TOTAL:* ${formatRupiah(inv.grandTotal)}
*Total Uang Masuk (DP/Bayar):* ${formatRupiah(inv.totalUangMasuk)}
*SISA TAGIHAN:* ${formatRupiah(inv.sisaTagihan)}

*INFO PEMBAYARAN:*
Bank: ${profile.bankName}
No. Rekening: ${profile.bankAccountNumber}
Atas Nama: ${profile.bankAccountName}

*CATATAN PENTING:*
1. Refund 100% jika trip dibatalkan penyelenggara karena force majeure
2. Jika sudah DP dan peserta membatalkan trip, DP dinyatakan hangus
3. Bisa melakukan Pelunasan setelah tiba atau sesudah melakukan aktivitas
4. Mohon lakukan verifikasi faktur ini dengan tim kami di lokasi yang telah ditetapkan.

Terima kasih atas kepercayaannya bersama *${profile.name}*!
Info: ${profile.phone} | ${profile.website}`;
}
