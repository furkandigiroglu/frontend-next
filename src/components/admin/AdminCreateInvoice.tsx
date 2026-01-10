"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createInvoice } from "@/lib/api/admin-invoices";
import { fetchAdminProducts } from "@/lib/products";
import { ArrowLeft, Save, Plus, Trash2, Calendar, User, FileText, CreditCard, Search, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import type { Product as ProductType } from "@/types/product";
import { Modal } from "@/components/ui/Modal";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  discount_percent: number;
}

export function AdminCreateInvoice({ locale }: { locale: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [error, setError] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
  const [productSearchFilter, setProductSearchFilter] = useState("");

  const [formData, setFormData] = useState({
    billing_name: "",
    billing_email: "",
    billing_ssn: "", // NEW: Y-tunnus
    billing_address: {
      street: "",
      city: "",
      postal_code: "",
      country: "FI",
    },
    status: "draft",
    invoice_type: "invoice",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    payment_method: "cash",
    language: "fi",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, vat_rate: 25.5, discount_percent: 0 },
  ]);

  // Gross Price helpers (Input values)
  const [grossPrices, setGrossPrices] = useState<number[]>([0]);

  useEffect(() => {
    if (token) {
        fetchAdminProducts(token).then(setProducts).catch(console.error);
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billing_address: { ...prev.billing_address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const handleGrossPriceChange = (index: number, grossValue: number) => {
      const newGrossPrices = [...grossPrices];
      newGrossPrices[index] = grossValue;
      setGrossPrices(newGrossPrices);

      // Re-calculate unit_price (Net)
      const item = lineItems[index];
      const netPrice = grossValue / (1 + (item.vat_rate / 100));
      updateLineItem(index, "unit_price", netPrice);
  };

  const handleVatChange = (index: number, vatRate: number) => {
      // When VAT changes, keep the Gross Price (user input) constant, update Net Price.
      const gross = grossPrices[index];
      const netPrice = gross / (1 + (vatRate / 100));
      
      const newItems = [...lineItems];
      newItems[index] = { ...newItems[index], vat_rate: vatRate, unit_price: netPrice };
      setLineItems(newItems);
  };
  
  const handleProductSelect = (index: number, product: ProductType) => {
      const gross = Number(product.sale_price) || Number(product.regular_price) || 0;
      const vat = (product.metadata?.vat_rate as number) || 25.5;
      const net = gross / (1 + (vat / 100));

      const newItems = [...lineItems];
      newItems[index] = {
          ...newItems[index],
          description: product.name,
          vat_rate: vat,
          unit_price: net
      };
      setLineItems(newItems);

      const newGross = [...grossPrices];
      newGross[index] = gross;
      setGrossPrices(newGross);      
      setProductModalOpen(false);
      setCurrentLineIndex(null);
      setProductSearchFilter("");
  };

  const openProductModal = (index: number) => {
    setCurrentLineIndex(index);
    setProductModalOpen(true);
    setProductSearchFilter("");
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0, vat_rate: 25.5, discount_percent: 0 }]);
    setGrossPrices([...grossPrices, 0]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
      setGrossPrices(grossPrices.filter((_, i) => i !== index));
    }
  };


  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unit_price;
      const discount = subtotal * (item.discount_percent / 100);
      const net = subtotal - discount;
      const vat = net * (item.vat_rate / 100);
      return sum + net + vat;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        line_items: lineItems,
        billing_email: formData.billing_email || null, // convert empty string to null if needed by backend
        notes: formData.notes || null,
      };

      await createInvoice(token, payload);
      
      // Use startTransition to prevent React performance measurement error
      startTransition(() => {
        router.push(`/${locale}/dashboard/invoices`);
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create invoice");
      setLoading(false);
    }
  };

  const t = {
    title: locale === 'fi' ? 'Uusi Lasku' : 'New Invoice',
    back: locale === 'fi' ? 'Takaisin' : 'Back',
    save: locale === 'fi' ? 'Tallenna' : 'Save',
    saving: locale === 'fi' ? 'Tallennetaan...' : 'Saving...',
    customer: locale === 'fi' ? 'Asiakas' : 'Customer',
    invoice: locale === 'fi' ? 'Laskun Tiedot' : 'Invoice Details',
    billingName: locale === 'fi' ? 'Nimi / Yritys' : 'Name / Company',
    email: locale === 'fi' ? 'Sähköposti' : 'Email',
    address: locale === 'fi' ? 'Osoite' : 'Address',
    city: locale === 'fi' ? 'Kaupunki' : 'City',
    postalCode: locale === 'fi' ? 'Postinumero' : 'Postal Code',
    status: locale === 'fi' ? 'Tila' : 'Status',
    type: locale === 'fi' ? 'Tyyppi' : 'Type',
    date: locale === 'fi' ? 'Eräpäivä' : 'Due Date',
    items: locale === 'fi' ? 'Tuotteet / Palvelut' : 'Products / Services',
    description: locale === 'fi' ? 'Kuvaus' : 'Description',
    qty: locale === 'fi' ? 'Määrä' : 'Qty',
    price: locale === 'fi' ? 'Hinta (alv 0%)' : 'Price (ex. VAT)',
    vat: locale === 'fi' ? 'ALV %' : 'VAT %',
    total: locale === 'fi' ? 'Yhteensä' : 'Total',
    add: locale === 'fi' ? 'Lisää Rivi' : 'Add Line',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/${locale}/dashboard/invoices`} 
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Customer & Invoice Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold border-b pb-2">
              <User className="h-4 w-4" /> {t.customer}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t.billingName} {formData.invoice_type === 'invoice' && '*'}
                </label>
                <input
                  required={formData.invoice_type === 'invoice'}
                  type="text"
                  name="billing_name"
                  value={formData.billing_name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

               {/* Y-tunnus: Show if invoice, or based on some checkbox. For now, showing for invoice always. */}
               {formData.invoice_type === 'invoice' && (
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Y-tunnus / SSN</label>
                   <input
                     type="text"
                     name="billing_ssn"
                     value={formData.billing_ssn}
                     onChange={handleInputChange}
                     placeholder="1234567-8"
                     className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                   />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.email}</label>
                <input
                  type="email"
                  name="billing_email"
                  value={formData.billing_email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.address}</label>
                <input
                  type="text"
                  name="address.street"
                  placeholder="Street Address"
                  value={formData.billing_address.street}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="address.postal_code"
                    placeholder={t.postalCode}
                    value={formData.billing_address.postal_code}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="address.city"
                    placeholder={t.city}
                    value={formData.billing_address.city}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold border-b pb-2">
              <FileText className="h-4 w-4" /> {t.invoice}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.status}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.type}</label>
                <select
                  name="invoice_type"
                  value={formData.invoice_type}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="invoice">Lasku (Invoice)</option>
                  <option value="receipt">Kuitti (Receipt)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.date}</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobilepay">MobilePay</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="klarna">Klarna</option>
                </select>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {locale === 'fi' ? 'Lisätiedot / Huomiot' : 'Notes / Additional Info'}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={locale === 'fi' ? 'Lisää huomioita tai lisätietoja...' : 'Add notes or additional information...'}
                rows={3}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-slate-900 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <CreditCard className="h-4 w-4" /> {t.items}
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" /> {t.add}
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-end bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-grow">
                   <label className="text-xs font-medium text-slate-600 block mb-1.5">{t.description}</label>
                   {/* Product Input with Browse Button */}
                   <div className="relative flex gap-2">
                      <input
                        type="text"
                        placeholder={locale === 'fi' ? 'Kirjoita tuote/palvelu kuvaus tai selaa...' : 'Type product/service or browse...'}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        className="flex-1 rounded-lg border-2 border-slate-200 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => openProductModal(index)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow"
                        title={locale === 'fi' ? 'Selaa tuotteita' : 'Browse products'}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {locale === 'fi' ? 'Selaa' : 'Browse'}
                      </button>
                   </div>
                </div>
                <div className="w-24">
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">{t.qty}</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", Number(e.target.value))}
                    className="w-full rounded-lg border-2 border-slate-200 bg-white p-2.5 text-sm text-center font-medium focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition-all"
                    min="1"
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    {locale === 'fi' ? 'Hinta (sis. ALV)' : 'Price (incl. VAT)'}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={grossPrices[index]}
                    onChange={(e) => handleGrossPriceChange(index, Number(e.target.value))}
                    className="w-full rounded-lg border-2 border-slate-200 bg-white p-2.5 text-sm text-right font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all"
                    step="0.01"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">{t.vat}</label>
                  <input
                    type="number"
                    placeholder="25.5"
                    value={item.vat_rate}
                    onChange={(e) => handleVatChange(index, Number(e.target.value))}
                    className="w-full rounded-lg border-2 border-slate-200 bg-white p-2.5 text-sm text-center font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                  />
                </div>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title={locale === 'fi' ? 'Poista rivi' : 'Remove line'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t mt-4">
             <div className="text-right">
                <div className="text-sm text-slate-500">{t.total}</div>
                <div className="text-2xl font-bold text-slate-900">{calculateTotal().toFixed(2)} €</div>
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
            <Link
             href={`/${locale}/dashboard/invoices`}
             className="px-6 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
            >
                {t.back}
            </Link>
            <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {loading ? t.saving : t.save}
            </button>
        </div>

      </form>

      {/* Product Selection Modal */}
      <Modal 
        isOpen={productModalOpen} 
        onClose={() => {
          setProductModalOpen(false);
          setCurrentLineIndex(null);
          setProductSearchFilter("");
        }}
        title={locale === 'fi' ? 'Valitse Tuote' : 'Select Product'}
      >
        <div className="space-y-4">
          {/* Search/Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={locale === 'fi' ? 'Hae tuotteita...' : 'Search products...'}
              value={productSearchFilter}
              onChange={(e) => setProductSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          {/* Products List */}
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {products
              .filter(p => 
                productSearchFilter === "" ||
                p.name.toLowerCase().includes(productSearchFilter.toLowerCase()) ||
                p.sku?.toLowerCase().includes(productSearchFilter.toLowerCase())
              )
              .map(product => {
                const imageUrl = product.files?.[0]
                  ? `http://185.96.163.183:8000/api/v1/storage/${product.files[0].namespace}/${product.files[0].entity_id}/${product.files[0].filename}`
                  : null;
                const price = product.sale_price || product.regular_price;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => currentLineIndex !== null && handleProductSelect(currentLineIndex, product)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    {/* Product Image/Avatar */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate group-hover:text-blue-600">
                        {product.name}
                      </h4>
                      {product.sku && (
                        <p className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-blue-600">
                          {price}€
                        </span>
                        {product.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            product.status === 'active' ? 'bg-green-100 text-green-700' :
                            product.status === 'sold' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {product.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Select Indicator */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            
            {products.filter(p => 
              productSearchFilter === "" ||
              p.name.toLowerCase().includes(productSearchFilter.toLowerCase()) ||
              p.sku?.toLowerCase().includes(productSearchFilter.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>{locale === 'fi' ? 'Tuotteita ei löytynyt' : 'No products found'}</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
