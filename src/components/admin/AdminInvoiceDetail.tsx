"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInvoice, Invoice, getPdfUrl, updateInvoiceStatus, deleteInvoice } from "@/lib/api/admin-invoices";
import { Loader2, ArrowLeft, Download, Ban, CheckCircle, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminInvoiceDetail({ id, locale }: { id: string, locale: string }) {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getInvoice(token, id);
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token, isAuthenticated, authLoading]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!token || !invoice) return;
    if (!confirm(`Are you sure you want to mark this invoice as ${newStatus}?`)) return;

    setUpdating(true);
    try {
      const updated = await updateInvoiceStatus(token, invoice.id, newStatus);
      setInvoice(updated);
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleVoid = async () => {
    if (!token || !invoice) return;
    if (!confirm("Are you sure you want to void this invoice? This cannot be undone.")) return;
    
    setUpdating(true);
    try {
      await deleteInvoice(token, invoice.id);
      // Refresh to show updated status (usually API returns void status or 404? API is soft delete -> void)
      // Re-fetch
      const data = await getInvoice(token, id);
      setInvoice(data);
    } catch (error) {
      alert("Failed to void invoice");
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  if (!isAuthenticated) return <div className="p-8 text-center">Please login.</div>;
  if (!invoice) return <div className="p-8 text-center">Invoice not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/dashboard/invoices`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoice {invoice.invoice_number}</h1>
            <p className="text-sm text-slate-500">Created on {new Date(invoice.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <a
              href={getPdfUrl(invoice.id)}
              download
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
             <h3 className="mb-4 text-lg font-semibold text-slate-900">Line Items</h3>
             <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                        <th className="py-2">Description</th>
                        <th className="py-2 text-right">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Tax</th>
                        <th className="py-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {invoice.line_items?.map((item, i) => (
                        <tr key={i}>
                            <td className="py-3">{item.description}</td>
                            <td className="py-3 text-right">{item.quantity}</td>
                            <td className="py-3 text-right">{item.unit_price} €</td>
                            <td className="py-3 text-right">{item.vat_rate}%</td>
                            <td className="py-3 text-right font-medium">{item.total} €</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="border-t border-slate-100">
                    <tr>
                        <td colSpan={4} className="py-2 text-right font-medium">Subtotal</td>
                        <td className="py-2 text-right">{invoice.totals?.net_total} €</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="py-2 text-right font-medium">VAT</td>
                        <td className="py-2 text-right">{invoice.totals?.vat_total} €</td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="py-4 text-right font-bold text-lg">Total</td>
                        <td className="py-4 text-right font-bold text-lg">{invoice.total} €</td>
                    </tr>
                </tfoot>
             </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Status</h3>
                <div className="mb-6">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'void' ? 'bg-slate-100 text-slate-700' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {invoice.status.toUpperCase()}
                    </span>
                </div>
                
                <div className="space-y-2">
                    {invoice.status !== 'paid' && invoice.status !== 'void' && (
                        <button 
                            onClick={() => handleStatusUpdate('paid')}
                            disabled={updating}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            <CheckCircle className="h-4 w-4" /> Mark as Paid
                        </button>
                    )}
                    {invoice.status === 'draft' && (
                        <button 
                            onClick={() => handleStatusUpdate('sent')}
                            disabled={updating}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" /> Mark as Sent
                        </button>
                    )}
                    {invoice.status !== 'void' && (
                        <button 
                            onClick={handleVoid}
                            disabled={updating}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            <Ban className="h-4 w-4" /> Void Invoice
                        </button>
                    )}
                </div>
            </div>

            {/* Customer Info */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Customer</h3>
                <div className="space-y-3 text-sm">
                    <div>
                        <div className="text-slate-500">Name</div>
                        <div className="font-medium">{invoice.billing_name}</div>
                    </div>
                    <div>
                        <div className="text-slate-500">Email</div>
                        <div className="font-medium">{invoice.billing_email}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
