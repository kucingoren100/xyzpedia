import { prisma } from "@/lib/prisma";
import {
  StoreAnnouncementsConfig,
  DEFAULT_STORE_ANNOUNCEMENTS,
} from "@/types/storeAnnouncements";

export * from "@/types/storeAnnouncements";

const SETTING_KEY = "store_announcements_config";

export async function getStoreAnnouncementsConfig(): Promise<StoreAnnouncementsConfig> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (!setting || !setting.value) {
      return DEFAULT_STORE_ANNOUNCEMENTS;
    }

    const parsed = JSON.parse(setting.value);
    return {
      marquee: {
        text: parsed.marquee?.text ?? DEFAULT_STORE_ANNOUNCEMENTS.marquee.text,
        isActive: parsed.marquee?.isActive ?? DEFAULT_STORE_ANNOUNCEMENTS.marquee.isActive,
      },
      popupAnnouncement: {
        isActive: Boolean(parsed.popupAnnouncement?.isActive),
        title: parsed.popupAnnouncement?.title || DEFAULT_STORE_ANNOUNCEMENTS.popupAnnouncement.title,
        message: parsed.popupAnnouncement?.message || DEFAULT_STORE_ANNOUNCEMENTS.popupAnnouncement.message,
        actionText: parsed.popupAnnouncement?.actionText || "Lihat Selengkapnya",
        actionUrl: parsed.popupAnnouncement?.actionUrl || "/katalog",
        autoCloseSeconds: Number(parsed.popupAnnouncement?.autoCloseSeconds) || 0,
      },
      popupAd: {
        isActive: Boolean(parsed.popupAd?.isActive),
        title: parsed.popupAd?.title || DEFAULT_STORE_ANNOUNCEMENTS.popupAd.title,
        subtitle: parsed.popupAd?.subtitle || "",
        description: parsed.popupAd?.description || DEFAULT_STORE_ANNOUNCEMENTS.popupAd.description,
        imageUrl: parsed.popupAd?.imageUrl || "",
        actionText: parsed.popupAd?.actionText || "Ambil Promo Sekarang",
        actionUrl: parsed.popupAd?.actionUrl || "/katalog",
        autoCloseSeconds: Number(parsed.popupAd?.autoCloseSeconds) || 0,
      },
    };
  } catch (error) {
    console.error("[getStoreAnnouncementsConfig] error:", error);
    return DEFAULT_STORE_ANNOUNCEMENTS;
  }
}

export async function saveStoreAnnouncementsConfig(
  config: Partial<StoreAnnouncementsConfig>
): Promise<StoreAnnouncementsConfig> {
  const current = await getStoreAnnouncementsConfig();
  const updated: StoreAnnouncementsConfig = {
    marquee: {
      ...current.marquee,
      ...(config.marquee || {}),
    },
    popupAnnouncement: {
      ...current.popupAnnouncement,
      ...(config.popupAnnouncement || {}),
    },
    popupAd: {
      ...current.popupAd,
      ...(config.popupAd || {}),
    },
  };

  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(updated) },
    create: { key: SETTING_KEY, value: JSON.stringify(updated) },
  });

  return updated;
}
