"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Map, Info, Loader2 } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { 
  getCities, 
  getPostalCodesByCity, 
  getPostalCodesByRadius, 
  getRegions,
  getPostalCodesByRegion,
  getAllFinnishPostalCodes,
  FINNISH_POSTAL_CODES 
} from "@/lib/finnish-postal-codes";
import { getToken } from "@/lib/auth";

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

  // Smart Add States
  const [cities, setCities] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [radius, setRadius] = useState(10);
  const [radiusCenter, setRadiusCenter] = useState("00100");

  useEffect(() => {
    fetchZones();
    // Load cities and regions from local data
    setCities(getCities());
    setRegions(getRegions());
  }, []);

  const handleAddByCity = () => {
    if (!selectedCity) return;
    const codes = getPostalCodesByCity(selectedCity);
    const newCodes = codes.join(", ");
    setPostalCodeInput(prev => prev ? `${prev}, ${newCodes}` : newCodes);
    setSelectedCity("");
  };

  const handleAddByRegion = () => {
    if (!selectedRegion) return;
    const codes = getPostalCodesByRegion(selectedRegion);
    const newCodes = codes.join(", ");
    setPostalCodeInput(prev => prev ? `${prev}, ${newCodes}` : newCodes);
    setSelectedRegion("");
  };

  const handleAddAllFinland = () => {
    const codes = getAllFinnishPostalCodes();
    const newCodes = codes.join(", ");
    setPostalCodeInput(prev => prev ? `${prev}, ${newCodes}` : newCodes);
  };

  const handleAddByRadius = () => {
    if (!radiusCenter || !radius) return;
    
    // Get coordinates for center
    const centerData = FINNISH_POSTAL_CODES[radiusCenter];
    if (!centerData) {
      alert("Center postal code not found");
      return;
    }

    const codes = getPostalCodesByRadius(centerData.lat, centerData.lon, radius);
    const newCodes = codes.join(", ");
    setPostalCodeInput(prev => prev ? `${prev}, ${newCodes}` : newCodes);
  };

  const fetchZones = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zones`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      } else {
        console.error("Failed to fetch zones:", res.status, res.statusText);
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
      // Parse postal codes: split by comma, newline, or space
      const rawCodes = postalCodeInput.split(/[\n,\s]+/).map(s => s.trim()).filter(Boolean);
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
      const token = getToken();

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchZones(); // Refresh the list immediately
        setIsEditing(false);
        setCurrentZone({});
        setPostalCodeInput("");
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Save failed:", errorData);
        alert(`Failed to save zone: ${errorData.detail || res.statusText}`);
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
      const token = getToken();
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zones/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
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
              Smart Add Tools
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
              {/* Add by City */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 uppercase">Add by City</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 text-sm p-2"
                  >
                    <option value="">Select City...</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddByCity}
                    disabled={!selectedCity}
                    className="bg-white border border-slate-300 px-3 py-1 rounded-md text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Add by Region */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 uppercase">Add by Region</label>
                <div className="flex gap-2">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 text-sm p-2"
                  >
                    <option value="">Select Region...</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddByRegion}
                    disabled={!selectedRegion}
                    className="bg-white border border-slate-300 px-3 py-1 rounded-md text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Add by Radius */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 uppercase">Add by Radius (km)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={radiusCenter}
                    onChange={(e) => setRadiusCenter(e.target.value)}
                    placeholder="Center (00100)"
                    className="w-24 rounded-md border border-slate-300 text-sm p-2"
                  />
                  <span className="text-slate-400">+</span>
                  <input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-20 rounded-md border border-slate-300 text-sm p-2"
                  />
                  <span className="text-slate-500 text-sm">km</span>
                  <button
                    onClick={handleAddByRadius}
                    disabled={!radiusCenter}
                    className="bg-white border border-slate-300 px-3 py-1 rounded-md text-sm hover:bg-slate-50 disabled:opacity-50 ml-auto"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Add All Finland */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 uppercase">Whole Country</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAllFinland}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm hover:bg-slate-50 text-left flex justify-between items-center"
                  >
                    <span>Add All Finland (00000-99999)</span>
                    <Plus className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Postal Codes
            </label>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-2 text-xs text-slate-600 flex gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Supported Formats:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Single codes: <code className="bg-white px-1 rounded border">00100</code></li>
                  <li>Ranges: <code className="bg-white px-1 rounded border">00100-00200</code></li>
                  <li>Separators: Comma, space, or new line</li>
                </ul>
                <p className="mt-1 text-slate-500">You can paste a list directly from Excel or a text file.</p>
              </div>
            </div>
            <textarea
              value={postalCodeInput}
              onChange={(e) => setPostalCodeInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 h-48 font-mono text-sm"
              placeholder={"00100\n00120\n00130-00150\n00200, 00210"}
            />
            <div className="text-xs text-slate-500 mt-1 text-right">
              {postalCodeInput.split(/[\n,\s]+/).filter(Boolean).length} entries detected
            </div>
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
