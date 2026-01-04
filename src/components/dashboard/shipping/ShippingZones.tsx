"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Map, Info, Loader2 } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

type PostalCodeRange = {
  postal_code_start: string;
  postal_code_end: string;
  city?: string;
};

type ShippingZone = {
  id: string;
  name: string;
  zone_group?: string;
  distance_from_store_km?: number;
  is_active: boolean;
  postal_codes: PostalCodeRange[];
};

export function ShippingZones({ locale }: { locale: string }) {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentZone, setCurrentZone] = useState<Partial<ShippingZone>>({});
  const [postalCodeInput, setPostalCodeInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zones`);
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      }
    } catch (error) {
      console.error("Failed to fetch zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Parse postal codes
      const rawCodes = postalCodeInput.split(",").map(s => s.trim()).filter(Boolean);
      const postalCodes: PostalCodeRange[] = rawCodes.map(code => {
        if (code.includes("-")) {
          const [start, end] = code.split("-");
          return { postal_code_start: start.trim(), postal_code_end: end.trim() };
        }
        return { postal_code_start: code, postal_code_end: code };
      });

      const payload = {
        ...currentZone,
        is_active: true,
        postal_codes: postalCodes,
        distance_from_store_km: Number(currentZone.distance_from_store_km || 0)
      };

      const url = currentZone.id 
        ? `${siteConfig.apiUrl}/api/v1/shipping/zones/${currentZone.id}`
        : `${siteConfig.apiUrl}/api/v1/shipping/zones`;
      
      const method = currentZone.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchZones();
        setIsEditing(false);
        setCurrentZone({});
        setPostalCodeInput("");
      } else {
        alert("Failed to save zone");
      }
    } catch (error) {
      console.error("Error saving zone:", error);
      alert("Error saving zone");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (zone: ShippingZone) => {
    setCurrentZone(zone);
    // Convert ranges back to string
    const codeString = zone.postal_codes.map(p => {
      if (p.postal_code_start === p.postal_code_end) return p.postal_code_start;
      return `${p.postal_code_start}-${p.postal_code_end}`;
    }).join(", ");
    
    setPostalCodeInput(codeString);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this zone?")) return;
    
    try {
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zones/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setZones(zones.filter((z) => z.id !== id));
      } else {
        alert("Failed to delete zone");
      }
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-in fade-in slide-in-from-bottom-4">
        <h3 className="text-lg font-medium mb-6">
          {currentZone.id ? "Edit Zone" : "New Shipping Zone"}
        </h3>
        
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Zone Name</label>
            <input
              type="text"
              value={currentZone.name || ""}
              onChange={(e) => setCurrentZone({ ...currentZone, name: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Helsinki Center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Distance from Store (km)</label>
            <input
              type="number"
              value={currentZone.distance_from_store_km || 0}
              onChange={(e) => setCurrentZone({ ...currentZone, distance_from_store_km: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Postal Codes
            </label>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-2 text-xs text-slate-600 flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <p>Enter postal codes separated by commas. Use ranges with hyphens (e.g., 00100-00200).</p>
            </div>
            <textarea
              value={postalCodeInput}
              onChange={(e) => setPostalCodeInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 h-32 font-mono text-sm"
              placeholder="00100, 00120, 00130-00150..."
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Zone"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Shipping Zones</h2>
          <p className="text-sm text-slate-500">Manage delivery areas by postal codes.</p>
        </div>
        <button
          onClick={() => {
            setCurrentZone({});
            setPostalCodeInput("");
            setIsEditing(true);
          }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{zone.name}</h3>
                  {zone.distance_from_store_km && (
                    <p className="text-xs text-slate-500">{zone.distance_from_store_km} km from store</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(zone)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(zone.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-md p-3 text-xs font-mono text-slate-600 break-all">
              {zone.postal_codes.slice(0, 3).map(p => 
                p.postal_code_start === p.postal_code_end 
                  ? p.postal_code_start 
                  : `${p.postal_code_start}-${p.postal_code_end}`
              ).join(", ")}
              {zone.postal_codes.length > 3 && "..."}
            </div>
            <div className="mt-3 text-xs text-slate-400 text-right">
              {zone.postal_codes.length} definitions
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
