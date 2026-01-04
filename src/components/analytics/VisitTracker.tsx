"use client";

import { useEffect } from "react";

type VisitTrackerProps = {
  pageId: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_EHANKKI_API_URL;

export function VisitTracker({ pageId }: VisitTrackerProps) {
  useEffect(() => {
    if (!apiUrl || typeof window === "undefined") {
      return;
    }

    const storageKey = `ehankki-visit-${pageId}`;
    if (window.localStorage.getItem(storageKey)) {
      return;
    }

    window.localStorage.setItem(storageKey, "true");

    fetch(`${apiUrl}/statvisit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pageId }),
      keepalive: true,
    }).catch(() => {
      window.localStorage.removeItem(storageKey);
    });
  }, [pageId]);

  return null;
}
