import { AdminInvoiceDetail } from "@/components/admin/AdminInvoiceDetail";
import type { Locale } from "@/i18n/config";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <AdminInvoiceDetail id={id} locale={locale} />
  );
}
