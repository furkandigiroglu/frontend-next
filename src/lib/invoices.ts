import { Invoice, ParsedInvoice } from "@/types/invoice";

const apiBase =
  process.env.NEXT_PUBLIC_EHANKKI_API_URL ??
  process.env.EHANKKI_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "";

function parseJSON<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    // console.error("Failed to parse JSON:", jsonString, e);
    return null;
  }
}

export async function fetchInvoices(): Promise<ParsedInvoice[]> {
  if (!apiBase) return [];

  try {
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/invoices`, {
      next: { revalidate: 0 }, // Always fetch fresh data for admin
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    const data: Invoice[] = await response.json();

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
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/invoices/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return false;
  }
}
