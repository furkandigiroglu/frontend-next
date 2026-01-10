"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X, Check, Image as ImageIcon } from "lucide-react";
import { Dictionary } from "@/types/dictionary";
import { compressImage } from "@/lib/imageUtils";

// Types
import { StoredFile } from "@/types/product";

interface SellDonateFormProps {
  locale: string;
  dict: Dictionary; // Adjust type if needed to specific section keys or use any for now
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  productName: z.string().min(3, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SellDonateForm({ locale, dict }: SellDonateFormProps) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      productName: "",
      description: "",
      price: "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        alert(locale === "fi" ? "Enintään 5 kuvaa sallittu" : "Max 5 images allowed");
        return;
      }

      // Compress images before setting state
      const processedImages = await Promise.all(
        newFiles.map(async (file) => {
          try {
            // 1600px width, 90% quality -> High detail for furniture
            const compressed = await compressImage(file, 1600, 0.9);
            return {
              file: compressed,
              preview: URL.createObjectURL(compressed),
            };
          } catch (err) {
            console.error("Compression failed for", file.name, err);
            // Fallback to original
            return {
              file,
              preview: URL.createObjectURL(file),
            };
          }
        })
      );

      setImages((prev) => [...prev, ...processedImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("customer_name", data.name);
      formData.append("customer_email", data.email);
      formData.append("customer_phone", data.phone);
      
      // Combine product name and description since backend expects one description field
      formData.append("trade_product_description", `Product: ${data.productName}\n${data.description}`);
      
      if (data.price) {
        formData.append("trade_product_estimated_value", data.price);
      }

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      // Use the correct endpoint for trade requests (handling sell/donate)
      const response = await fetch("http://185.96.163.183:8000/api/v1/trade-requests", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setSuccess(true);
      reset();
      setImages([]);
    } catch (err) {
      console.error(err);
      setError(locale === "fi" ? "Lähetys epäonnistui. Yritä uudelleen." : "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-100">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          {locale === "fi" ? "Kiitos ilmoituksestasi!" : "Thank You!"}
        </h2>
        <p className="mb-8 text-slate-600">
          {locale === "fi"
            ? "Olemme vastaanottaneet tietosi. Tiimimme tarkistaa tuotteen ja on sinuun yhteydessä mahdollisimman pian."
            : "We have received your request. Our team will review the product and contact you shortly."}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="rounded-full bg-slate-900 px-8 py-3 font-medium text-white transition hover:bg-slate-800"
        >
          {locale === "fi" ? "Lähetä uusi ilmoitus" : "Send Another Request"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm border border-slate-100 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Customer Info */}
          <div className="sm:col-span-2">
             <h3 className="mb-4 text-lg font-semibold text-slate-900 flex items-center gap-2">
                1. {locale === "fi" ? "Yhteystiedot" : "Contact Information"}
             </h3>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {locale === "fi" ? "Nimi" : "Name"} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.name ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  }`}
                />
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {locale === "fi" ? "Puhelin" : "Phone"} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.phone ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  }`}
                />
              )}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {locale === "fi" ? "Sähköposti" : "Email"} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.email ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  }`}
                />
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6"></div>

        {/* Product Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                2. {locale === "fi" ? "Tuotetiedot" : "Product Details"}
          </h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {locale === "fi" ? "Tuotteen nimi" : "Product Name"} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="productName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.productName ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  }`}
                />
              )}
            />
             {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName.message}</p>}
          </div>

           <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {locale === "fi" ? "Tuotteen kuvaus" : "Description"} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                    errors.description ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  }`}
                  placeholder={locale === "fi" ? "Kerro tuotteen kunnosta, iästä ja muista tärkeistä tiedoista..." : "Describe condition, age, etc..."}
                />
              )}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {locale === "fi" ? "Hintapyyntö (€) (Valinnainen)" : "Asking Price (€) (Optional)"}
            </label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              )}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {locale === "fi" ? "Kuvat (Max 5)" : "Images (Max 5)"}
            </label>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {images.map((img, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                        <img src={img.preview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                
                {images.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50">
                        <ImageIcon className="mb-2 h-6 w-6 text-slate-400" />
                        <span className="text-xs text-slate-500">{locale === "fi" ? "Lisää kuva" : "Add Image"}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
                    </label>
                )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-900 py-4 font-bold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            locale === "fi" ? "Lähetä Ilmoitus" : "Submit Request"
          )}
        </button>
      </form>
    </div>
  );
}
