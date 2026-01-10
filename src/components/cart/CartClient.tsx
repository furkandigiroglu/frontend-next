"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Minus, Plus, ArrowRight, Store, Truck, AlertTriangle, XCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

export function CartClient({ locale }: { locale: string }) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, cartTotal } = useCart();
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "home">("pickup");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
    firstName: "",
    lastName: ""
  });
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Calculate shipping when postal code changes (if home delivery is selected)
  const calculateShipping = async (postalCode: string) => {
    if (postalCode.length !== 5) {
      setShippingCost(null);
      return;
    }
    
    setShippingLoading(true);
    try {
      // Try to use the new shipping API
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postal_code: postalCode,
          product_ids: items.map(i => i.product.id)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.available) {
          setShippingCost(Number(data.total_cost));
          setShippingError(null);
        } else {
          setShippingError(data.message || "Toimitus ei ole saatavilla tähän osoitteeseen.");
        }
      } else {
        // Fallback to static fee if API not ready
        console.warn("Shipping API not available, using static fee");
        setShippingCost(20);
        setShippingError(null);
      }
    } catch (error) {
      console.error("Shipping calculation error:", error);
      setShippingError(locale === "fi" 
        ? "Toimitushinnan laskenta epäonnistui. Yritä uudelleen."
        : "Failed to calculate shipping. Please try again.");
      setShippingCost(null);
    } finally {
      setShippingLoading(false);
    }
  };

  // Update shipping cost when option changes
  const handleDeliveryOptionChange = (option: "pickup" | "home") => {
    setDeliveryOption(option);
    if (option === "pickup") {
      setShippingCost(0);
      setShippingError(null);
    } else {
      // If we already have a postal code, recalculate
      if (address.postalCode.length === 5) {
        calculateShipping(address.postalCode);
      } else {
        setShippingCost(null); // Will show "enter postal code"
        setShippingError(null);
      }
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress({ ...address, postalCode: val });
    if (deliveryOption === "home") {
      calculateShipping(val);
    }
  };

  const deliveryFee = deliveryOption === "pickup" ? 0 : (shippingCost ?? 0);
  const total = cartTotal + deliveryFee;
  const canCheckout = deliveryOption === "pickup" || (shippingCost !== null && !shippingError);

  const formatPrice = (price: number) =>
    price.toLocaleString(locale === "fi" ? "fi-FI" : "en-US", {
      style: "currency",
      currency: "EUR",
    });

  const handleCheckout = async () => {
    if (deliveryOption === "home" && (!address.street || !address.city || !address.postalCode || !address.phone)) {
      alert(locale === "fi" ? "Täytä kaikki osoitetiedot." : "Please fill in all address fields.");
      return;
    }
    
    if (shippingError) {
      alert(shippingError);
      return;
    }

    // Redirect to checkout page where Klarna session will be created
    const queryParams = new URLSearchParams();
    if (address.postalCode) queryParams.set("postal_code", address.postalCode);
    if (deliveryOption) queryParams.set("delivery_method", deliveryOption === "home" ? "delivery" : "pickup");
    
    router.push(`/${locale}/checkout?${queryParams.toString()}`);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {locale === "fi" ? "Ostoskori" : "Shopping Cart"}
        </h1>
        <p className="mt-4 text-slate-500">
          {locale === "fi" ? "Ostoskorisi on tyhjä." : "Your cart is empty."}
        </p>
        <div className="mt-6">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {locale === "fi" ? "Jatka ostoksia" : "Continue Shopping"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {locale === "fi" ? "Ostoskori" : "Shopping Cart"}
        </h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul role="list" className="divide-y divide-slate-200 border-b border-t border-slate-200">
              {items.map(({ product, quantity }) => {
                const price = Number(product.sale_price || product.regular_price || 0);
                const image = product.files?.[0]
                  ? `http://185.96.163.183:8000/api/v1/storage/${product.files[0].namespace}/${product.files[0].entity_id}/${product.files[0].filename}`
                  : null;

                return (
                  <li key={product.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      {image ? (
                        <div className="relative h-24 w-24 rounded-md object-cover sm:h-48 sm:w-48 overflow-hidden">
                           <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-md bg-slate-100 sm:h-48 sm:w-48" />
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <Link href={`/${locale}/products/${product.category_id || 'category'}/${product.slug_translations?.[locale as 'fi'|'en'] || product.slug_translations?.['fi'] || 'slug'}`} className="font-medium text-slate-700 hover:text-slate-800">
                                {product.name}
                              </Link>
                            </h3>
                          </div>
                          <div className="mt-1 flex text-sm">
                            <p className="text-slate-500">{product.brand}</p>
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-900">{formatPrice(price)}</p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <label htmlFor={`quantity-${product.id}`} className="sr-only">
                            Quantity, {product.name}
                          </label>
                          <div className="flex items-center rounded-md border border-slate-300 max-w-[100px]">
                            <button
                              type="button"
                              className="p-2 text-slate-600 hover:text-slate-900"
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="flex-1 text-center text-sm">{quantity}</span>
                            <button
                              type="button"
                              className="p-2 text-slate-600 hover:text-slate-900"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="absolute right-0 top-0">
                            <button
                              type="button"
                              className="-m-2 inline-flex p-2 text-slate-400 hover:text-slate-500"
                              onClick={() => removeItem(product.id)}
                            >
                              <span className="sr-only">Remove</span>
                              <Trash2 className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-slate-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" className="text-lg font-medium text-slate-900">
              {locale === "fi" ? "Tilauksen yhteenveto" : "Order summary"}
            </h2>

            {/* Delivery Options */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                {locale === "fi" ? "Toimitustapa" : "Delivery Method"}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  className={cn(
                    "relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none",
                    deliveryOption === "pickup"
                      ? "border-slate-600 ring-1 ring-slate-600"
                      : "border-slate-300"
                  )}
                  onClick={() => handleDeliveryOptionChange("pickup")}
                >
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-slate-900">
                        <Store className="mb-2 h-5 w-5" />
                        {locale === "fi" ? "Nouto" : "Pickup"}
                      </span>
                      <span className="mt-1 flex items-center text-sm text-slate-500">
                        {locale === "fi" ? "Ilmainen" : "Free"}
                      </span>
                      <span className="mt-6 text-xs text-slate-500">
                        Niittyläntie 3, 00620 Helsinki
                      </span>
                    </span>
                  </span>
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center",
                      deliveryOption === "pickup"
                        ? "border-slate-600 bg-slate-600"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {deliveryOption === "pickup" && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </div>

                <div
                  className={cn(
                    "relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none",
                    deliveryOption === "home"
                      ? "border-slate-600 ring-1 ring-slate-600"
                      : "border-slate-300"
                  )}
                  onClick={() => handleDeliveryOptionChange("home")}
                >
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-slate-900">
                        <Truck className="mb-2 h-5 w-5" />
                        {locale === "fi" ? "Toimitus" : "Delivery"}
                      </span>
                      <span className="mt-1 flex items-center text-sm text-slate-500">
                        {shippingError ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            {locale === "fi" ? "Ei saatavilla" : "Not available"}
                          </span>
                        ) : shippingLoading ? (
                          <span className="text-slate-400">
                            {locale === "fi" ? "Lasketaan..." : "Calculating..."}
                          </span>
                        ) : shippingCost === null ? (
                          <span className="text-slate-400 text-xs">
                            {locale === "fi" ? "Syötä postinumero" : "Enter postal code"}
                          </span>
                        ) : shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">
                            {locale === "fi" ? "Ilmainen" : "Free"}
                          </span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                      <span className="mt-6 text-xs text-slate-500">
                        {locale === "fi" ? "Kotiinkuljetus" : "Home Delivery"}
                      </span>
                    </span>
                  </span>
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center",
                      deliveryOption === "home"
                        ? "border-slate-600 bg-slate-600"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {deliveryOption === "home" && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Address Form */}
            {deliveryOption === "home" && (
              <div className="mt-6 space-y-4 border-t border-slate-200 pt-6 animate-in slide-in-from-top-2 fade-in duration-300">
                <h3 className="text-sm font-medium text-slate-900">
                  {locale === "fi" ? "Toimitusosoite" : "Delivery Address"}
                </h3>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-slate-700">
                    {locale === "fi" ? "Katuosoite" : "Street Address"}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2 border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700">
                      {locale === "fi" ? "Postinumero" : "Postal Code"}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="postalCode"
                        value={address.postalCode}
                        onChange={handlePostalCodeChange}
                        maxLength={5}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-700">
                      {locale === "fi" ? "Postitoimipaikka" : "City"}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    {locale === "fi" ? "Puhelinnumero" : "Phone Number"}
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="phone"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2 border"
                    />
                  </div>
                </div>
                {shippingError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          {locale === "fi" ? "Toimitus ei saatavilla" : "Delivery not available"}
                        </h3>
                        <p className="text-sm text-red-700 mt-1">{shippingError}</p>
                        <p className="text-xs text-red-600 mt-2">
                          {locale === "fi" 
                            ? "Voit valita nouto-vaihtoehdon tai ottaa yhteyttä asiakaspalveluun."
                            : "You can choose pickup option or contact customer service."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <dl className="mt-6 space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-600">
                  {locale === "fi" ? "Välisumma" : "Subtotal"}
                </dt>
                <dd className="text-sm font-medium text-slate-900">{formatPrice(cartTotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-600">
                  {locale === "fi" ? "Toimitus" : "Delivery"}
                </dt>
                <dd className="text-sm font-medium text-slate-900">
                  {deliveryOption === "pickup" ? (
                    locale === "fi" ? "Ilmainen" : "Free"
                  ) : shippingCost === null ? (
                    <span className="text-slate-400">
                      {locale === "fi" ? "Syötä postinumero" : "Enter postal code"}
                    </span>
                  ) : shippingCost === 0 ? (
                    <span className="text-green-600">{locale === "fi" ? "Ilmainen" : "Free"}</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <dt className="text-base font-medium text-slate-900">
                  {locale === "fi" ? "Yhteensä" : "Total"}
                </dt>
                <dd className="text-base font-medium text-slate-900">{formatPrice(total)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || !canCheckout}
                className="w-full rounded-md border border-transparent bg-slate-900 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (locale === "fi" ? "Käsitellään..." : "Processing...") 
                  : !canCheckout && deliveryOption === "home"
                    ? (locale === "fi" ? "Syötä postinumero" : "Enter postal code")
                    : (locale === "fi" ? "Siirry kassalle" : "Checkout")}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
