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

export interface Invoice {
  id: number;
  products: string; // JSON string
  customer: string; // JSON string
  type: string;
  paydetails: string;
  lastday: string;
  date: string;
  status: string;
  ext1?: string;
  ext2?: string;
}

export interface ParsedInvoice extends Omit<Invoice, 'products' | 'customer'> {
  products: InvoiceProduct[];
  customer: InvoiceCustomer;
}
