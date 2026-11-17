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

  // 1. Try extracting nickname from order notes / SN
  let nickname: string | null = null;
  if (order.notes) {
    const snMatch = order.notes.match(/SN:\s*(.+?)(?:\s*\||\n|$)/i);
    const snText = snMatch ? snMatch[1].trim() : order.notes;
    const nickMatch = snText.match(/^([^\.\n]+)\.\s*Refid/i);
    if (nickMatch) {
      nickname = nickMatch[1].trim();
    } else {
      const directNickMatch = order.notes.match(/Nickname:\s*([^\s|]+)/i);
      if (directNickMatch) {
        nickname = directNickMatch[1].trim();
      }
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
