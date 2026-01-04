"use client";

import { useState, useEffect } from "react";
import { CategoryManager } from "./CategoryManager";
import { ConfigManager } from "./ConfigManager";
import { Category, ConfigItem } from "@/types/settings";
import { useAuth } from "@/context/AuthContext";
import { fetchCategories, fetchConfigs } from "@/lib/settings";
import { Loader2 } from "lucide-react";

export function SettingsTabs() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"categories" | "configs">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [cats, confs] = await Promise.all([
          fetchCategories(token),
          fetchConfigs(token)
        ]);
        setCategories(cats);
        setConfigs(confs);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "categories"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}
            `}
          >
            Kategoriler
          </button>
          <button
            onClick={() => setActiveTab("configs")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "configs"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}
            `}
          >
            Genel Ayarlar (Config)
          </button>
        </nav>
      </div>

      {activeTab === "categories" ? (
        <CategoryManager initialCategories={categories} />
      ) : (
        <ConfigManager initialConfigs={configs} />
      )}
    </div>
  );
}
