"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Truck, MapPin, Package, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/siteConfig";

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
  product_condition: "new" | "used" | "both";
};

type Category = {
  id: string;
  name_translations: Record<string, string>;
};

export function ShippingRules({ locale }: { locale: string }) {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<ShippingRule>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/categories`);
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
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/rules`);
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
        product_condition: currentRule.product_condition || "both"
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchRules();
        setIsEditing(false);
        setCurrentRule({});
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
      const res = await fetch(`${siteConfig.apiUrl}/api/v1/shipping/rules/${id}`, {
        method: "DELETE",
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
                    {cat.name_translations?.fi || cat.name_translations?.en || Object.values(cat.name_translations || {})[0] || "Unnamed"}
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
                      rule.product_condition === "new" ? "bg-green-100 text-green-700" :
                      rule.product_condition === "used" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {rule.product_condition === "both" ? "ALL CONDITIONS" : rule.product_condition}
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
