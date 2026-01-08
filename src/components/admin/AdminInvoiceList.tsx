"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInvoices, Invoice, getCustomPdfUrl, deleteInvoice, hardDeleteInvoice } from "@/lib/api/admin-invoices";
import { FileText, Search, Loader2, Download, Eye, Trash2, Receipt, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function AdminInvoiceList({ locale }: { locale: string }) {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getInvoices(token, {
           status: statusFilter || undefined,
           customer_name: searchTerm || undefined
        });
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
        fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [token, isAuthenticated, authLoading, statusFilter, searchTerm]);

  if (authLoading) return <div className="p-8 text-center">Loading auth...</div>;
  if (!isAuthenticated) return <div className="p-8 text-center">Please login to view invoices.</div>;

  return (
    <div className="space-y-4">
       {/* Actions Bar */}
       <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
             {locale === "fi" ? "Laskut" : "Invoices"}
        </h2>
        <Link
            href={`/${locale}/dashboard/invoices/new`}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
            <Plus className="h-4 w-4" />
            {locale === "fi" ? "Uusi Lasku" : "New Invoice"}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="sent">Sent</option>
          <option value="overdue">Overdue</option>
          <option value="void">Void</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {invoice.billing_name}
                      <div className="text-xs text-slate-400">{invoice.billing_email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {Number(invoice.total ?? 0).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/dashboard/invoices/${invoice.id}`}
                          className="rounded-md p-1 hover:bg-slate-100 text-slate-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        {/* Only show Invoice (Lasku) button if NOT paid (or always if needed, but receipt is for paid) */}
                         <a
                          href={getCustomPdfUrl(invoice.id, 'invoice')}
                          className="rounded-md p-1 hover:bg-slate-100 text-slate-600"
                          title={locale === "fi" ? "Lataa Lasku" : "Download Invoice"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                        
                        {/* Only show Receipt (Kuitti) if PAID */}
                        {invoice.status === 'paid' && (
                        <a
                          href={getCustomPdfUrl(invoice.id, 'receipt')}
                          className="rounded-md p-1 hover:bg-slate-100 text-slate-600"
                          title={locale === "fi" ? "Lataa Kuitti" : "Download Receipt"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Receipt className="h-4 w-4" />
                        </a>
                        )}
                        
                        <button
                          onClick={async () => {
                            if (invoice.status === 'void') {
                                // Hard Delete
                                if (confirm(locale === "fi" ? "Haluatko varmasti poistaa tämän laskun pysyvästi? Tätä ei voi peruuttaa." : "Are you sure you want to permanently delete this invoice? This cannot be undone.")) {
                                  try {
                                    await hardDeleteInvoice(token!, invoice.id);
                                    setInvoices(invoices.filter(i => i.id !== invoice.id));
                                  } catch (error) {
                                    alert(locale === "fi" ? "Poisto epäonnistui" : "Failed to delete");
                                  }
                                }
                            } else {
                                // Soft Delete (Void)
                                if (confirm(locale === "fi" ? "Haluatko varmasti mitätöidä tämän laskun?" : "Are you sure you want to void this invoice?")) {
                                  try {
                                    await deleteInvoice(token!, invoice.id);
                                    // Update status locally instead of removing
                                    setInvoices(invoices.map(i => i.id === invoice.id ? { ...i, status: 'void' } : i));
                                  } catch (error) {
                                    alert(locale === "fi" ? "Laskun mitätöinti epäonnistui" : "Failed to void invoice");
                                  }
                                }
                            }
                          }}
                          className={`rounded-md p-1 hover:bg-red-50 text-slate-600 ${invoice.status === 'void' ? 'text-red-400 hover:text-red-800' : 'hover:text-red-600'}`}
                          title={
                              invoice.status === 'void' 
                              ? (locale === "fi" ? "Poista pysyvästi" : "Delete Permanently") 
                              : (locale === "fi" ? "Mitätöi" : "Void")
                          }
                        >
                          {invoice.status === 'void' ? <XCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    sent: "bg-blue-100 text-blue-700",
    overdue: "bg-red-100 text-red-700",
    void: "bg-slate-100 text-slate-700",
    draft: "bg-yellow-100 text-yellow-700",
  };
  
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status] || styles.draft}`}>
      {label}
    </span>
  );
}
