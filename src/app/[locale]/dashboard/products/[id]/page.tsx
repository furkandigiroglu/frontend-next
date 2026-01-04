import { EditProductClient } from "@/components/dashboard/EditProductClient";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale);

  return <EditProductClient id={id} locale={locale} dict={dict} />;
}
