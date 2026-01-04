import { CartClient } from "@/components/cart/CartClient";
import { Locale } from "@/i18n/config";

export const metadata = {
  title: "Shopping Cart | Ehankki",
  description: "Review your shopping cart items.",
};

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <CartClient locale={locale} />;
}
