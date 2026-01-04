import { ProductForm } from "@/components/dashboard/ProductForm";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{dict.dashboard.productForm.titleNew}</h2>
        <p className="text-slate-500">{dict.dashboard.productForm.subtitleNew}</p>
      </div>

      <ProductForm locale={locale} dict={dict} />
    </div>
  );
}
