"use client";

import { useState } from "react";
import { Trash2, ChevronDown, Plus, X, AlertCircle, Edit2 } from "lucide-react";
import { Category } from "@/types/settings";
import { createCategory, deleteCategory, updateCategory } from "@/lib/settings";
import { useAuth } from "@/context/AuthContext";

interface CategoryManagerProps {
  initialCategories: Category[];
}

interface AttributeField {
  key: string;
  label: { fi: string; en: string };
  type: "text" | "number" | "select" | "boolean";
  required: boolean;
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [nameFi, setNameFi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slugFi, setSlugFi] = useState("");
  const [slugEn, setSlugEn] = useState("");
  const [parentId, setParentId] = useState<string>("");

  // Attribute Builder State
  const [attributes, setAttributes] = useState<AttributeField[]>([]);
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrLabelFi, setNewAttrLabelFi] = useState("");
  const [newAttrLabelEn, setNewAttrLabelEn] = useState("");
  const [newAttrType, setNewAttrType] = useState<"text" | "number" | "select" | "boolean">("text");
  const [editingAttrIndex, setEditingAttrIndex] = useState<number | null>(null);

  const handleAddAttribute = () => {
    if (!newAttrKey || !newAttrLabelFi || !newAttrLabelEn) return;
    
    // Sanitize key: lowercase, replace spaces with underscore, remove special chars
    const sanitizedKey = newAttrKey.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    if (!sanitizedKey) {
      alert("Geçersiz anahtar (key). Lütfen harf ve rakam kullanın.");
      return;
    }

    // Check for duplicates
    if (editingAttrIndex === null && attributes.some(a => a.key === sanitizedKey)) {
      alert("Bu anahtar (key) zaten mevcut.");
      return;
    }
    
    const newAttr: AttributeField = { 
      key: sanitizedKey, 
      label: { fi: newAttrLabelFi, en: newAttrLabelEn }, 
      type: newAttrType, 
      required: false 
    };

    if (editingAttrIndex !== null) {
      const updatedAttributes = [...attributes];
      updatedAttributes[editingAttrIndex] = newAttr;
      setAttributes(updatedAttributes);
      setEditingAttrIndex(null);
    } else {
      setAttributes([...attributes, newAttr]);
    }

    setNewAttrKey("");
    setNewAttrLabelFi("");
    setNewAttrLabelEn("");
    setNewAttrType("text");
  };

  const handleEditAttribute = (index: number) => {
    const attr = attributes[index];
    setNewAttrKey(attr.key);
    setNewAttrLabelFi(attr.label.fi);
    setNewAttrLabelEn(attr.label.en);
    setNewAttrType(attr.type);
    setEditingAttrIndex(index);
  };

  const handleCancelAttributeEdit = () => {
    setEditingAttrIndex(null);
    setNewAttrKey("");
    setNewAttrLabelFi("");
    setNewAttrLabelEn("");
    setNewAttrType("text");
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
    if (editingAttrIndex === index) {
      handleCancelAttributeEdit();
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNameFi(cat.name_translations?.fi || "");
    setNameEn(cat.name_translations?.en || "");
    setSlugFi(cat.slug_translations?.fi || "");
    setSlugEn(cat.slug_translations?.en || "");
    setParentId(cat.parent_id || "");

    // Parse attributes
    if (cat.attribute_template && typeof cat.attribute_template === 'object') {
      const attrs: AttributeField[] = Object.entries(cat.attribute_template).map(([key, val]: [string, any]) => ({
        key,
        label: val.label || { fi: key, en: key },
        type: val.type || "text",
        required: val.required || false
      }));
      setAttributes(attrs);
    } else {
      setAttributes([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNameFi("");
    setNameEn("");
    setSlugFi("");
    setSlugEn("");
    setParentId("");
    setAttributes([]);
    handleCancelAttributeEdit();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: Check if both languages are filled
    if (!nameFi || !nameEn || !slugFi || !slugEn) {
      setError("Lütfen hem Fince hem de İngilizce alanları doldurunuz.");
      return;
    }

    if (!token) return;
    setLoading(true);

    try {
      // Convert attributes array to object map for backend
      const attributeTemplateMap = attributes.reduce((acc, attr) => {
        acc[attr.key] = {
          label: attr.label,
          type: attr.type,
          required: attr.required
        };
        return acc;
      }, {} as any);

      const payload = {
        name_translations: {
          fi: nameFi,
          en: nameEn
        },
        slug_translations: {
          fi: slugFi,
          en: slugEn
        },
        parent_id: parentId || null,
        attribute_template: attributeTemplateMap
      };

      if (editingId) {
        const updatedCat = await updateCategory(editingId, payload, token);
        setCategories(categories.map(c => c.id === editingId ? updatedCat : c));
        handleCancelEdit();
      } else {
        const newCat = await createCategory(payload, token);
        setCategories([...categories, newCat]);
        handleCancelEdit(); // Reset form
      }
    } catch (error) {
      console.error(error);
      setError(editingId ? "Kategori güncellenemedi." : "Kategori oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteCategory(id, token);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
      alert("Silme işlemi başarısız");
    }
  };

  // Simple tree rendering
  const renderCategory = (cat: Category, level = 0) => {
    const children = categories.filter(c => c.parent_id === cat.id);
    const displayName = cat.name_translations?.fi || cat.name_translations?.en || "Unnamed";
    const displaySlug = cat.slug_translations?.fi || cat.slug_translations?.en || "no-slug";
    
    // Count attributes
    const attrCount = cat.attribute_template && typeof cat.attribute_template === 'object' 
      ? Object.keys(cat.attribute_template).length 
      : 0;

    return (
      <div key={cat.id} className="border-b border-slate-100 last:border-0">
        <div className="flex items-center justify-between py-3 hover:bg-slate-50 px-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
            {children.length > 0 ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <div className="w-4" />}
            <span className="font-medium text-slate-900">{displayName}</span>
            <span className="text-xs text-slate-400">({displaySlug})</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {attrCount} Özellik
            </div>
            <button 
              onClick={() => handleEdit(cat)}
              className="text-slate-400 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  const rootCategories = categories.filter(c => !c.parent_id);

  // Helper to render options with indentation
  const renderCategoryOptions = (cats: Category[], parentId: string | null = null, level = 0): React.ReactNode[] => {
    const currentLevelCats = cats.filter(c => c.parent_id === parentId);
    let options: React.ReactNode[] = [];
    
    for (const cat of currentLevelCats) {
      const displayName = cat.name_translations?.fi || cat.name_translations?.en || "Unnamed";
      const prefix = level > 0 ? "\u00A0\u00A0".repeat(level) + "└ " : "";
      
      options.push(
        <option key={cat.id} value={cat.id}>
          {prefix}{displayName}
        </option>
      );
      
      options = [...options, ...renderCategoryOptions(cats, cat.id, level + 1)];
    }
    
    return options;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">{editingId ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}</h3>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-700">
              İptal
            </button>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                İsim (Fince) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameFi}
                onChange={e => setNameFi(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  !nameFi ? "border-slate-200 focus:border-slate-400" : "border-slate-200"
                }`}
                placeholder="Örn: Sohvat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                İsim (İngilizce) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  !nameEn ? "border-slate-200 focus:border-slate-400" : "border-slate-200"
                }`}
                placeholder="Ex: Sofas"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slug (Fince) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slugFi}
                onChange={e => setSlugFi(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  !slugFi ? "border-slate-200 focus:border-slate-400" : "border-slate-200"
                }`}
                placeholder="sohvat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slug (İngilizce) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slugEn}
                onChange={e => setSlugEn(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  !slugEn ? "border-slate-200 focus:border-slate-400" : "border-slate-200"
                }`}
                placeholder="sofas"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Üst Kategori</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Yok (Ana Kategori Olarak Ekle)</option>
              {renderCategoryOptions(categories)}
            </select>
          </div>

          {/* Attribute Builder */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Özellik Şablonu (Opsiyonel)</label>
            
            <div className="space-y-2 mb-3">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 text-sm">
                  <div className="flex-1 font-medium">
                    <div><span className="text-xs text-slate-400">FI:</span> {attr.label.fi}</div>
                    <div><span className="text-xs text-slate-400">EN:</span> {attr.label.en}</div>
                  </div>
                  <div className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{attr.key}</div>
                  <div className="text-xs text-slate-500">{attr.type}</div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditAttribute(idx)}
                      className="text-slate-400 hover:text-blue-500 p-1"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 mb-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAttrLabelFi}
                  onChange={e => setNewAttrLabelFi(e.target.value)}
                  placeholder="Etiket (Fince)"
                  className="col-span-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
                <input
                  type="text"
                  value={newAttrLabelEn}
                  onChange={e => setNewAttrLabelEn(e.target.value)}
                  placeholder="Etiket (İngilizce)"
                  className="col-span-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAttrKey}
                  onChange={e => setNewAttrKey(e.target.value)}
                  placeholder="Key (Örn: color)"
                  className="col-span-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
                <select
                  value={newAttrType}
                  onChange={e => setNewAttrType(e.target.value as any)}
                  className="col-span-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                >
                  <option value="text">Metin</option>
                  <option value="number">Sayı</option>
                  <option value="boolean">Evet/Hayır</option>
                  <option value="select">Seçim</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddAttribute}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm border ${
                  editingAttrIndex !== null 
                    ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {editingAttrIndex !== null ? (
                  <>
                    <Edit2 className="h-4 w-4" /> Özelliği Güncelle
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Özellik Ekle
                  </>
                )}
              </button>
              {editingAttrIndex !== null && (
                <button
                  type="button"
                  onClick={handleCancelAttributeEdit}
                  className="px-4 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  İptal
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 mt-4"
          >
            {loading ? "İşleniyor..." : (editingId ? "Değişiklikleri Kaydet" : "Kategori Ekle")}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">Kategori Ağacı</h3>
        </div>
        <div>
          {rootCategories.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Henüz kategori yok.</div>
          ) : (
            rootCategories.map(cat => renderCategory(cat))
          )}
        </div>
      </div>
    </div>
  );
}
