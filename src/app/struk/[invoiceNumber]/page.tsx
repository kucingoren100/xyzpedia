import { getOrderDetails } from "@/app/actions/order";
import { notFound } from "next/navigation";
import StrukClient from "./StrukClient";
import { fetchGameNickname } from "@/lib/gameNickname";

interface StrukPageProps {
  params: Promise<{ invoiceNumber: string }>;
}

export const dynamic = "force-dynamic";

export default async function StrukPage({ params }: StrukPageProps) {
  const { invoiceNumber } = await params;
  const order = await getOrderDetails(invoiceNumber);

  if (!order) {
    notFound();
  }

  // 1. Try extracting nickname from SN or notes
  let nickname: string | null = null;
  const rawSn = (order as any).sn;
  if (rawSn && typeof rawSn === "string") {
    const nickMatch = rawSn.match(/^([^\.\n]+)\.\s*Refid/i);
    if (nickMatch) {
      nickname = nickMatch[1].trim();
    }
  }

  // 2. If nickname not in notes, automatically fetch from game server
  if (!nickname && (order.product.categorySlug === "game-topup" || order.targetUserId)) {
    try {
      nickname = await fetchGameNickname(
        order.targetUserId,
        order.targetZoneId,
        order.product.slug
      );
    } catch {
      // Ignore lookup failure
    }
  }

  return <StrukClient order={order} initialNickname={nickname} />;
}
