// Invoice Types - M2tähti OY (PostgreSQL)

export enum InvoiceStatus {
  draft = "draft",
  sent = "sent",
  paid = "paid",
  void = "void"
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: string;
  vat_rate: string;
  discount_percent?: string;
  total?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  company_id: number;
  status: InvoiceStatus;
  due_date: string;
  billing_name: string;
  billing_email: string;
  billing_address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
  line_items: LineItem[];
  subtotal: number;
  tax_total: number;
  total: number;
  payment_method: string;
  pdf_filename?: string | null;
  extra?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceListResponse {
  items: Invoice[];
  total: number;
  skip: number;
  limit: number;
}

// Legacy types for backward compatibility
export interface InvoiceProduct {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceCustomer {
  name: string;
  email: string;
  address: string;
  phone: string;
  businessId?: string;
}

export interface LegacyInvoice {
  id: number;
  products: string;
  customer: string;
  type: string;
  paydetails: string;
  lastday: string;
  date: string;
  status: string;
  ext1?: string;
  ext2?: string;
}

export interface ParsedInvoice extends Omit<LegacyInvoice, 'products' | 'customer'> {
  products: InvoiceProduct[];
  customer: InvoiceCustomer;
}
