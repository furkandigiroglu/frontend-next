"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, X, Plus, Trash, LayoutGrid, List, Image as ImageIcon, Package, DollarSign, Bold, Italic, ListOrdered, Heading, Smile } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Product, ProductStatus, ProductCondition, ShippingTier, StoredFile } from "@/types/product";
import type { Category, ConfigItem } from "@/types/settings";
import type { Dictionary } from "@/types/dictionary";
import { useAuth } from "@/context/AuthContext";
import { uploadFile } from "@/lib/storage";
import { fetchCategories, fetchConfigs } from "@/lib/settings";
import { compressImage } from "@/lib/imageUtils";

type ProductFormProps = {
  initialData?: Product;
  locale: string;
  dict: Dictionary;
};

function SortableImage({ file, index, onRemove }: { file: StoredFile; index: number; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: file.filename });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-square group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm touch-none cursor-move"
    >
      <Image
        src={`http://185.96.163.183:8000/api/v1/storage/${file.namespace}/${file.entity_id}/${file.filename}`}
        alt="Preview"
        fill
        className="object-cover pointer-events-none"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      <button
        type="button"
        onClick={(e) => {
            e.stopPropagation();
            onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-400 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 z-10 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
      {index === 0 && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs py-1 px-2 rounded text-center backdrop-blur-sm">
          Main Image
        </div>
      )}
    </div>
  );
}

