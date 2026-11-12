export interface Participant {
  id: string;
  nama: string;
  gender: "Laki-laki" | "Perempuan";
}

export interface Booking {
  id: string;
  bookingCode: string;
  namaPemesan: string;
  nomorHp: string;
  alamat: string;
  instagram: string;
  email: string;
  nomorKendaraan: string;
  pilihanPaket: string;
  tanggalTrip: string;
  estimasiWaktuKedatangan: string;
  peserta: Participant[];
  status: "Terkonfirmasi" | "Pending" | "Selesai" | "Batal";
  createdAt: string;
  userEmail?: string;
  userId?: string;
}

export interface AdditionalService {
  id: string;
  nama: string;
  pakaiSatuan?: boolean; // true = hitung qty x harga, false = tanpa satuan (-)
  qty: number;
  harga: number;
  total: number;
}

export interface TourPackageItem {
  id: string;
  nama: string;
  deskripsi?: string;
  tipeHitungan?: "satuan" | "non-satuan";
  qty: number;
  hargaSatuan: number;
  total: number;
}

export type PaymentStatus = "Belum Bayar" | "DP (Down Payment)" | "Lunas" | "Dibatalkan";

export interface Invoice {
  id: string;
  bookingId?: string;
  nomorInvoice: string;
  tanggal: string; // Tanggal invoice dibuat
  status: PaymentStatus;
  
  // Data Pemesan
  namaPemesan: string;
  alamatPemesan: string;
  emailPemesan: string;
  nomorTeleponPemesan: string;

  // Detail Layanan Utama (Legacy support & summary)
  paketLayanan: string;
  tanggalPelaksanaan: string; // Tanggal trip
  deskripsi: string;
  keterangan: string;
  tipeHitungan?: "satuan" | "non-satuan"; // "satuan" = per Pax, "non-satuan" = tanda "-"
  qty: number; // Jumlah Pax
  hargaSatuan: number;
  total: number; // qty * hargaSatuan atau fixed total

  // Multi-Paket Aktivitas Wisata Utama
  paketItems?: TourPackageItem[];

  // Layanan Tambahan (Add-ons)
  layananTambahan: AdditionalService[];

  // Finansial
  grandTotal: number; // total paket + total layanan tambahan
  totalUangMasuk: number; // uang yang sudah diterima / DP
  sisaTagihan: number; // grandTotal - totalUangMasuk
  labaBersih: number; // Laba bersih dari invoice ini

  createdAt: string;
  userEmail?: string;
  userId?: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  notes: string[];
}

export const PANGANDARAN_HUB_PROFILE: CompanyProfile = {
  name: "PangandaranHub",
  tagline: "Your Ultimate Pangandaran Tour & Travel Partner",
  address: "Parakanmanggu, Kec. Parigi, Kab. Pangandaran, Kabupaten Ciamis, Jawa Barat 46393, Indonesia",
  phone: "08817742021",
  email: "pangandaranhub@gmail.com",
  website: "pangandaranhub.com",
  bankName: "BCA",
  bankAccountNumber: "2080974801",
  bankAccountName: "RIYAN NURHIDAYAT",
  notes: [
    "Refund 100% jika trip dibatalkan penyelenggara karena force majeure",
    "Jika sudah DP dan peserta membatalkan trip, DP dinyatakan hangus",
    "Bisa melakukan Pelunasan setelah tiba atau sesudah melakukan aktivitas",
    "Mohon lakukan verifikasi faktur ini dengan tim kami di lokasi yang telah ditetapkan. Kami berharap perjalanan Anda menyenangkan!"
  ]
};
