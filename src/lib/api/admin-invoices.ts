import { siteConfig } from "@/lib/siteConfig";

const API = `${siteConfig.apiUrl}/api/v1`;

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  total: number;
}

export interface InvoiceTotals {
  net_total: number;
  vat_total: number;
  grand_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  billing_name: string;
  billing_email: string;
  total: number;
  created_at: string;
  payment_method: string;
  line_items: InvoiceLineItem[];
  totals?: InvoiceTotals;
  // Add other fields as needed
}

export async function getInvoices(token: string, params?: {
  status?: string;
  invoice_type?: string;
  start_date?: string;
  end_date?: string;
  customer_name?: string;
  limit?: number;
  skip?: number;
}) {
  const queryParams: any = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        queryParams[key] = String(value);
      }
    });
  }
  const query = new URLSearchParams(queryParams).toString();
  const res = await fetch(`${API}/invoices?${query}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  
  const data = await res.json();

  return data.map((inv: any) => {
    // Priority 1: Use the explicit total from the API if available (backend_new style)
    if (inv.total !== undefined && inv.total !== null) {
        return {
          ...inv,
          id: String(inv.id),
          invoice_number: String(inv.invoice_number || inv.id),
          total: Number(inv.total),
          created_at: inv.created_at || inv.date || new Date().toISOString(),
          billing_email: inv.billing_email || inv.customer
        };
    }

    // Priority 2: Calculate from line_items
    if (inv.line_items && Array.isArray(inv.line_items)) {
         const calculatedTotal = inv.line_items.reduce((sum: number, item: any) => {
             const price = Number(item.unit_price || 0);
             const qty = Number(item.quantity || 1);
             return sum + (price * qty);
         }, 0);
         
         return {
            ...inv,
            id: String(inv.id),
            invoice_number: String(inv.invoice_number || inv.id),
            total: calculatedTotal,
            created_at: inv.created_at || inv.date || new Date().toISOString(),
            billing_email: inv.billing_email || inv.customer
         };
    }

    // Priority 3: Legacy calculation (for older invoices)
    let total = 0;
    try {
      let products = inv.products;
      if (typeof products === 'string') {
          try {
              products = JSON.parse(products);
              // Handle potential double-encoding
              if (typeof products === 'string') {
                  products = JSON.parse(products);
              }
          } catch (e) {
              console.error('Error parsing products JSON:', e);
              products = [];
          }
      }
      
      if (!products) products = [];

      if (Array.isArray(products)) {
        total = products.reduce((sum: number, p: any) => {
          let price = p.price || p.unit_price || p.amount || 0;
          let qty = p.quantity || p.qty || 1;
          
          if (typeof price === 'string') price = price.replace(',', '.');
          if (typeof qty === 'string') qty = qty.replace(',', '.');
          
          const lineTotal = Number(price) * Number(qty);
          return sum + (isNaN(lineTotal) ? 0 : lineTotal);
        }, 0);
      }
    } catch (e) {
      console.error('Error calculating total for invoice:', inv.id, e);
    }

    return {
      ...inv,
      id: String(inv.id),
      invoice_number: String(inv.id),
      total: total,
      created_at: inv.date || new Date().toISOString(),
      billing_email: inv.customer // Using customer field as text
    };
  });
}

export async function getInvoice(token: string, id: string) {
  const res = await fetch(`${API}/invoices/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch invoice');
  return res.json();
}

export function getPdfUrl(invoiceId: string) {
  return `${API}/invoices/${invoiceId}/pdf`;
}

export function getCustomPdfUrl(invoiceId: string, type: 'invoice' | 'receipt') {
    // backend_new only supports /pdf endpoint for now (invoice)
    // We append the query param 'doc_type' so the backend can use it when implemented
    return `${API}/invoices/${invoiceId}/pdf?doc_type=${type}`;
}

export async function getStats(token: string) {
  try {
    const res = await fetch(`${API}/invoices/stats/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        return res.json();
    }
  } catch (error) {
    console.warn('Invoice stats endpoint failed, falling back to client-side calculation', error);
  }

  // Fallback: Calculate stats from all invoices
  try {
    const invoices = await getInvoices(token);
    const stats = {
      total_invoices: invoices.length,
      total_revenue: invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0),
      total_tax: 0,
      by_status: {
        paid: 0,
        sent: 0,
        overdue: 0,
        void: 0,
        draft: 0
      }
    };

    invoices.forEach((inv: any) => {
        const s = inv.status as string;
        if (s in stats.by_status) {
            (stats.by_status as any)[s]++;
        } else {
             // Treat pending/others as draft or separate?
             // If pending is common, maybe map it to draft
             if (s === 'pending') stats.by_status.draft++;
        }
    });
    return stats;
  } catch (e) {
    console.error('Failed to calculate stats:', e);
    return null;
  }
}

export async function updateInvoiceStatus(token: string, id: string, status: string) {
  const res = await fetch(`${API}/invoices/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update invoice status');
  return res.json();
}

// ❌ Soft delete (sadece status void yapar)
export async function deleteInvoice(token: string, id: string) {
  const res = await fetch(`${API}/invoices/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to void invoice');
  return;
}

// ✅ Hard delete (database'den tamamen siler)
export async function hardDeleteInvoice(token: string, id: string) {
  const res = await fetch(`${API}/invoices/${id}/hard`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to permanently delete invoice');
  return;
}

export async function createInvoice(token: string, data: any) {
  // Ensure line items are numbers
  if (data.line_items) {
    data.line_items = data.line_items.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      vat_rate: Number(item.vat_rate),
      discount_percent: Number(item.discount_percent || 0),
    }));
  }

  const res = await fetch(`${API}/invoices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || 'Failed to create invoice');
  }
  return res.json();
}

