"use client";

import { useState } from "react";
import { ShippingRules } from "@/components/dashboard/shipping/ShippingRules";
import { ShippingZones } from "@/components/dashboard/shipping/ShippingZones";
import { cn } from "@/lib/utils";
import { Settings, Map } from "lucide-react";

export default function ShippingPage({ params: { locale } }: { params: { locale: string } }) {
  const [activeTab, setActiveTab] = useState<"rules" | "zones">("rules");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Shipping Management</h1>
        <p className="text-slate-500 mt-1">
          Configure shipping methods, pricing rules, and delivery zones.
        </p>
      </div>

      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-8 w-fit">
        <button
          onClick={() => setActiveTab("rules")}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg py-2.5 px-6 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
            activeTab === "rules"
              ? "bg-white text-slate-900 shadow"
              : "text-slate-600 hover:bg-white/[0.12] hover:text-slate-800"
          )}
        >
          <Settings className="w-4 h-4" />
          Shipping Rules
        </button>
        <button
          onClick={() => setActiveTab("zones")}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg py-2.5 px-6 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
            activeTab === "zones"
              ? "bg-white text-slate-900 shadow"
              : "text-slate-600 hover:bg-white/[0.12] hover:text-slate-800"
          )}
        >
          <Map className="w-4 h-4" />
          Delivery Zones
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "rules" ? (
          <ShippingRules locale={locale} />
        ) : (
          <ShippingZones locale={locale} />
        )}
      </div>
    </div>
  );
}
