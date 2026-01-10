"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Loader2, Upload, X } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { compressImage } from "@/lib/imageUtils";

interface TradeRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
  };
  locale: string;
}

export function TradeRequestDialog({ isOpen, onClose, product, locale }: TradeRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Cleanup old previews
      previews.forEach(url => URL.revokeObjectURL(url));
      
      const compressedFiles = await Promise.all(
          files.map(file => compressImage(file, 1600, 0.9))
      );
      
      setSelectedFiles(compressedFiles);
      
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeFile = (index: number) => {
      const newFiles = [...selectedFiles];
      const newPreviews = [...previews];
      
      URL.revokeObjectURL(newPreviews[index]);
      
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      
      setSelectedFiles(newFiles);
      setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData();
    
    // Required fields matching API documentation
    formData.append("full_name", (form.elements.namedItem("name") as HTMLInputElement).value);
    formData.append("email", (form.elements.namedItem("email") as HTMLInputElement).value);
    formData.append("phone", (form.elements.namedItem("phone") as HTMLInputElement).value);
    formData.append("request_type", "trade");
    formData.append("product_id", product.id);
    formData.append("description", (form.elements.namedItem("description") as HTMLTextAreaElement).value);
    
    const estimatedValue = (form.elements.namedItem("value") as HTMLInputElement).value;
    if (estimatedValue) {
      formData.append("estimated_value", estimatedValue);
    }
    
    selectedFiles.forEach(file => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/trade-requests`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to submit trade request");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Trade request error:", err);
      setError(locale === "fi" ? "Virhe lähetyksessä. Yritä uudelleen." : "Error submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={locale === "fi" ? "Vaihtotarjous Vastaanotettu" : "Trade Offer Received"}>
        <div className="text-center">
          <div className="mb-4 text-emerald-600">
             <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mb-6 text-slate-600">
            {locale === "fi" 
              ? "Kiitos tarjouksestasi! Olemme vastaanottaneet vaihtotarjouksesi ja palaamme asiaan pian."
              : "Thank you for your offer! We have received your trade request and will get back to you soon."}
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
    <Modal isOpen={isOpen} onClose={onClose} title={locale === "fi" ? "Ehdota Vaihtoa" : "Propose Trade"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium">{locale === "fi" ? "Haluamasi tuote:" : "Desired product:"} {product.name}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                {locale === "fi" ? "Nimi" : "Name"}
            </label>
            <input
                type="text"
                name="name"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            </div>
            <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                {locale === "fi" ? "Puhelin" : "Phone"}
            </label>
            <input
                type="tel"
                name="phone"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            </div>
        </div>

        <div>
           <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            {locale === "fi" ? "Sähköposti" : "Email"}
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
                {locale === "fi" ? "Vaihdettavan tuotteen tiedot" : "Trade Item Details"}
            </h4>
            
            <div className="space-y-3">
                <div>
                    <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
                        {locale === "fi" ? "Kuvaus (Merkki, Malli, Kunto)" : "Description (Brand, Model, Condition)"}
                    </label>
                    <textarea
                        name="description"
                        required
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                <div>
                    <label htmlFor="value" className="mb-1 block text-sm font-medium text-slate-700">
                        {locale === "fi" ? "Arvioitu Arvo (€)" : "Estimated Value (€)"}
                    </label>
                    <input
                        type="number"
                        name="value"
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        {locale === "fi" ? "Lataa kuvat" : "Upload Images"}
                    </label>
                    <div className="w-full">
                      <label 
                        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 transition hover:bg-slate-100 hover:border-slate-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                            <div className="rounded-full bg-slate-200 p-3 mb-2">
                                <Upload className="h-6 w-6 text-slate-500" />
                            </div>
                            <p className="mb-1 text-sm text-slate-600 font-medium">
                                {locale === "fi" ? "Klikkaa valitaksesi kuvat" : "Click to select images"}
                            </p>
                            <p className="text-xs text-slate-400">PNG, JPG, WEBP</p>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                      </label>
                    </div>

                    {previews.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 group">
                                    <img src={src} alt="Preview" className="h-full w-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeFile(index)} 
                                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/70"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {locale === "fi" ? "Lähetä Vaihtotarjous" : "Send Trade Offer"}
        </button>
      </form>
    </Modal>
  );
}
