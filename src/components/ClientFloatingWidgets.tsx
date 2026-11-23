"use client";

import dynamic from "next/dynamic";

const FloatingWhatsApp = dynamic(() => import("@/components/FloatingWhatsApp"), {
  ssr: false,
});
const StoreAnnouncementModal = dynamic(
  () => import("@/components/StoreAnnouncementModal"),
  { ssr: false }
);
const RecentOrdersTicker = dynamic(
  () => import("@/components/RecentOrdersTicker"),
  { ssr: false }
);

export default function ClientFloatingWidgets() {
  return (
    <>
      <FloatingWhatsApp />
      <StoreAnnouncementModal />
      <RecentOrdersTicker />
    </>
  );
}
