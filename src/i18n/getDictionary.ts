import type { Dictionary } from "@/types/dictionary";
import type { Locale } from "./config";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fi: () => import("@/locales/fi").then((module) => module.default),
  en: () => import("@/locales/en").then((module) => module.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loadDictionary = dictionaries[locale];
  if (!loadDictionary) {
    throw new Error(`Dictionary for locale ${locale} not found`);
  }
  return loadDictionary();
}
