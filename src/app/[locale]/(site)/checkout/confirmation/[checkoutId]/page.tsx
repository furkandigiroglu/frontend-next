"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/lib/siteConfig";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage({ params }: { params: { checkoutId: string } }) {
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfirmation = async () => {
      try {
        const res = await fetch(`${siteConfig.apiUrl}/api/v1/checkout/confirmation/${params.checkoutId}`);
        if (!res.ok) {
          throw new Error("Failed to load order confirmation");
        }
        const data = await res.json();
        setOrderData(data);
        clearCart(); // Clear cart on successful confirmation
      } catch (err) {
        console.error(err);
        setError("Could not load order confirmation.");
      } finally {
        setLoading(false);
      }
    };

    if (params.checkoutId) {
      fetchConfirmation();
    }
  }, [params.checkoutId, clearCart]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-slate-900 mb-4" />
          <p className="text-slate-500">Verifying your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Thank you for your order!</h1>
        <p className="text-slate-500 mb-8">
          Your order has been confirmed. We've sent a confirmation email to {orderData?.billing_address?.email}.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 text-left max-w-lg mx-auto">
          <div className="flex justify-between mb-4 pb-4 border-b border-slate-200">
            <span className="text-slate-600">Order Reference</span>
            <span className="font-mono font-medium text-slate-900">{orderData?.klarna_order_id}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-slate-600">Total Amount</span>
            <span className="font-medium text-slate-900">{(orderData?.order_amount / 100).toFixed(2)} €</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-600">Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {orderData?.status}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link 
          href="/"
          className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
