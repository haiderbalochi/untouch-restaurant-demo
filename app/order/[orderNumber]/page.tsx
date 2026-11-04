import type { Metadata } from "next";
import { OrderTracker } from "@/components/order/order-tracker";

export const metadata: Metadata = {
  title: "Order tracking",
  description: "Track your UNTOUCH order from the pass to your door.",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <OrderTracker orderNumber={decodeURIComponent(orderNumber)} />;
}
