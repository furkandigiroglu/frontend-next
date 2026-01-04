"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export function WhatsAppFloat() {
  const phone = siteConfig.phone.replace(/[^0-9]/g, "");
  
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  );
}
