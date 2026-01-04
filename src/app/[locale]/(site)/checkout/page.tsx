"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [htmlSnippet, setHtmlSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID missing");
      setLoading(false);
      return;
    }

    const fetchCheckoutSnippet = async () => {
      try {
        // Note: Backend endpoint is /checkout/<order_id>
        const res = await fetch(`${siteConfig.apiUrl}/checkout/${orderId}`);
        if (!res.ok) {
          throw new Error("Failed to load checkout");
        }
        const data = await res.json();
        setHtmlSnippet(data.html_snippet);
      } catch (err) {
        console.error(err);
        setError("Could not load checkout. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutSnippet();
  }, [orderId]);

  useEffect(() => {
    // When snippet is loaded, we need to execute any scripts in it
    if (htmlSnippet) {
      const container = document.getElementById("klarna-checkout-container");
      if (container) {
        container.innerHTML = htmlSnippet;
        const scripts = container.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          const newScript = document.createElement("script");
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.innerHTML = script.innerHTML;
          }
          document.body.appendChild(newScript);
        }
      }
    }
  }, [htmlSnippet]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div id="klarna-checkout-container" className="mx-auto max-w-3xl" />
    </div>
  );
}
