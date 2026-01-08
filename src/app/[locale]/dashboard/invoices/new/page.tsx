import { AdminCreateInvoice } from "@/components/admin/AdminCreateInvoice";

export default function CreateInvoicePage({ params: { locale } }: { params: { locale: string } }) {
  return <AdminCreateInvoice locale={locale} />;
}
