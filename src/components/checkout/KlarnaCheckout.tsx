"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/lib/siteConfig";
import { Loader2 } from "lucide-react";

export function KlarnaCheckout() {
  const { items, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [htmlSnippet, setHtmlSnippet] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateSession = async () => {
    if (!postalCode && deliveryMethod === "delivery") {
      setError("Syötä postinumero");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        products: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        postal_code: postalCode,
        delivery_method: deliveryMethod
      };

      const res = await fetch(`${siteConfig.apiUrl}/api/v1/checkout/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Virhe kassalle siirtymisessä");
      }

      const data = await res.json();
      setHtmlSnippet(data.html_snippet);
      setShippingCost(data.shipping_cost);
      setGrandTotal(data.total_amount);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Jokin meni pieleen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (htmlSnippet && containerRef.current) {
      const container = containerRef.current;
      container.innerHTML = htmlSnippet;

      const scripts = container.getElementsByTagName("script");
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        const newScript = document.createElement("script");
        if (script.src) {
          newScript.src = script.src;
          newScript.async = true;
        } else {
          newScript.innerHTML = script.innerHTML;
        }
        document.body.appendChild(newScript);
      }
    }
  }, [htmlSnippet]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-slate-900">Ostoskori on tyhjä</h2>
        <p className="text-slate-500 mt-2">Lisää tuotteita jatkaaksesi kassalle.</p>
      </div>
    );
  }

  if (htmlSnippet) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-3">Tilauksen yhteenveto</h3>
            <div className="flex justify-between text-sm mb-2">
                <span>Välisumma</span>
                <span>{cartTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
                <span>Toimitus</span>
                <span>{shippingCost?.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-2">
                <span>Yhteensä</span>
                <span>{grandTotal?.toFixed(2)} €</span>
            </div>
        </div>
        <div ref={containerRef} id="klarna-checkout-container" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold mb-6">Kassa</h2>
      
      <div className="space-y-6">
        {/* Delivery Method Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Toimitustapa</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setDeliveryMethod("delivery")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                deliveryMethod === "delivery"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="block font-medium">Kotiinkuljetus</span>
              <span className="text-sm text-slate-500">Toimituskulut lasketaan postinumeron perusteella</span>
            </button>
            <button
              onClick={() => setDeliveryMethod("pickup")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                deliveryMethod === "pickup"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="block font-medium">Nouto</span>
              <span className="text-sm text-slate-500">Ilmainen</span>
              <span className="block text-xs text-slate-400 mt-1">Niittyläntie 3, 00620 Helsinki</span>
            </button>
          </div>
        </div>

        {/* Postal Code Input (Only for Delivery) */}
        {deliveryMethod === "delivery" && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Postinumero</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="00100"
              className="w-full rounded-md border border-slate-300 p-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center text-lg font-medium">
            <span>Välisumma</span>
            <span>{cartTotal.toFixed(2)} €</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {deliveryMethod === "delivery" 
              ? "Toimituskulut lasketaan seuraavassa vaiheessa." 
              : "Nouto on ilmainen."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateSession}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ladataan...
            </>
          ) : (
            "Siirry maksamaan"
          )}
        </button>
      </div>
    </div>
  );
}
