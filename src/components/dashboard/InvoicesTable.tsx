"use client";

import { useState } from "react";
import { FileText, Trash2, Search, Plus } from "lucide-react";
import type { ParsedInvoice } from "@/types/invoice";
import Link from "next/link";
import { deleteInvoice } from "@/lib/invoices";
import { useRouter } from "next/navigation";

type InvoicesTableProps = {
  invoices: ParsedInvoice[];
  locale: string;
};

export function InvoicesTable({ invoices, locale }: InvoicesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState(invoices);
  const router = useRouter();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const lower = term.toLowerCase();
    const filtered = invoices.filter(
      (inv) =>
        inv.customer.name.toLowerCase().includes(lower) ||
        String(inv.id).includes(lower) ||
        inv.date.includes(lower)
    );
    setFilteredInvoices(filtered);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      const success = await deleteInvoice(id);
      if (success) {
        setFilteredInvoices(filteredInvoices.filter((inv) => inv.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete invoice");
      }
    }
  };

  const calculateTotal = (products: any[]) => {
    return products.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  };

  const apiBase =
  process.env.NEXT_PUBLIC_EHANKKI_API_URL ??
  process.env.EHANKKI_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://185.96.163.183:8000/api/v1";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Hae laskuja..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
        <Link
          href={`/${locale}/dashboard/invoices/new`}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Uusi lasku
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Asiakas</th>
              <th className="px-4 py-3 font-medium">Päivämäärä</th>
              <th className="px-4 py-3 font-medium">Summa</th>
              <th className="px-4 py-3 font-medium">Tila</th>
              <th className="px-4 py-3 font-medium text-right">Toiminnot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">#{invoice.id}</td>
                <td className="px-4 py-3 text-slate-600">{invoice.customer.name}</td>
                <td className="px-4 py-3 text-slate-600">{invoice.date}</td>
                <td className="px-4 py-3 text-slate-600">
                  {calculateTotal(invoice.products).toFixed(2)} €
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      invoice.status === "Paid"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`${apiBase.replace(/\/$/, "")}/invoices/${invoice.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                      title="Lataa PDF"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Poista"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
