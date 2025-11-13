"use client";

import { useCallback, useEffect, useState } from "react";

export type MeteredUsagePass = {
  id: string;
  planCode: string;
  remainingUses: number;
  expiresAt: string | null;
  source?: string;
  notes?: string;
};

export type MeteredUsageSummary = {
  totalRemaining: number;
  passes: MeteredUsagePass[];
};

const DEFAULT_SUMMARY: MeteredUsageSummary = { totalRemaining: 0, passes: [] };

export function useMeteredUsage(pollingMs = 60_000) {
  const [summary, setSummary] = useState<MeteredUsageSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/metered/remaining", {
        method: "GET",
        credentials: "include",
      });
      if (response.status === 401) {
        setSummary(DEFAULT_SUMMARY);
        setError(null);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch metered usage");
      }
      const data = (await response.json()) as MeteredUsageSummary;
      setSummary(data);
      setError(null);
    } catch (err) {
      console.error("Metered usage fetch failed", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      refresh();
    }
    if (pollingMs <= 0) {
      return () => {
        mounted = false;
      };
    }
    const interval = setInterval(() => {
      refresh().catch(() => {
        /* already handled */
      });
    }, pollingMs);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingMs, refresh]);

  return { summary, loading, error, refresh };
}
