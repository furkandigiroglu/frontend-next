import type { Locale } from "@/i18n/config";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tilastot</h1>
        <p className="text-sm text-slate-500">Katso myyntiraportit ja kävijätilastot.</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        Tilastot tulossa pian...
      </div>
    </div>
  );
}
