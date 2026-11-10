export interface AccountProfile {
  name: string;
  brandSubtitle: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  logo: string;
  signature: string;
  signerName: string;
  signerTitle: string;
  notes: string[];
}

export const ACCOUNT_PROFILES: Record<string, AccountProfile> = {
  "pangandaranwisata09@gmail.com": {
    name: "PangandaranHub",
    brandSubtitle: "Tour & Travel Organizer",
    tagline: "Your Ultimate Pangandaran Tour & Travel Partner",
    address: "Parakanmanggu, Kec. Parigi, Kab. Pangandaran, Kabupaten Ciamis, Jawa Barat 46393, Indonesia",
    phone: "08817742021",
    email: "pangandaranwisata09@gmail.com",
    website: "pangandaranhub.com",
    bankName: "BCA",
    bankAccountNumber: "2080974801",
    bankAccountName: "RIYAN NURHIDAYAT",
    logo: "/logo.PNG",
    signature: "/signature.PNG",
    signerName: "RIYAN NURHIDAYAT",
    signerTitle: "PangandaranHub Finance / Management",
    notes: [
      "Refund 100% jika trip dibatalkan penyelenggara karena force majeure",
      "Jika sudah DP dan peserta membatalkan trip, DP dinyatakan hangus",
      "Bisa melakukan Pelunasan setelah tiba atau sesudah melakukan aktivitas",
      "Mohon lakukan verifikasi faktur ini dengan tim kami di lokasi yang telah ditetapkan. Kami berharap perjalanan Anda menyenangkan!"
    ],
  },
  "pangandarannaturally@gmail.com": {
    name: "Pangandaran Naturally",
    brandSubtitle: "Tour & Travel Organizer",
    tagline: "Your Ultimate Pangandaran Travel Partner",
    address: "Pangandaran, Jawa Barat, Indonesia",
    phone: "08817742021",
    email: "pangandarannaturally@gmail.com",
    website: "pangandarannaturally.com",
    bankName: "BCA",
    bankAccountNumber: "1381563206",
    bankAccountName: "DINDIN WAHYU MAULANA",
    logo: "/logo-2.png",
    signature: "/signature-2.png",
    signerName: "DINDIN WAHYU MAULANA",
    signerTitle: "Pangandaran Naturally Management",
    notes: [
      "Refund 100% jika trip dibatalkan penyelenggara karena force majeure",
      "Jika sudah DP dan peserta membatalkan trip, DP dinyatakan hangus",
      "Bisa melakukan Pelunasan setelah tiba atau sesudah melakukan aktivitas",
      "Mohon lakukan verifikasi faktur ini dengan tim kami di lokasi yang telah ditetapkan. Kami berharap perjalanan Anda menyenangkan!"
    ],
  },
};

export function getAccountProfile(email?: string | null): AccountProfile {
  if (!email) return ACCOUNT_PROFILES["pangandaranwisata09@gmail.com"];
  const key = email.toLowerCase().trim();
  return ACCOUNT_PROFILES[key] || ACCOUNT_PROFILES["pangandaranwisata09@gmail.com"];
}

