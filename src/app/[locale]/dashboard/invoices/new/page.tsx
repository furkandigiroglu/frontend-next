import { AdminCreateInvoice } from "@/components/admin/AdminCreateInvoice";

export default async function CreateInvoicePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  return <AdminCreateInvoice locale={locale} />;
}
