"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Truck, MapPin, Package, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/siteConfig";
import { getToken } from "@/lib/auth";

type ShippingRule = {
  id: string;
  name: string;
  description?: string;
  rule_type: "distance_based" | "flat_rate" | "zone_based";
  base_price: number;
  price_per_km?: number;
  max_distance_km?: number;
  flat_rate_price?: number;
  estimated_delivery_days?: number;
  is_active: boolean;
  priority?: number;
  category_ids?: string[];
  product_condition?: "new" | "used" | "both";
  min_order_value?: number;
};

type Category = {
  id: string;
  name?: string;
  name_translations?: Record<string, string>;
};

type ShippingZone = {
  id: string;
  name: string;
};

type ShippingZonePrice = {
  id: string;
  shipping_rule_id: string;
  shipping_zone_id: string;
  override_price: number;
  override_enabled: boolean;
};

export function ShippingRules({ locale }: { locale: string }) {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zonePrices, setZonePrices] = useState<ShippingZonePrice[]>([]);
  const [currentZonePrices, setCurrentZonePrices] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<ShippingRule>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
    fetchCategories();
    fetchZones();
    fetchZonePrices();
  }, []);

  const fetchZones = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zones`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      }
    } catch (error) {
      console.error("Failed to fetch zones:", error);
    }
  };

  const fetchZonePrices = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zone-prices`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setZonePrices(data);
      }
    } catch (error) {
      console.error("Failed to fetch zone prices:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/categories`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/rules`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = currentRule.id 
        ? `${siteConfig.apiUrl}/api/v1/shipping/rules/${currentRule.id}`
        : `${siteConfig.apiUrl}/api/v1/shipping/rules`;
      
      const method = currentRule.id ? "PATCH" : "POST";
      
      // Prepare payload based on type
      const payload = {
        ...currentRule,
        // Ensure numbers are numbers
        base_price: Number(currentRule.base_price || 0),
        price_per_km: Number(currentRule.price_per_km || 0),
        max_distance_km: Number(currentRule.max_distance_km || 0),
        flat_rate_price: Number(currentRule.flat_rate_price || 0),
        estimated_delivery_days: Number(currentRule.estimated_delivery_days || 0),
        priority: Number(currentRule.priority || 1),
        category_ids: currentRule.category_ids || [],
        product_condition: currentRule.product_condition || "both",
        min_order_value: Number(currentRule.min_order_value || 0)
      };

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
        const savedRule = await res.json();
        
        // Handle Zone Prices if needed
        if (currentRule.rule_type === "zone_based" && savedRule.id) {
          await saveZonePrices(savedRule.id);
        }

        await fetchRules();
        await fetchZonePrices(); // Refresh prices
        setIsEditing(false);
        setCurrentRule({});
        setCurrentZonePrices({});
      } else {
        alert("Failed to save rule");
      }
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Error saving rule");
    } finally {
      setSaving(false);
    }
  };

  const saveZonePrices = async (ruleId: string) => {
    const token = getToken();
    const promises = zones.map(async (zone) => {
      const price = currentZonePrices[zone.id];
      const existingPrice = zonePrices.find(
        (p) => p.shipping_rule_id === ruleId && p.shipping_zone_id === zone.id
      );

      if (price !== undefined) {
        if (existingPrice) {
          // Update if changed
          if (existingPrice.override_price !== price) {
            await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zone-prices/${existingPrice.id}`, {
              method: "PATCH",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ override_price: price }),
            });
          }
        } else {
          // Create new
          await fetch(`${siteConfig.apiUrl}/api/v1/shipping/zone-prices`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              shipping_rule_id: ruleId,
              shipping_zone_id: zone.id,
              override_price: price,
              override_enabled: true,
            }),
          });
        }
      } else if (existingPrice) {
        // Delete if removed (optional, maybe we keep it?)
        // For now let's keep it simple and not delete automatically unless explicitly cleared?
        // Or maybe we should delete if it's not in currentZonePrices? 
        // But currentZonePrices is initialized from existing.
        // Let's assume if it's in currentZonePrices, we save it.
      }
    });

    await Promise.all(promises);
  };

  const toggleCategory = (categoryId: string) => {
    const currentIds = currentRule.category_ids || [];
    if (currentIds.includes(categoryId)) {
      setCurrentRule({
        ...currentRule,
        category_ids: currentIds.filter(id => id !== categoryId)
      });
    } else {
      setCurrentRule({
        ...currentRule,
        category_ids: [...currentIds, categoryId]
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/rules/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        setRules(rules.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete rule");
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-in fade-in slide-in-from-bottom-4">
        <h3 className="text-lg font-medium mb-6">
          {currentRule.id ? "Edit Rule" : "New Shipping Rule"}
        </h3>
        
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={currentRule.name || ""}
              onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
              className="w-full rounded-md border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Heavy Items Delivery"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={currentRule.rule_type || "flat_rate"}
                onChange={(e) => setCurrentRule({ ...currentRule, rule_type: e.target.value as any })}
                className="w-full rounded-md border border-slate-300 p-2"
              >
                <option value="flat_rate">Flat Rate (Sabit)</option>
                <option value="distance_based">Distance Based (Mesafe)</option>
                <option value="zone_based">Zone Based (Bölge)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <input
                type="number"
                value={currentRule.priority || 1}
                onChange={(e) => setCurrentRule({ ...currentRule, priority: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Order Value (€)</label>
              <input
                type="number"
                value={currentRule.min_order_value || 0}
                onChange={(e) => setCurrentRule({ ...currentRule, min_order_value: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Condition</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="product_condition"
                  value="both"
                  checked={!currentRule.product_condition || currentRule.product_condition === "both"}
                  onChange={() => setCurrentRule({ ...currentRule, product_condition: "both" })}
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">Both (New & Used)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="product_condition"
                  value="new"
                  checked={currentRule.product_condition === "new"}
                  onChange={() => setCurrentRule({ ...currentRule, product_condition: "new" })}
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">New Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="product_condition"
                  value="used"
                  checked={currentRule.product_condition === "used"}
                  onChange={() => setCurrentRule({ ...currentRule, product_condition: "used" })}
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">Used Only</span>
              </label>
            </div>
          </div>

          {currentRule.rule_type === "flat_rate" && (
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flat Price (€)</label>
              <input
                type="number"
                value={currentRule.flat_rate_price || 0}
                onChange={(e) => setCurrentRule({ ...currentRule, flat_rate_price: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 p-2"
              />
            </div>
          )}

          {currentRule.rule_type === "distance_based" && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 space-y-4">
              <div className="flex items-start gap-2 text-blue-700 text-sm mb-2">
                <Info className="w-4 h-4 mt-0.5" />
                <p>Distance calculation: Base Price + (Distance * Price per km)</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (€)</label>
                  <input
                    type="number"
                    value={currentRule.base_price || 0}
                    onChange={(e) => setCurrentRule({ ...currentRule, base_price: Number(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price per km (€)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRule.price_per_km || 0}
                    onChange={(e) => setCurrentRule({ ...currentRule, price_per_km: Number(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Distance (km)</label>
                  <input
                    type="number"
                    value={currentRule.max_distance_km || 0}
                    onChange={(e) => setCurrentRule({ ...currentRule, max_distance_km: Number(e.target.value) })}
                    className="w-full rounded-md border border-slate-300 p-2"
                  />
                </div>
              </div>
            </div>
          )}

          {currentRule.rule_type === "zone_based" && (
            <div className="bg-purple-50 p-4 rounded-md border border-purple-100 space-y-4">
              <div className="flex items-start gap-2 text-purple-700 text-sm mb-2">
                <Info className="w-4 h-4 mt-0.5" />
                <p>Add zones and set their prices. Only zones with prices will be used.</p>
              </div>
              
              {/* Selected Zone Prices */}
              <div className="space-y-2">
                {Object.entries(currentZonePrices).map(([zoneId, price]) => {
                  const zone = zones.find(z => z.id === zoneId);
                  if (!zone) return null;
                  return (
                    <div key={zoneId} className="flex items-center justify-between bg-white p-3 rounded border border-purple-100">
                      <span className="text-sm font-medium text-slate-700">{zone.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">€</span>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => {
                              setCurrentZonePrices({ 
                                ...currentZonePrices, 
                                [zoneId]: Number(e.target.value) 
                              });
                            }}
                            className="w-20 rounded-md border border-slate-300 p-1 text-right"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newPrices = { ...currentZonePrices };
                            delete newPrices[zoneId];
                            setCurrentZonePrices(newPrices);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Add Zone Dropdown */}
              {zones.filter(z => !currentZonePrices.hasOwnProperty(z.id)).length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    id="add-zone-select"
                    className="flex-1 rounded-md border border-slate-300 p-2 text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Valitse alue lisättäväksi...</option>
                    {zones
                      .filter(z => !currentZonePrices.hasOwnProperty(z.id))
                      .map(zone => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const select = document.getElementById("add-zone-select") as HTMLSelectElement;
                      if (select && select.value) {
                        setCurrentZonePrices({
                          ...currentZonePrices,
                          [select.value]: 0
                        });
                        select.value = "";
                      }
                    }}
                    className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Lisää
                  </button>
                </div>
              )}
              
              {zones.length === 0 && (
                <p className="text-sm text-slate-500 italic">No zones defined. Go to Shipping Zones to create one.</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Est. Delivery Days</label>
            <input
              type="number"
              value={currentRule.estimated_delivery_days || 3}
              onChange={(e) => setCurrentRule({ ...currentRule, estimated_delivery_days: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Applies to Categories</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={(currentRule.category_ids || []).includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="truncate">
                    {cat.name_translations?.fi || cat.name_translations?.en || (cat.name_translations && Object.values(cat.name_translations)[0]) || cat.name || "Unnamed"}
                  </span>
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-slate-500 col-span-2 p-2">No categories found. Create categories first.</p>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              If no categories are selected, this rule might not apply to any product automatically.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Rule"}
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
          <h2 className="text-lg font-medium text-slate-900">Shipping Rules</h2>
          <p className="text-sm text-slate-500">Define how shipping costs are calculated.</p>
        </div>
        <button
          onClick={() => {
            setCurrentRule({ rule_type: "flat_rate", is_active: true, priority: 1 });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-2 rounded-lg",
                rule.rule_type === "distance_based" ? "bg-blue-100 text-blue-600" :
                rule.rule_type === "flat_rate" ? "bg-green-100 text-green-600" :
                "bg-purple-100 text-purple-600"
              )}>
                {rule.rule_type === "distance_based" ? <Truck className="w-6 h-6" /> :
                 rule.rule_type === "flat_rate" ? <Package className="w-6 h-6" /> :
                 <MapPin className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{rule.name}</h3>
                <div className="text-sm text-slate-500 mt-1 flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <span className="uppercase text-xs font-bold tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {rule.rule_type.replace("_", " ")}
                    </span>
                    <span className={cn(
                      "uppercase text-xs font-bold tracking-wider px-2 py-0.5 rounded",
                      (rule.product_condition || "both") === "new" ? "bg-green-100 text-green-700" :
                      (rule.product_condition || "both") === "used" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {(rule.product_condition || "both") === "both" ? "ALL CONDITIONS" : rule.product_condition}
                    </span>
                    {rule.rule_type === "flat_rate" && <span>{rule.flat_rate_price}€</span>}
                    {rule.rule_type === "distance_based" && <span>Base: {rule.base_price}€</span>}
                  </span>
                  {rule.rule_type === "distance_based" && (
                    <span className="text-xs">
                      + {rule.price_per_km}€/km (Max {rule.max_distance_km}km)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentRule(rule);
                  // Load zone prices for this rule
                  const rulePrices = zonePrices.filter(p => p.shipping_rule_id === rule.id);
                  const priceMap: Record<string, number> = {};
                  rulePrices.forEach(p => {
                    priceMap[p.shipping_zone_id] = Number(p.override_price);
                  });
                  setCurrentZonePrices(priceMap);
                  setIsEditing(true);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
