import { fetchInvoices } from "@/lib/invoices";
import { InvoicesTable } from "@/components/dashboard/InvoicesTable";
import type { Locale } from "@/i18n/config";

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const invoices = await fetchInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Laskut</h1>
        <p className="text-sm text-slate-500">Hallitse laskuja ja kuitteja.</p>
      </div>
      <InvoicesTable invoices={invoices} locale={locale} />
    </div>
  );
}
