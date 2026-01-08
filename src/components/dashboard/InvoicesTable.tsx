"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Download, Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { fetchInvoicesNew, statusColors, statusLabels, getInvoicePdfUrl, updateInvoiceStatus } from "@/lib/invoices";
import { getToken } from "@/lib/auth";
import { siteConfig } from "@/lib/siteConfig";

type InvoicesTableProps = {
  locale: string;
};

export function InvoicesTable({ locale }: InvoicesTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadInvoices = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await fetchInvoicesNew(token, {
      skip: page * limit,
      limit,
      status: statusFilter || undefined,
      search: searchTerm || undefined,
    });

    setInvoices(response.items);
    setTotal(response.total);
    setLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadInvoices();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    const token = getToken();
    if (!token) return;

    const success = await updateInvoiceStatus(token, invoiceId, newStatus);
    if (success) {
      loadInvoices();
    } else {
      alert("Tilan päivitys epäonnistui");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "fi" ? "fi-FI" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString(locale === "fi" ? "fi-FI" : "en-US", {
      style: "currency",
      currency: "EUR",
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={locale === "fi" ? "Hae nimellä tai emaililla..." : "Search by name or email..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as InvoiceStatus | "");
            setPage(0);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">{locale === "fi" ? "Kaikki tilat" : "All statuses"}</option>
          <option value="draft">{locale === "fi" ? "Luonnos" : "Draft"}</option>
          <option value="sent">{locale === "fi" ? "Lähetetty" : "Sent"}</option>
          <option value="paid">{locale === "fi" ? "Maksettu" : "Paid"}</option>
          <option value="void">{locale === "fi" ? "Peruttu" : "Void"}</option>
        </select>

        <button
          onClick={loadInvoices}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {locale === "fi" ? "Päivitä" : "Refresh"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{locale === "fi" ? "Laskun nro" : "Invoice #"}</th>
              <th className="px-4 py-3 font-medium">{locale === "fi" ? "Asiakas" : "Customer"}</th>
              <th className="px-4 py-3 font-medium">{locale === "fi" ? "Päivämäärä" : "Date"}</th>
              <th className="px-4 py-3 font-medium">{locale === "fi" ? "Summa" : "Amount"}</th>
              <th className="px-4 py-3 font-medium">{locale === "fi" ? "Tila" : "Status"}</th>
              <th className="px-4 py-3 font-medium">{locale === "fi" ? "Maksu" : "Payment"}</th>
              <th className="px-4 py-3 font-medium text-right">{locale === "fi" ? "Toiminnot" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  <RefreshCw className="inline-block h-5 w-5 animate-spin mr-2" />
                  {locale === "fi" ? "Ladataan..." : "Loading..."}
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  {locale === "fi" ? "Ei laskuja" : "No invoices found"}
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900">{invoice.billing_name}</div>
                    <div className="text-xs text-slate-500">{invoice.billing_email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(invoice.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {formatPrice(invoice.total)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                      className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${statusColors[invoice.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      <option value="draft">{statusLabels.draft[locale as "fi" | "en"] || "Draft"}</option>
                      <option value="sent">{statusLabels.sent[locale as "fi" | "en"] || "Sent"}</option>
                      <option value="paid">{statusLabels.paid[locale as "fi" | "en"] || "Paid"}</option>
                      <option value="void">{statusLabels.void[locale as "fi" | "en"] || "Void"}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize">
                    {invoice.payment_method || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`${siteConfig.apiUrl}/api/v1/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                        title={locale === "fi" ? "Lataa PDF" : "Download PDF"}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {locale === "fi"
              ? `Näytetään ${page * limit + 1}-${Math.min((page + 1) * limit, total)} / ${total}`
              : `Showing ${page * limit + 1}-${Math.min((page + 1) * limit, total)} of ${total}`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
