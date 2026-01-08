import { AdminInvoiceList } from "@/components/admin/AdminInvoiceList";
import type { Locale } from "@/i18n/config";

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500">Manage invoices and receipts.</p>
      </div>
      <AdminInvoiceList locale={locale} />
    </div>
  );
}
