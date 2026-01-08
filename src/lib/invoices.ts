import { Invoice, InvoiceListResponse, InvoiceStatus, ParsedInvoice, LegacyInvoice } from "@/types/invoice";
import { siteConfig } from "./siteConfig";

const apiBase = siteConfig.apiUrl;

// ============================================
// NEW API - M2tähti OY (PostgreSQL)
// ============================================

export async function fetchInvoicesNew(
  token: string,
  options?: {
    skip?: number;
    limit?: number;
    status?: InvoiceStatus;
    company_id?: number;
    search?: string;
  }
): Promise<InvoiceListResponse> {
  const params = new URLSearchParams();
  if (options?.skip) params.set("skip", options.skip.toString());
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.status) params.set("status", options.status);
  if (options?.company_id) params.set("company_id", options.company_id.toString());
  if (options?.search) params.set("search", options.search);

  try {
    const response = await fetch(`${apiBase}/api/v1/invoices?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { items: [], total: 0, skip: 0, limit: 50 };
  }
}

export async function fetchInvoiceById(token: string, invoiceId: string): Promise<Invoice | null> {
  try {
    const response = await fetch(`${apiBase}/api/v1/invoices/${invoiceId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoice");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

export async function updateInvoiceStatus(
  token: string,
  invoiceId: string,
  status: InvoiceStatus
): Promise<boolean> {
  try {
    const response = await fetch(`${apiBase}/api/v1/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating invoice:", error);
    return false;
  }
}

export function getInvoicePdfUrl(invoiceId: string): string {
  return `${apiBase}/api/v1/invoices/${invoiceId}/pdf`;
}

// ============================================
// LEGACY API - Backward compatibility
// ============================================

function parseJSON<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

export async function fetchInvoices(): Promise<ParsedInvoice[]> {
  if (!apiBase) return [];

  try {
    const response = await fetch(`${apiBase}/invoices`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    const data: LegacyInvoice[] = await response.json();

    return data.map((invoice) => ({
      ...invoice,
      products: parseJSON(invoice.products) || [],
      customer: parseJSON(invoice.customer) || { name: "Unknown", email: "", address: "", phone: "" },
    }));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export async function deleteInvoice(id: number): Promise<boolean> {
  if (!apiBase) return false;

  try {
    const response = await fetch(`${apiBase}/invoices/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return false;
  }
}

// ============================================
// HELPERS
// ============================================

export const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  void: "bg-red-100 text-red-700",
  Paid: "bg-green-100 text-green-700",
  Unpaid: "bg-yellow-100 text-yellow-700",
};

export const statusLabels: Record<string, { fi: string; en: string }> = {
  draft: { fi: "Luonnos", en: "Draft" },
  sent: { fi: "Lähetetty", en: "Sent" },
  paid: { fi: "Maksettu", en: "Paid" },
  void: { fi: "Peruttu", en: "Void" },
};

export const companyInfo: Record<number, { name: string; bank: string; iban: string }> = {
  1: {
    name: "M2tähti OY (Ehankki)",
    bank: "Holvi",
    iban: "FI05 7997 7990 8883 69",
  },
  2: {
    name: "Mytavarat OY",
    bank: "Evli",
    iban: "FI93 7140 1420 0381 98",
  },
};
