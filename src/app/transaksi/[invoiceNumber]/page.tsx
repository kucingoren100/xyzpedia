import { getOrderDetails } from "@/app/actions/order";
import { notFound } from "next/navigation";
import TransactionViewClient from "@/components/TransactionViewClient";

interface TransactionPageProps {
  params: Promise<{ invoiceNumber: string }>;
}

export default async function TransactionPage({ params }: TransactionPageProps) {
  const { invoiceNumber } = await params;
  const order = await getOrderDetails(invoiceNumber);

  if (!order) {
    notFound();
  }

  return <TransactionViewClient initialOrder={order} />;
}
