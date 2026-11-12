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
  const hasMultiplePackages = Boolean(inv.paketItems && inv.paketItems.length > 0);

  const packageLines = hasMultiplePackages
    ? inv.paketItems!.map(p => `- ${p.nama} ${p.tipeHitungan === "non-satuan" ? "(-)" : `(${p.qty} Pax)`}: ${formatRupiah(p.total)}`).join("\n")
    : `- ${inv.paketLayanan} ${inv.tipeHitungan === "non-satuan" ? "(-)" : `(${inv.qty} Pax)`}: ${formatRupiah(inv.total)}`;

  const packageNames = hasMultiplePackages
    ? inv.paketItems!.map(p => p.nama).join(" + ")
    : inv.paketLayanan;

  const totalPaxStr = hasMultiplePackages
    ? inv.paketItems!.map(p => `${p.qty} Pax ${p.nama}`).join(", ")
    : (inv.tipeHitungan === "non-satuan" ? "-" : `${inv.qty} Pax`);

  return `*INVOICE PEMESANAN TRIP - ${profile.name.toUpperCase()}*
----------------------------------------
*No. Invoice:* ${inv.nomorInvoice}
*Nama Pemesan:* ${inv.namaPemesan}
*Paket Layanan:* ${packageNames}
*Tanggal Pelaksanaan:* ${formatDateIndo(inv.tanggalPelaksanaan)}
*Jumlah Peserta:* ${totalPaxStr}
*Status Pembayaran:* ${inv.status}

*RINCIAN BIAYA:*
${packageLines}
${inv.layananTambahan && inv.layananTambahan.length > 0 ? inv.layananTambahan.map(item => `- [Tambahan] ${item.nama} ${item.pakaiSatuan === false ? "(-)" : `(${item.qty}x)`}: ${formatRupiah(item.total)}`).join("\n") + "\n" : ""}----------------------------------------
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
Info: ${profile.phone}${profile.website ? ` | ${profile.website}` : ""}`;
}