export function ProductForm({ initialData, locale, dict }: ProductFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data Sources
  const [categories, setCategories] = useState<Category[]>([]);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || initialData?.category || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [status, setStatus] = useState<ProductStatus>(initialData?.status || "draft");
  const [condition, setCondition] = useState<ProductCondition>(initialData?.condition_type || "used");
  const [shipping, setShipping] = useState<ShippingTier>(initialData?.shipping_tier || "standard");
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || "1");
  const [regularPrice, setRegularPrice] = useState(initialData?.regular_price?.toString() || "");
  const [salePrice, setSalePrice] = useState(initialData?.sale_price?.toString() || "");
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchase_price?.toString() || "");
  const [dimensions, setDimensions] = useState(initialData?.dimensions || "");
  
  // Description Handling
  const [descLang, setDescLang] = useState<"fi" | "en">("fi");
  const [descriptionFi, setDescriptionFi] = useState(() => {
    const desc = initialData?.description;
    if (!desc) return "";
    if (typeof desc === 'string') {
        try { return JSON.parse(desc).fi || JSON.parse(desc).text || desc; } catch { return desc; }
    }
    return (desc as any).fi || (desc as any).text || "";
  });
  const [descriptionEn, setDescriptionEn] = useState(() => {
    const desc = initialData?.description;
    if (!desc) return "";
    if (typeof desc === 'string') {
        try { return JSON.parse(desc).en || ""; } catch { return ""; }
    }
    return (desc as any).en || "";
  });
  
  // Metadata State (Dynamic Key-Value)
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    initialData?.metadata 
      ? Object.entries(initialData.metadata).map(([key, value]) => ({ key, value: String(value) }))
      : []
  );

  // Files State
  const [files, setFiles] = useState<StoredFile[]>(initialData?.files || []);
  const [uploading, setUploading] = useState(false);

  // Helper to generate UUID for uploads
  const [tempId] = useState(() => {
    if (initialData?.id) return initialData.id;
    // Fallback for environments where crypto.randomUUID is not available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
       return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.filename === active.id);
        const newIndex = items.findIndex((item) => item.filename === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [cats, confs] = await Promise.all([fetchCategories(token), fetchConfigs(token)]);
        setCategories(cats);
        setConfigs(confs);
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    }
    loadData();
  }, [token]);

  // Helper to get merged attributes from category tree
  const getMergedAttributes = (catId: string): Record<string, any> => {
    let currentId: string | null = catId;
    let mergedTemplate: Record<string, any> = {};
    const path: Category[] = [];

    // Traverse up to root
    while (currentId) {
      const cat = categories.find(c => c.id === currentId);
      if (cat) {
        path.unshift(cat); // Add to beginning to have Root -> Child order
        currentId = cat.parent_id;
      } else {
        break;
      }
    }

    // Merge templates from root down to child
    path.forEach(cat => {
      if (cat.attribute_template) {
        mergedTemplate = { ...mergedTemplate, ...cat.attribute_template };
      }
    });

    return mergedTemplate;
  };

  // Update metadata when category changes
  useEffect(() => {
    if (!categoryId) return;
    
    const mergedTemplate = getMergedAttributes(categoryId);
    const newMeta = [...metadata];
    
    Object.entries(mergedTemplate).forEach(([key, schema]) => {
      if (!newMeta.find(m => m.key === key)) {
        newMeta.push({ key, value: "" });
      }
    });
    
    setMetadata(newMeta);
  }, [categoryId, categories]);

  const handleMetadataChange = (index: number, field: "key" | "value", val: string) => {
    const newMeta = [...metadata];
    newMeta[index][field] = val;
    setMetadata(newMeta);
  };

  const addMetadataField = () => {
    setMetadata([...metadata, { key: "", value: "" }]);
  };

  const removeMetadataField = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !token) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const newFiles = Array.from(e.target.files);

      // Check for empty/placeholder files (common with cloud drives)
      const invalidFiles = newFiles.filter(f => f.size === 0);
      if (invalidFiles.length > 0) {
        throw new Error(locale === "fi" 
          ? "Yksi tai useampi tiedosto on tyhjä (0 tavua). Tämä voi johtua siitä, että tiedosto on pilvessä eikä sitä ole vielä ladattu tietokoneellesi. Varmista, että tiedosto on offline-tilassa."
          : "One or more files are empty (0 bytes). This might be because the file is in the cloud and not yet downloaded to your computer. Please ensure the file is available offline."
        );
      }

      const uploadedFiles = await Promise.all(
        newFiles.map(async (file) => {
          try {
             // Compress on client side before upload
             // 1600px width, 90% quality -> Great balance (~500KB)
             const compressed = await compressImage(file, 1600, 0.9);
             return uploadFile(compressed, "products", tempId, token);
          } catch (err) {
             console.error("Compression failed, uploading original:", err);
             return uploadFile(file, "products", tempId, token);
          }
        })
      );
      setFiles(prev => [...prev, ...uploadedFiles]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (locale === "fi" ? "Resim yüklenirken hata oluştu." : "Error uploading image."));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderCategoryOptions = (cats: Category[], parentId: string | null = null, level = 0): React.ReactNode[] => {
    const currentLevelCats = cats.filter(c => c.parent_id === parentId);
    let options: React.ReactNode[] = [];
    
    for (const cat of currentLevelCats) {
      const displayName = cat.name_translations?.[locale as "fi" | "en"] || cat.name_translations?.fi || "Unnamed";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Oturum açmanız gerekiyor.");
      setLoading(false);
      return;
    }

    try {
      // Convert metadata array to object
      const metadataObj = metadata.reduce((acc, curr) => {
        if (curr.key.trim()) acc[curr.key.trim()] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      // Format description as JSON object
      const descObj = { 
        fi: descriptionFi,
        en: descriptionEn
      };

      const payload = {
        name,
        sku: sku || null,
        category: categoryId || null,
        brand: brand || null,
        status,
        condition_type: condition,
        shipping_tier: shipping,
        quantity: parseInt(quantity || "1", 10),
        // Backend expects 'sale_price' to be the ACTIVE price.
        // 'regular_price' is optional and used for strikethrough (original price).
        regular_price: (salePrice && regularPrice) ? parseFloat(regularPrice) : null,
        sale_price: salePrice ? parseFloat(salePrice) : (regularPrice ? parseFloat(regularPrice) : 0),
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        dimensions: dimensions || null,
        description: descObj,
        files,
        metadata: metadataObj,
      };

      const API_URL = "http://185.96.163.183:8000/api/v1";
      const url = initialData 
        ? `${API_URL}/products/${initialData.id}`
        : `${API_URL}/products`;
      
      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Save Error Details:", errData);
        
        let errorMessage = "Kaydetme başarısız";
        if (errData.detail) {
           if (Array.isArray(errData.detail)) {
             errorMessage = errData.detail.map((e: any) => `${e.loc?.join(".") || 'Field'}: ${e.msg}`).join(", ");
           } else if (typeof errData.detail === 'object') {
             errorMessage = JSON.stringify(errData.detail);
           } else {
             errorMessage = String(errData.detail);
           }
        }
        
        throw new Error(errorMessage);
      }

      router.push(`/${locale}/dashboard/products`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormat = (type: "bold" | "italic" | "list" | "ordered" | "h3") => {
    const textarea = document.getElementById("prod-desc") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = descLang === 'fi' ? descriptionFi : descriptionEn;
    const selection = currentText.substring(start, end);
    
    let newText = "";

    switch (type) {
      case "bold":
        newText = currentText.substring(0, start) + `**${selection || "kalın yazı"}**` + currentText.substring(end);
        break;
      case "italic":
        newText = currentText.substring(0, start) + `*${selection || "italik yazı"}*` + currentText.substring(end);
        break;
      case "list":
        newText = currentText.substring(0, start) + `\n- ${selection || "liste öğesi"}` + currentText.substring(end);
        break;
      case "ordered":
        newText = currentText.substring(0, start) + `\n1. ${selection || "liste öğesi"}` + currentText.substring(end);
        break;
      case "h3":
        newText = currentText.substring(0, start) + `\n### ${selection || "Başlık"}\n` + currentText.substring(end);
        break;
    }

    if (descLang === 'fi') {
      setDescriptionFi(newText);
    } else {
      setDescriptionEn(newText);
    }
    
    // Restore focus
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <X className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* General Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-slate-400" />
            {dict.dashboard.productForm.sections.general}
          </h3>
          <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.name} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  placeholder={dict.dashboard.productForm.placeholders.name}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">{dict.dashboard.productForm.fields.description}</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDescLang('fi')}
                      className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                        descLang === 'fi' 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      FI
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescLang('en')}
                      className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                        descLang === 'en' 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
                    <button type="button" onClick={() => handleFormat("bold")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Bold">
                      <Bold className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleFormat("italic")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Italic">
                      <Italic className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <button type="button" onClick={() => handleFormat("list")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="List">
                      <List className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleFormat("ordered")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Ordered List">
                      <ListOrdered className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <button type="button" onClick={() => handleFormat("h3")} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded" title="Heading">
                      <Heading className="h-4 w-4" />
                    </button>
                    <div className="flex-1" />
                    <div className="text-xs text-slate-400 flex items-center gap-1 px-2" title="Emoji Panel: Win + . or Cmd + Ctrl + Space">
                      <Smile className="h-3 w-3" />
                      <span className="hidden sm:inline">Emoji</span>
                    </div>
                  </div>
                  
                  <textarea
                    id="prod-desc"
                    rows={8}
                    value={descLang === 'fi' ? descriptionFi : descriptionEn}
                    onChange={(e) => descLang === 'fi' ? setDescriptionFi(e.target.value) : setDescriptionEn(e.target.value)}
                    className="w-full px-3 py-2 focus:outline-none text-sm leading-relaxed resize-y"
                    placeholder={descLang === 'fi' ? dict.dashboard.productForm.placeholders.description : "Product description in English..."}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    {dict.dashboard.productForm.hints.markdown}
                  </p>
                  <span className="text-xs text-slate-400">
                    {(descLang === 'fi' ? descriptionFi : descriptionEn).length} chars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.category} <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="">{dict.dashboard.productForm.placeholders.category}</option>
                    {renderCategoryOptions(categories)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.brand}</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-900 focus:outline-none"
                    placeholder={dict.dashboard.productForm.placeholders.brand}
                  />
                </div>
              </div>


            </div>
          </div>

        {/* Attributes Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{dict.dashboard.productForm.attributes.title}</h3>
                <p className="text-sm text-slate-500">{dict.dashboard.productForm.attributes.description}</p>
              </div>
              <button
                type="button"
                onClick={addMetadataField}
                className="text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center gap-2 border border-slate-200"
              >
                <Plus className="h-4 w-4" /> {dict.dashboard.productForm.attributes.addCustom}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const mergedTemplate = categoryId ? getMergedAttributes(categoryId) : {};
                
                return metadata.map((item, index) => {
                  const template = mergedTemplate[item.key];

                  if (template) {
                    // Template Field (Defined in Category)
                    const label = template.label?.[locale as "fi"|"en"] || template.label?.fi || item.key;
                    
                    if (template.type === "boolean") {
                      return (
                        <div key={index} className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white transition-colors">
                          <input
                            type="checkbox"
                            checked={item.value === "true"}
                            onChange={(e) => handleMetadataChange(index, "value", e.target.checked ? "true" : "false")}
                            className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                          <label className="text-sm font-medium text-slate-700 cursor-pointer select-none">{label}</label>
                        </div>
                      );
                    }

                    // Check for Config mapping or explicit options
                    const configMapping: Record<string, string> = {
                      "color": "common_colors",
                      "condition": "product_conditions"
                    };
                    
                    let options: {label: string, value: string}[] = [];
                    
                    if (template.options) {
                       options = template.options.map((opt: string) => ({ label: opt, value: opt }));
                    } else if (configMapping[item.key]) {
                       const config = configs.find(c => c.key === configMapping[item.key]);
                       if (config && Array.isArray(config.value)) {
                          options = config.value.map((v: any) => {
                             const val = typeof v === 'string' ? v : (v[locale as "fi"|"en"] || v.fi);
                             return { label: val, value: val };
                          });
                       }
                    }

                    if (options.length > 0) {
                      return (
                        <div key={index}>
                          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
                          <select
                            value={item.value}
                            onChange={(e) => handleMetadataChange(index, "value", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-slate-900 focus:outline-none"
                          >
                            <option value="">{dict.dashboard.productForm.attributes.manualAdd}</option>
                            {options.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return (
                      <div key={index}>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
                        <input
                          type={template.type === "number" ? "number" : "text"}
                          value={item.value}
                          onChange={(e) => handleMetadataChange(index, "value", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          placeholder={`${label}...`}
                        />
                      </div>
                    );
                  }

                  // Custom Field (User added)
                  return (
                    <div key={index} className="col-span-1 md:col-span-2 flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1">{dict.dashboard.productForm.attributes.customName}</label>
                        <input
                          type="text"
                          placeholder={dict.dashboard.productForm.attributes.customName}
                          value={item.key}
                          onChange={(e) => handleMetadataChange(index, "key", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1">{dict.dashboard.productForm.attributes.customValue}</label>
                        <input
                          type="text"
                          placeholder={dict.dashboard.productForm.attributes.customValue}
                          value={item.value}
                          onChange={(e) => handleMetadataChange(index, "value", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMetadataField(index)}
                        className="mt-6 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={dict.dashboard.common.delete}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  );
                });
              })()}
              
              {metadata.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <List className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">{dict.dashboard.productForm.attributes.noAttributes}</p>
                  <button onClick={addMetadataField} className="text-sm text-blue-600 hover:underline mt-1">
                    {dict.dashboard.productForm.attributes.manualAdd}
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* Images Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-slate-400" />
              {dict.dashboard.productForm.sections.images}
            </h3>
            
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={files.map(f => f.filename)} 
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {files.map((file, index) => (
                    <SortableImage 
                      key={file.filename} 
                      file={file} 
                      index={index} 
                      onRemove={() => removeFile(index)} 
                    />
                  ))}
                  
                  <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    ) : (
                      <>
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6 text-slate-400 group-hover:text-slate-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{dict.dashboard.productForm.labels.upload}</span>
                        <span className="text-xs text-slate-400 mt-1">{dict.dashboard.productForm.hints.images}</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </SortableContext>
            </DndContext>
          </div>

        {/* Pricing Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status & Settings */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-slate-400" />
                {dict.dashboard.productForm.sections.status}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.status}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-900 focus:outline-none bg-white"
                  >
                    <option value="draft">Taslak</option>
                    <option value="active">Yayında</option>
                    <option value="sold">Satıldı</option>
                    <option value="archived">Arşivlenmiş</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.condition}</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ProductCondition)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-900 focus:outline-none bg-white"
                  >
                    <option value="used">İkinci El</option>
                    <option value="new">Sıfır (Yeni)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.sku}</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-900 focus:outline-none"
                    placeholder={dict.dashboard.productForm.placeholders.sku}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok (Määrä)</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-slate-400" />
                {dict.dashboard.productForm.sections.pricing}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.regularPrice} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
                    />
                    <span className="absolute left-3 top-2 text-slate-400">€</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.salePrice}</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
                    />
                    <span className="absolute left-3 top-2 text-slate-400">€</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{dict.dashboard.productForm.hints.salePrice}</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {dict.dashboard.productForm.fields.purchasePrice} 
                    {condition === "used" && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required={condition === "used"}
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 focus:border-slate-900 focus:outline-none font-mono bg-slate-50"
                    />
                    <span className="absolute left-3 top-2 text-slate-400">€</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{dict.dashboard.productForm.hints.purchasePrice}</p>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">{dict.dashboard.productForm.sections.shipping}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.shipping}</label>
                  <select
                    value={shipping}
                    onChange={(e) => setShipping(e.target.value as ShippingTier)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-900 focus:outline-none bg-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.dashboard.productForm.fields.dimensions}</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder={dict.dashboard.productForm.placeholders.dimensions}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20 lg:pl-64">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {initialData ? dict.dashboard.productForm.titleEdit : dict.dashboard.productForm.titleNew}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {dict.dashboard.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialData ? dict.dashboard.common.save : dict.dashboard.common.create}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
