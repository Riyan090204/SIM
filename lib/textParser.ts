import { Participant } from "@/types";

export interface ParsedBookingData {
  namaPemesan?: string;
  nomorHp?: string;
  alamat?: string;
  instagram?: string;
  email?: string;
  nomorKendaraan?: string;
  pilihanPaket?: string;
  tanggalTrip?: string; // YYYY-MM-DD
  estimasiWaktuKedatangan?: string;
  peserta?: Participant[];
  uangMukaText?: string;
  dpNominal?: number;
  totalNominal?: number;
  qty?: number;
}

// Helper untuk konversi nama bulan Indonesia ke 2 digit angka (01-12)
const MONTH_MAP: Record<string, string> = {
  januari: "01",
  jan: "01",
  februari: "02",
  feb: "02",
  maret: "03",
  mar: "03",
  april: "04",
  apr: "04",
  mei: "05",
  may: "05",
  juni: "06",
  jun: "06",
  juli: "07",
  jul: "07",
  agustus: "08",
  agu: "08",
  agust: "08",
  september: "09",
  sep: "09",
  sept: "09",
  oktober: "10",
  okt: "10",
  november: "11",
  nov: "11",
  nopember: "11",
  desember: "12",
  des: "12",
};

/**
 * Normalisasi tanggal seperti "06 november", "6 nov 2026", "2026-11-06", "06/11/2026" menjadi YYYY-MM-DD.
 */
function parseIndonesianDate(rawText: string): string | undefined {
  if (!rawText) return undefined;

  // Pola YYYY-MM-DD
  const isoMatch = rawText.match(/\b(20\d\d)[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, "0");
    const d = isoMatch[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Pola DD/MM/YYYY
  const dmyMatch = rawText.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d\d)\b/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, "0");
    const m = dmyMatch[2].padStart(2, "0");
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Pola "06 november [2026]" atau "6 nov"
  const textMonthMatch = rawText.match(
    /\b(\d{1,2})\s+([a-zA-Z]+)(?:\s+(20\d\d))?\b/
  );
  if (textMonthMatch) {
    const d = textMonthMatch[1].padStart(2, "0");
    const mName = textMonthMatch[2].toLowerCase();
    const currentYear = new Date().getFullYear();
    const y = textMonthMatch[3] || String(currentYear);
    const m = MONTH_MAP[mName];
    if (m) {
      return `${y}-${m}-${d}`;
    }
  }

  return undefined;
}

/**
 * Menghapus emoji atau simbol bullet WhatsApp dari awal teks baris
 */
function cleanLinePrefix(text: string): string {
  return text
    .replace(/^[\s▪️•\-\*✔️🔹▫️]+/u, "")
    .replace(/^[:\s\-]+/, "")
    .trim();
}

/**
 * Parser utama untuk teks pemesanan WhatsApp
 */
