import { getOrderDetails } from "@/app/actions/order";
import { notFound } from "next/navigation";
import StrukClient from "./StrukClient";

interface StrukPageProps {
  params: Promise<{ invoiceNumber: string }>;
}

export default async function StrukPage({ params }: StrukPageProps) {
  const { invoiceNumber } = await params;
  const order = await getOrderDetails(invoiceNumber);

  if (!order) {
    notFound();
  }

  return <StrukClient order={order} />;
}
