import { Suspense } from "react";
import { OrdersAdmin } from "@/components/admin/orders-admin";
import { Skeleton } from "@/components/ui/primitives";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <OrdersAdmin />
    </Suspense>
  );
}
