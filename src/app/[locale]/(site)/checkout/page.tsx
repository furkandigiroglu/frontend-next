"use client";

import { Suspense } from "react";
import { KlarnaCheckout } from "@/components/checkout/KlarnaCheckout";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <KlarnaCheckout />
      </Suspense>
    </div>
  );
}
