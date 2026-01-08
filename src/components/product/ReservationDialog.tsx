"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Loader2 } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

interface ReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
  };
  locale: string;
}

export function ReservationDialog({ isOpen, onClose, product, locale }: ReservationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [expirationDate, setExpirationDate] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      product_id: product.id,
      customer_name: formData.get("name"),
      customer_email: formData.get("email"),
      customer_phone: formData.get("phone"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch(`/api/v1/reservations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.detail || "Failed to submit reservation");
      }

      if (resData.expires_at) {
        setExpirationDate(resData.expires_at);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || (locale === "fi" ? "Virhe lähetyksessä. Yritä uudelleen." : "Error submitting. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={locale === "fi" ? "Varauspyyntö lähetetty" : "Reservation Request Sent"}>
        <div className="text-center">
          <div className="mb-4 text-emerald-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mb-6 text-slate-600">
            {locale === "fi" 
              ? "Varauspyyntösi on vastaanotettu. Käsittelemme pyyntösi ja olemme sinuun yhteydessä mahdollisimman pian."
              : "Your reservation request has been received. We will evaluate your request and contact you shortly."}
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            {locale === "fi" ? "Sulje" : "Close"}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locale === "fi" ? "Tee Varaus" : "Make Reservation"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">{product.name}</p>
        </div>
        
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            {locale === "fi" ? "Nimi" : "Name"}
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            {locale === "fi" ? "Sähköposti" : "Email"}
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            {locale === "fi" ? "Puhelinnumero" : "Phone"}
          </label>
          <input
            type="tel"
            name="phone"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div>
           <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">
            {locale === "fi" ? "Viesti (valinnainen)" : "Message (optional)"}
          </label>
          <textarea
            name="message"
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {locale === "fi" ? "Vahvista Varaus" : "Confirm Reservation"}
        </button>
      </form>
    </Modal>
  );
}
