export interface MarqueeSetting {
  text: string;
  isActive: boolean;
}

export interface PopupAnnouncementSetting {
  isActive: boolean;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  autoCloseSeconds: number; // e.g. 8 (0 = manual only)
}

export interface PopupAdSetting {
  isActive: boolean;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl?: string;
  actionText: string;
  actionUrl: string;
  autoCloseSeconds: number; // e.g. 10 (0 = manual only)
}

export interface StoreAnnouncementsConfig {
  marquee: MarqueeSetting;
  popupAnnouncement: PopupAnnouncementSetting;
  popupAd: PopupAdSetting;
}

export const DEFAULT_STORE_ANNOUNCEMENTS: StoreAnnouncementsConfig = {
  marquee: {
    text: "⚡ PROSES OTOMATIS INSTAN 24/7 ✦ 100% API RESMI PUBLISHER ✦ CHECKOUT LANGSUNG (TANPA PERLU LOGIN) ✦ QRIS 0% BIAYA ADMIN ✦ PENGIRIMAN KILAT DI BAWAH 5 DETIK",
    isActive: true,
  },
  popupAnnouncement: {
    isActive: false,
    title: "Pengumuman Resmi XYZPEDIA",
    message: "Selamat datang di XYZPEDIA! Nikmati promo spesial dan layanan top up & langganan instan 24 jam nonstop.",
    actionText: "Lihat Selengkapnya",
    actionUrl: "/katalog",
    autoCloseSeconds: 8,
  },
  popupAd: {
    isActive: false,
    title: "PROMO SPESIAL AKUN PREMIUM",
    subtitle: "HEMAT HINGGA 70% HARI INI",
    description: "Dapatkan akses Netflix 4K UHD, Spotify Premium & YouTube Premium dengan harga termurah dan garansi penuh!",
    imageUrl: "",
    actionText: "Ambil Promo Sekarang",
    actionUrl: "/katalog",
    autoCloseSeconds: 10,
  },
};