export function parseWhatsAppBooking(text: string): ParsedBookingData {
  if (!text || !text.trim()) return {};

  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const result: ParsedBookingData = {};
  const extractedPeserta: Participant[] = [];

  let inPesertaSection = false;
  let inPaketSection = false;
  const paketAccumulator: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.replace(/[*_~`]/g, "").trim(); // Hapus formatting markdown WhatsApp
    const lower = line.toLowerCase();

    if (!line) {
      if (inPaketSection && paketAccumulator.length > 0) {
        inPaketSection = false;
      }
      continue;
    }

    // Deteksi Nama Pemesan
    const namaMatch = line.match(/(?:nama\s*pemesan|nama)\s*[:=]\s*(.+)/i);
    if (namaMatch && !result.namaPemesan) {
      result.namaPemesan = cleanLinePrefix(namaMatch[1]);
      inPesertaSection = false;
      inPaketSection = false;
      continue;
    }

    // Deteksi No HP / WhatsApp
    const hpMatch = line.match(/(?:hp|no\.?\s*hp|no\.?\s*wa|whatsapp|telepon|kontak)\s*[:=]\s*([0-9+\s\-]{8,20})/i);
    if (hpMatch && !result.nomorHp) {
      result.nomorHp = hpMatch[1].replace(/[^0-9+]/g, "").trim();
      inPesertaSection = false;
      inPaketSection = false;
      continue;
    }

    // Deteksi Alamat
    const alamatMatch = line.match(/(?:alamat|domisili|asal)\s*[:=]\s*(.+)/i);
    if (alamatMatch && !result.alamat) {
      result.alamat = cleanLinePrefix(alamatMatch[1]);
      inPesertaSection = false;
      inPaketSection = false;
      continue;
    }

    // Deteksi Instagram
    const igMatch = line.match(/(?:instagram|ig)\s*[:=]\s*(.+)/i);
    if (igMatch && !result.instagram) {
      result.instagram = cleanLinePrefix(igMatch[1]).replace(/^@/, "");
      inPesertaSection = false;
      inPaketSection = false;
      continue;
    }

    // Deteksi Email
    const emailMatch = line.match(/(?:e-?mail)\s*[:=]\s*(.+)/i);
    if (emailMatch && !result.email) {
      const emailOnly = emailMatch[1].match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
      result.email = emailOnly ? emailOnly[0] : cleanLinePrefix(emailMatch[1]);
      inPesertaSection = false;
      inPaketSection = false;
      continue;
    }

    // Deteksi Nomor Kendaraan / Plat
    const nopolMatch = line.match(/(?:nomor\s*kendaraan|no\.?\s*polisi|plat|kendaraan)\s*[:=]\s*(.+)/i);
    if (nopolMatch && !result.nomorKendaraan) {
      result.nomorKendaraan = cleanLinePrefix(nopolMatch[1]);
      inPesertaSection = false;
      inPaketSection = false;
      continue;
    }

    // Deteksi Paket Layanan
    if (lower.includes("pilih paket") || lower.includes("paket:") || lower.includes("paket layanan")) {
      inPaketSection = true;
      inPesertaSection = false;
      const afterColon = line.split(/[:=]/)[1]?.trim();
      if (afterColon && afterColon.length > 2) {
        result.pilihanPaket = cleanLinePrefix(afterColon);
        inPaketSection = false;
      }
      continue;
    }

    if (inPaketSection) {
      // Baris paket berikutnya biasanya bertanda bullet • atau langsung nama
      if (lower.includes("tanggal trip") || lower.includes("peserta:") || lower.includes("uang muka")) {
        inPaketSection = false;
      } else {
        const cleaned = cleanLinePrefix(line);
        if (cleaned) {
          paketAccumulator.push(cleaned);
        }
        continue;
      }
    }

    // Deteksi Tanggal Trip & Estimasi Waktu
    if (lower.includes("tanggal trip") || lower.includes("tgl trip") || lower.includes("tanggal pelaksanaan")) {
      inPesertaSection = false;
      inPaketSection = false;
      const parts = line.split(/[:=]/);
      const afterKey = parts.slice(1).join(":").trim();

      // Pisahkan bagian tanggal dan bagian estimasi jam jika digabung dengan koma / tanda hubung
      // Contoh: "06 november, estimasi jam 2 siang"
      const dateSubparts = afterKey.split(/[,|;]/);
      const rawDatePart = dateSubparts[0]?.trim();
      const parsedDate = parseIndonesianDate(rawDatePart);
      if (parsedDate) {
        result.tanggalTrip = parsedDate;
      }

      // Deteksi estimasi waktu
      const timeMatch = afterKey.match(/(?:estimasi|jam|pukul|waktu|pukul:)\s*(.+)/i);
      if (timeMatch) {
        result.estimasiWaktuKedatangan = cleanLinePrefix(timeMatch[1]);
      } else if (dateSubparts.length > 1 && !result.estimasiWaktuKedatangan) {
        const secondPart = dateSubparts.slice(1).join(" ").trim();
        if (secondPart.match(/jam|pukul|siang|pagi|sore|malam|\d{1,2}[:.]\d{2}/i)) {
          result.estimasiWaktuKedatangan = secondPart;
        }
      }
      continue;
    }

    // Deteksi Bagian Peserta (Header: ▪️Peserta: nama, gender)
    if (lower.includes("peserta") && (lower.includes("gender") || lower.includes("nama") || lower.includes(":"))) {
      inPesertaSection = true;
      inPaketSection = false;
      continue;
    }

    if (inPesertaSection) {
      // Berhenti jika sudah masuk ke footer / uang muka
      if (lower.includes("uang muka") || lower.includes("rekening") || lower.includes("kontak hp") || lower.includes("bank")) {
        inPesertaSection = false;
      } else {
        // Cek baris berformat list: "1. Disa, Perempuan" atau "1. Disa (P)" atau "- Disa, Perempuan"
        const participantMatch = line.match(/^(?:\d+[\s.)-]*|[-•▪️*]\s*)([A-Za-z\s'.]+?)(?:[,/|()-]+\s*([A-Za-z]+))?$/);
        if (participantMatch) {
          const namePart = participantMatch[1]?.trim();
          const genderPart = participantMatch[2]?.trim().toLowerCase();

          if (namePart && namePart.length >= 2) {
            let gender: "Laki-laki" | "Perempuan" = "Laki-laki";
            if (
              genderPart &&
              (genderPart.startsWith("p") ||
                genderPart.includes("wanita") ||
                genderPart.includes("cewek") ||
                genderPart.includes("female"))
            ) {
              gender = "Perempuan";
            }
            extractedPeserta.push({
              id: `p-${Date.now()}-${extractedPeserta.length + 1}`,
              nama: namePart,
              gender,
            });
          }
        }
        continue;
      }
    }

    // Deteksi Uang Muka / DP
    if (lower.includes("uang muka") || lower.includes("dp")) {
      result.uangMukaText = cleanLinePrefix(line);
      const numMatch = line.match(/rp\.?\s*([\d.]+)/i);
      if (numMatch) {
        result.dpNominal = Number(numMatch[1].replace(/\./g, "")) || 0;
      }
    }
  }

  // Jika paket terkumpul dari baris-baris list di bawah "Pilih Paket:"
  if (!result.pilihanPaket && paketAccumulator.length > 0) {
    result.pilihanPaket = paketAccumulator.join(", ");
  }

  if (extractedPeserta.length > 0) {
    result.peserta = extractedPeserta;
    result.qty = extractedPeserta.length;
  }

  return result;
}
