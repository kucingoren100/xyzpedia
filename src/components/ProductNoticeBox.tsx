"use client";

import { useState } from "react";
import {
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

interface ProductNoticeBoxProps {
  product: {
    name: string;
    slug: string;
    categorySlug?: string | null;
    developer?: string | null;
    requiresServer?: boolean;
  };
  selectedItemName?: string;
}

interface NoticeContent {
  importantItems: {
    text: string;
    isPositive: boolean; // true = checkmark, false = cross
  }[];
  warrantyTitle: string;
  warrantyPoints: string[];
  notesTitle: string;
  notesPoints: string[];
}

export default function ProductNoticeBox({
  product,
  selectedItemName = "",
}: ProductNoticeBoxProps) {
  const [isOpen, setIsOpen] = useState(true);

  const slug = (product.slug || "").toLowerCase();
  const category = (product.categorySlug || "").toLowerCase();
  const itemName = selectedItemName.toLowerCase();
  const isSharing =
    itemName.includes("sharing") ||
    itemName.includes("share") ||
    (!itemName.includes("private") && category === "akun-premium");
  const isPrivate = itemName.includes("private");

  // Determine tailored content based on product category & specific service
  let content: NoticeContent;

  if (category === "akun-premium") {
    if (slug.includes("netflix")) {
      content = {
        importantItems: [
          {
            text: isPrivate
              ? "Akun Private – 1 Akun full khusus untuk Anda (bisa buat PIN profil sendiri)"
              : "Akun sharing – dipakai bersama pengguna lain sesuai profil",
            isPositive: true,
          },
          {
            text: isPrivate
              ? "Bebas gunakan seluruh profil yang tersedia"
              : "Hanya pakai profil yang telah ditentukan di instruksi",
            isPositive: isPrivate,
          },
          {
            text: "Jangan ubah password, email, atau metode pembayaran akun",
            isPositive: false,
          },
          {
            text: "Kualitas streaming Ultra HD 4K & Audio Spasial",
            isPositive: true,
          },
          {
            text: "Bisa di HP, laptop, tablet, Smart TV & Android Box",
            isPositive: true,
          },
          {
            text: "Kredensial login dikirim otomatis & instan setelah pembayaran",
            isPositive: true,
          },
        ],
        warrantyTitle: "Syarat & Ketentuan",
        warrantyPoints: [
          "Garansi Full Durasi (Anti-Hold / Screen Limit).",
          "Klaim garansi mudah via halaman invoice pesanan dengan nomor transaksi.",
        ],
        notesTitle: "Catatan",
        notesPoints: [
          "Pesanan diproses otomatis 24 jam nonstop.",
          "Kendala login? Hubungi admin WhatsApp dengan menyertakan nomor invoice.",
        ],
      };
    } else if (slug.includes("spotify")) {
      content = {
        importantItems: [
          {
            text: "Akun Spotify Premium legal resmi (Bukan APK mod / crack)",
            isPositive: true,
          },
          {
            text: "Bebas iklan, skip lagu unlimited & kualitas audio high quality",
            isPositive: true,
          },
          {
            text: "Bisa download lagu untuk didengarkan offline tanpa kuota",
            isPositive: true,
          },
          {
            text: "Playlist dan lagu favorit Anda tetap aman tersimpan",
            isPositive: true,
          },
          {
            text: "Jangan sering berpindah family/region dalam jangka waktu dekat",
            isPositive: false,
          },
          {
            text: "Bisa digunakan di Android, iOS, Windows, Mac & Web Player",
            isPositive: true,
          },
          {
            text: "Panduan aktivasi dikirim otomatis setelah bayar",
            isPositive: true,
          },
        ],
        warrantyTitle: "Syarat & Ketentuan",
        warrantyPoints: [
          "Garansi penuh selama masa langganan aktif.",
          "Klaim garansi penggantian jika status premium terputus.",
        ],
        notesTitle: "Catatan",
        notesPoints: [
          "Proses otomatis 24 jam.",
          "Kendala? Hubungi admin dengan menyertakan kode transaksi.",
        ],
      };
    } else if (slug.includes("youtube")) {
      content = {
        importantItems: [
          {
            text: "YouTube Premium legal resmi bebas iklan di video & YouTube Music",
            isPositive: true,
          },
          {
            text: "Fitur putar di latar belakang (background play) & Picture-in-Picture aktif",
            isPositive: true,
          },
          {
            text: "Bisa download video & lagu untuk ditonton offline",
            isPositive: true,
          },
          {
            text: "Maksimal ganti Family Plan 12 bulan sekali (kebijakan resmi Google)",
            isPositive: false,
          },
          {
            text: "Support di HP, Smart TV, Laptop/PC & Tablet",
            isPositive: true,
          },
          {
            text: "Undangan / akses dikirim otomatis setelah pembayaran",
            isPositive: true,
          },
        ],
        warrantyTitle: "Syarat & Ketentuan",
        warrantyPoints: [
          "Garansi aktif sesuai durasi paket yang Anda beli.",
          "Klaim lewat halaman pesanan dengan menyertakan nomor invoice.",
        ],
        notesTitle: "Catatan",
        notesPoints: [
          "Pesanan diproses otomatis 24 jam.",
          "Kendala aktivasi? Hubungi CS kami dengan menyertakan kode transaksi.",
        ],
      };
    } else if (slug.includes("canva")) {
      content = {
        importantItems: [
          {
            text: "Canva Pro legal resmi dengan akses 100+ juta aset premium",
            isPositive: true,
          },
          {
            text: "Fitur Magic Resize, Background Remover, dan AI Generator aktif",
            isPositive: true,
          },
          {
            text: "Cukup gunakan email Canva pribadi Anda (tanpa perlu password)",
            isPositive: true,
          },
          {
            text: "Desain Anda bersifat pribadi dan tidak dapat dilihat anggota tim lain",
            isPositive: true,
          },
          {
            text: "Jangan melanggar Terms of Service resmi Canva",
            isPositive: false,
          },
          {
            text: "Akses undangan dikirim otomatis instan via Web & Email setelah bayar",
            isPositive: true,
          },
        ],
        warrantyTitle: "Syarat & Ketentuan",
        warrantyPoints: [
          "Garansi penuh selama durasi langganan varian aktif.",
          "Garansi invite ulang jika terjadi kendala pada workspace.",
        ],
        notesTitle: "Catatan",
        notesPoints: [
          "Cukup klik tautan undangan yang dikirimkan untuk langsung aktif.",
          "Kendala? Hubungi admin dengan menyertakan nomor invoice.",
        ],
      };
    } else if (slug.includes("capcut")) {
      content = {
        importantItems: [
          {
            text: isPrivate
              ? "Akun CapCut Pro Private – khusus untuk Anda sendiri"
              : "Akun CapCut Pro sharing – dipakai bersama",
            isPositive: true,
          },
          {
            text: "Akses seluruh filter pro, efek eksklusif, dan auto-caption bahasa Indonesia",
            isPositive: true,
          },
          {
            text: "Export video hingga resolusi 4K tanpa watermark",
            isPositive: true,
          },
          {
            text: "Jangan ubah password, email, atau pengaturan keamanan akun",
            isPositive: false,
          },
          {
            text: "Bisa di HP (Android & iPhone) serta Laptop/PC",
            isPositive: true,
          },
          {
            text: "Kredensial login dikirim otomatis setelah pembayaran sukses",
            isPositive: true,
          },
        ],
        warrantyTitle: "Syarat & Ketentuan",
        warrantyPoints: [
          "Garansi mengikuti keterangan tiap varian.",
          "Klaim lewat halaman pesanan dengan kode transaksi.",
        ],
        notesTitle: "Catatan",
        notesPoints: [
          "Pesanan diproses otomatis 24 jam.",
          "Kendala? Hubungi admin dengan menyertakan kode transaksi.",
        ],
      };
    } else {
      // General Akun Premium (ChatGPT, Gemini, Alight Motion, etc.)
      content = {
        importantItems: [
          {
            text: isPrivate
              ? "Akun Private – khusus pemakaian pribadi Anda"
              : "Akun sharing – dipakai bersama secara aman",
            isPositive: true,
          },
          {
            text: isPrivate
              ? "Bebas atur preferensi akun Anda sendiri"
              : "Hanya pakai profil / session yang telah ditentukan",
            isPositive: isPrivate,
          },
          {
            text: "Jangan ubah password, email, atau profil akun",
            isPositive: false,
          },
          {
            text: "Bisa di HP, laptop, tablet & browser",
            isPositive: true,
          },
          {
            text: "Dikirim otomatis setelah bayar",
            isPositive: true,
          },
        ],
        warrantyTitle: "Syarat & Ketentuan",
        warrantyPoints: [
          "Garansi mengikuti keterangan durasi tiap varian.",
          "Klaim lewat halaman pesanan dengan kode transaksi.",
        ],
        notesTitle: "Catatan",
        notesPoints: [
          "Pesanan diproses otomatis 24 jam.",
          "Kendala? Hubungi admin dengan menyertakan kode transaksi.",
        ],
      };
    }
  } else if (category === "game-topup") {
    // Game Top Up (Mobile Legends, Free Fire, Magic Chess, HOK, PUBG, etc.)
    content = {
      importantItems: [
        {
          text: "100% Legal & Resmi Publisher (Direct In-Game Delivery)",
          isPositive: true,
        },
        {
          text: "Injeksi otomatis langsung masuk ke ID akun Anda secara instan",
          isPositive: true,
        },
        {
          text: "Pastikan User ID dan Server/Zone ID sudah benar dan terverifikasi",
          isPositive: true,
        },
        {
          text: "Tidak perlu password, login, atau data pribadi akun Anda",
          isPositive: false,
        },
        {
          text: "Aman dari resiko minus atau banned (100% terproteksi)",
          isPositive: true,
        },
        {
          text: "Diproses otomatis 24 jam nonstop tanpa antre",
          isPositive: true,
        },
      ],
      warrantyTitle: "Syarat & Ketentuan",
      warrantyPoints: [
        "Saldo diamond / item in-game dijamin 100% masuk atau saldo kembali.",
        "Klaim kendala lewat halaman pesanan atau struk dengan nomor invoice.",
      ],
      notesTitle: "Catatan",
      notesPoints: [
        "Pesanan normal masuk dalam 1 - 60 detik.",
        "Jika ada event besar publisher / antrian server, estimasi 5 - 15 menit.",
        "Kendala? Hubungi admin CS dengan menyertakan kode transaksi.",
      ],
    };
  } else if (category === "voucher-digital") {
    // Voucher Digital
    content = {
      importantItems: [
        {
          text: "Kode voucher 100% baru, original & belum pernah di-redeem",
          isPositive: true,
        },
        {
          text: "Kode langsung tampil di halaman struk & terkirim ke email Anda",
          isPositive: true,
        },
        {
          text: "Pastikan region akun Anda sesuai dengan ketentuan voucher",
          isPositive: true,
        },
        {
          text: "Kode yang telah dibeli tidak dapat ditukar atau di-refund",
          isPositive: false,
        },
        {
          text: "Redeem langsung pada aplikasi / platform resmi terkait",
          isPositive: true,
        },
      ],
      warrantyTitle: "Syarat & Ketentuan",
      warrantyPoints: [
        "Garansi kode valid 100% saat pertama kali di-redeem.",
        "Klaim kendala lewat halaman pesanan dengan nomor invoice resmi.",
      ],
      notesTitle: "Catatan",
      notesPoints: [
        "Pesanan diproses otomatis 24 jam nonstop.",
        "Kendala? Hubungi admin dengan menyertakan kode transaksi.",
      ],
    };
  } else {
    // Pulsa & E-Wallet / Default
    content = {
      importantItems: [
        {
          text: "Produk resmi langsung dari provider telekomunikasi & PPOB",
          isPositive: true,
        },
        {
          text: "Saldo / pulsa otomatis masuk langsung ke nomor tujuan Anda",
          isPositive: true,
        },
        {
          text: "Pastikan nomor tujuan aktif dan tidak salah satu digit pun",
          isPositive: true,
        },
        {
          text: "Kesalahan input nomor tujuan oleh pembeli tidak dapat dibatalkan",
          isPositive: false,
        },
        {
          text: "Dilengkapi Serial Number (SN) resmi sebagai bukti pengisian",
          isPositive: true,
        },
      ],
      warrantyTitle: "Syarat & Ketentuan",
      warrantyPoints: [
        "Garansi pengisian berhasil dengan bukti SN provider resmi.",
        "Klaim kendala lewat halaman pesanan dengan nomor transaksi.",
      ],
      notesTitle: "Catatan",
      notesPoints: [
        "Pesanan diproses otomatis 24 jam.",
        "Kendala? Hubungi admin dengan menyertakan kode transaksi.",
      ],
    };
  }

  return (
    <div className="mt-4 space-y-3 font-[var(--font-hanken)]">
      {/* 1. KOTAK UTAMA: Penting Sebelum Beli (Sesuai Gambar 1) */}
      <div className="bg-[#181822] dark:bg-[#161622] border-2 border-carbon dark:border-[#38384a] rounded-2xl p-4 sm:p-5 text-white shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2 mb-3.5">
          <Info className="w-4 h-4 text-white shrink-0" />
          <h4 className="text-xs sm:text-sm font-black text-white tracking-wide">
            Penting sebelum beli
          </h4>
        </div>

        <ul className="space-y-2 text-xs font-bold">
          {content.importantItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
              {item.isPositive ? (
                <span className="text-[#55db9c] font-black shrink-0 text-sm leading-none mt-0.5">
                  ✓
                </span>
              ) : (
                <span className="text-[#ffd731] font-black shrink-0 text-sm leading-none mt-0.5">
                  ✕
                </span>
              )}
              <span className="text-gray-200">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. ACCORDION / EXPANDABLE: Syarat & Ketentuan + Catatan (Sesuai Gambar 2) */}
      {isOpen && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Box Syarat & Ketentuan (Border Kuning Gold) */}
          <div className="bg-[#181822]/90 dark:bg-[#161622]/90 border border-[#ffd731]/50 rounded-2xl p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-2 text-[#ffd731]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <h4 className="text-xs sm:text-sm font-black tracking-wide">
                {content.warrantyTitle}
              </h4>
            </div>

            <div className="text-xs font-bold space-y-1.5 pl-6">
              <span className="text-gray-300 block font-black">Garansi:</span>
              <ul className="space-y-1 list-disc pl-3 text-gray-300">
                {content.warrantyPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Box Catatan (Border Biru Langit) */}
          <div className="bg-[#181822]/90 dark:bg-[#161622]/90 border border-[#38bdf8]/50 rounded-2xl p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-2 text-[#38bdf8]">
              <Info className="w-4 h-4 shrink-0" />
              <h4 className="text-xs sm:text-sm font-black tracking-wide">
                {content.notesTitle}
              </h4>
            </div>

            <ul className="text-xs font-bold space-y-1 list-disc pl-9 text-gray-300">
              {content.notesPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tombol Tutup / Lihat Selengkapnya (Persis di gambar user "Tutup ^") */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-black text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer pt-1"
      >
        <span>{isOpen ? "Tutup" : "Lihat Syarat & Ketentuan Lengkap"}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
