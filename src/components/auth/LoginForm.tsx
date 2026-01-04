"use client";

import { useState, FormEvent } from "react";
import type { AuthFormText } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

type LoginFormProps = {
  content: AuthFormText;
  supportEmail: string;
  locale: Locale;
};

export function LoginForm({ content, supportEmail, locale }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const createHref = (path: string) => (path.startsWith("/") ? `/${locale}${path}` : path);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError("Kirjautuminen epäonnistui. Tarkista käyttäjätunnus ja salasana.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-[32px] border border-[#dfd2c0] bg-[#fffdf7] p-8 shadow-[0_30px_80px_rgba(31,27,22,0.12)]">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-[#1f1b16]">{content.title}</h1>
        <p className="text-sm text-[#6a5c4b]">{content.description}</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-[#3b3126]">
            {content.emailLabel}
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className="w-full rounded-2xl border border-[#d8c8b1] bg-white px-4 py-3 text-sm text-[#1f1b16] focus:border-[#7c5a33] focus:outline-none focus:ring-2 focus:ring-[#c58a48]/30"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-[#3b3126]">
            {content.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-2xl border border-[#d8c8b1] bg-white px-4 py-3 text-sm text-[#1f1b16] focus:border-[#7c5a33] focus:outline-none focus:ring-2 focus:ring-[#c58a48]/30"
            placeholder="••••••••"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#4a3d31]">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-[#d8c8b1] text-[#3a5a40] focus:ring-[#3a5a40]"
            />
            {content.rememberLabel}
          </label>
          <a
            href={createHref(content.forgotHref)}
            className="font-semibold text-[#3a5a40] transition hover:text-[#1f1b16]"
          >
            {content.forgotLabel}
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-full bg-[#1f1b16] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : content.submitLabel}
        </button>
      </form>

      {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

      <div className="rounded-2xl border border-[#e2d5c5] bg-white/70 p-4 text-center text-sm text-[#4a3d31]">
        <p>{content.supportLabel}</p>
        <a href={`mailto:${supportEmail}`} className="font-semibold text-[#1f1b16]">
          {supportEmail}
        </a>
      </div>

      <div className="text-center text-sm text-[#4a3d31]">
        {content.switchLabel}
        <a
          href={createHref(content.switchHref)}
          className="ml-2 font-semibold text-[#3a5a40] transition hover:text-[#1f1b16]"
        >
          {content.switchActionLabel}
        </a>
      </div>
    </div>
  );
}
