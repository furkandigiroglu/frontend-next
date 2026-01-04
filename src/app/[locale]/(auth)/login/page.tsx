import { notFound } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { siteConfig } from "@/lib/siteConfig";
import { getDictionary } from "@/i18n/getDictionary";
import { locales, type Locale } from "@/i18n/config";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }
  const dictionary = await getDictionary(locale);
  const { login } = dictionary.auth;

  return (
    <main className="px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-[#6a5c4b]">Ehankki ID</p>
          <h1 className="text-4xl font-semibold text-[#1f1b16]">{login.title}</h1>
          <p className="text-base text-[#4a3d31]">{login.description}</p>
          <ul className="space-y-3 text-sm text-[#4a3d31]">
            {login.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <LoginForm content={login} supportEmail={siteConfig.contactEmail} locale={locale} />
      </div>
    </main>
  );
}
