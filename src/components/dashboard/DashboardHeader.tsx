"use client";

import { useEffect, useState } from "react";
import { getProfile, getToken, type User } from "@/lib/auth";
import { User as UserIcon } from "lucide-react";

export function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      getProfile(token)
        .then(setUser)
        .catch(console.error);
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">Hallintapaneeli</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            <UserIcon className="h-4 w-4 text-slate-600" />
          </div>
          <div className="hidden text-sm md:block">
            <p className="font-medium text-slate-900">{user?.full_name || "Ladataan..."}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
