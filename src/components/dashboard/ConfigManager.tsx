"use client";

import { useState } from "react";
import { Trash2, Plus, X, Edit2 } from "lucide-react";
import { ConfigItem } from "@/types/settings";
import { createConfig, deleteConfig, updateConfig } from "@/lib/settings";
import { useAuth } from "@/context/AuthContext";

interface ConfigManagerProps {
  initialConfigs: ConfigItem[];
}

interface TranslationItem {
  fi: string;
  en: string;
}

export function ConfigManager({ initialConfigs }: ConfigManagerProps) {
  const { token } = useAuth();
  const [configs, setConfigs] = useState<ConfigItem[]>(initialConfigs);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [key, setKey] = useState("");
  const [descFi, setDescFi] = useState("");
  const [descEn, setDescEn] = useState("");
  const [langTab, setLangTab] = useState<"fi" | "en">("fi");
  
  // List Builder State
  const [listItems, setListItems] = useState<TranslationItem[]>([]);
  const [newItemFi, setNewItemFi] = useState("");
  const [newItemEn, setNewItemEn] = useState("");

  const handleAddItem = () => {
    if (!newItemFi && !newItemEn) return;
    setListItems([...listItems, { fi: newItemFi, en: newItemEn }]);
    setNewItemFi("");
    setNewItemEn("");
  };

  const handleRemoveItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const handleEdit = (config: ConfigItem) => {
    setEditingId(config.id);
    setKey(config.key);
    setDescFi(config.description_translations?.fi || "");
    setDescEn(config.description_translations?.en || "");
    
    if (Array.isArray(config.value)) {
      // Assuming value is TranslationItem[]
      setListItems(config.value);
    } else {
      setListItems([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setKey("");
    setDescFi("");
    setDescEn("");
    setListItems([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      // Use listItems as the value
      const value = listItems;

      const payload = {
        key,
        value,
        description_translations: {
          fi: descFi,
          en: descEn
        }
      };

      if (editingId) {
        const updatedConfig = await updateConfig(editingId, payload, token);
        setConfigs(configs.map(c => c.id === editingId ? updatedConfig : c));
        handleCancelEdit();
      } else {
        const newConfig = await createConfig(payload, token);
        setConfigs([...configs, newConfig]);
        handleCancelEdit();
      }
    } catch (error) {
      console.error(error);
      alert(editingId ? "Ayar güncellenemedi" : "Ayar oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Bu ayarı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteConfig(id, token);
      setConfigs(configs.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
      alert("Silme işlemi başarısız");
    }
  };

  const renderValuePreview = (value: any) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'fi' in value[0]) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item: any, idx: number) => (
            <span key={idx} className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
              {item.fi} / {item.en}
            </span>
          ))}
        </div>
      );
    }
    return (
      <pre className="bg-slate-50 p-2 rounded text-xs text-slate-700 overflow-x-auto max-w-md">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {configs.map((config) => (
          <div key={config.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">{config.key}</h4>
              <p className="text-sm text-slate-500 mb-2">
                {config.description_translations?.fi || config.description_translations?.en || "No description"}
              </p>
              {renderValuePreview(config.value)}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(config)}
                className="text-slate-400 hover:text-blue-600 p-2"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(config.id)}
                className="text-slate-400 hover:text-red-600 p-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {configs.length === 0 && (
          <div className="text-center text-slate-500 py-8 bg-white rounded-xl border border-slate-200">
            Henüz ayar tanımlanmamış.
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">{editingId ? "Ayarı Düzenle" : "Yeni Liste Ayarı Ekle"}</h3>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-700">
              İptal
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Anahtar (Key)</label>
            <input
              type="text"
              required
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="colors, materials, etc."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          
          {/* List Builder UI */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Liste Öğeleri</label>
            <div className="space-y-2 mb-3">
              {listItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-xs text-slate-400">FI:</span> {item.fi}</div>
                    <div><span className="text-xs text-slate-400">EN:</span> {item.en}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {listItems.length === 0 && (
                <div className="text-xs text-slate-400 italic text-center py-2 border border-dashed border-slate-200 rounded">
                  Liste boş. Aşağıdan öğe ekleyin.
                </div>
              )}
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={newItemFi}
                  onChange={e => setNewItemFi(e.target.value)}
                  placeholder="Fince Değer"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newItemEn}
                  onChange={e => setNewItemEn(e.target.value)}
                  placeholder="İngilizce Değer"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg border border-slate-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Language Tabs for Description */}
          <div className="flex space-x-2 border-b border-slate-200 mb-2 mt-4">
            <button
              type="button"
              onClick={() => setLangTab("fi")}
              className={`pb-2 text-sm font-medium ${langTab === "fi" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-500"}`}
            >
              Finnish (FI)
            </button>
            <button
              type="button"
              onClick={() => setLangTab("en")}
              className={`pb-2 text-sm font-medium ${langTab === "en" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-500"}`}
            >
              English (EN)
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Açıklama ({langTab.toUpperCase()})
            </label>
            <input
              type="text"
              value={langTab === "fi" ? descFi : descEn}
              onChange={e => langTab === "fi" ? setDescFi(e.target.value) : setDescEn(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "İşleniyor..." : (editingId ? "Değişiklikleri Kaydet" : "Ekle")}
          </button>
        </form>
      </div>
    </div>
  );
}
