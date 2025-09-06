import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGetEmotions } from "../hooks/useContract";
import { useAccount } from "wagmi";
import SiteNavbar from "../components/SiteNavbar";
import PortfolioSparkline from "../components/PortfolioSparkline";

interface EmotionRecord {
  emotion: string;
  timestamp: bigint;
}

interface RoadmapItemProps {
  record: EmotionRecord;
  onHover: (record: EmotionRecord | null) => void;
  onClick: (record: EmotionRecord) => void;
}

const JournalPage: React.FC = () => {
  const { address } = useAccount();
  const [queryUserId, setQueryUserId] = useState<string | undefined>(undefined);
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionRecord | null>(
    null
  );
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionRecord | null>(
    null
  );

  const { data: emotions, isLoading, error } = useGetEmotions(queryUserId);

  // Auto-load my journey when wallet is connected
  useEffect(() => {
    if (address) {
      setQueryUserId(address);
    } else {
      setQueryUserId(undefined);
    }
  }, [address]);

  // Close modal on ESC
  useEffect(() => {
    if (!selectedEmotion) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEmotion(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEmotion]);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Emojis and their gradient backgrounds removed per request

  // Try to parse an emotion string as JSON; supports either { success, data } or direct object
  interface JournalJsonData {
    id?: string;
    userId?: string;
    date?: string;
    market?: string | null;
    emotions?: string;
    mistakes?: string;
    lessons?: string | null;
    tags?: string[];
    trades?: unknown[];
    createdAt?: string;
    updatedAt?: string;
    // Optional richer fields
    exchangeData?: unknown;
    assets?: unknown[];
    positions?: unknown[];
    summary?: unknown;
  }

  // typed helper to check for a key in an unknown record
  const hasKey = (
    o: unknown,
    k: string
  ): o is Record<string, unknown> & { [key: string]: unknown } => {
    return !!o && typeof o === "object" && k in (o as Record<string, unknown>);
  };

  const parseEmotionJson = useCallback(
    (value: string): { root: unknown; data: JournalJsonData } | null => {
      try {
        const root = JSON.parse(value);
        const data = hasKey(root, "data")
          ? (root.data as JournalJsonData)
          : (root as JournalJsonData);
        return { root, data };
      } catch {
        return null;
      }
    },
    []
  );

  // helpers for safe rendering of unknown shapes
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === "object";

  const getKey = (o: Record<string, unknown> | undefined, k: string): unknown =>
    o ? o[k] : undefined;

  const pickStr = (
    o: Record<string, unknown>,
    keys: string[]
  ): string | undefined => {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return undefined;
  };

  const pickNum = (
    o: Record<string, unknown>,
    keys: string[]
  ): string | undefined => {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === "number") return String(v);
      if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v)))
        return v;
    }
    return undefined;
  };

  // compute totalUSDT from a journal JSON payload
  const computeTotalUSDT = (d: JournalJsonData): number | undefined => {
    const ex = isRecord(d.exchangeData) ? d.exchangeData : undefined;
    const combined = isRecord(getKey(ex, "combinedSummary"))
      ? (getKey(ex, "combinedSummary") as Record<string, unknown>)
      : undefined;
    const combinedTotal =
      combined && typeof combined.totalUSDT === "number"
        ? combined.totalUSDT
        : combined &&
          typeof combined.totalUSDT === "string" &&
          !Number.isNaN(Number(combined.totalUSDT))
        ? Number(combined.totalUSDT)
        : undefined;

    if (typeof combinedTotal === "number") return combinedTotal;

    const exchanges = getKey(ex, "exchanges");
    if (Array.isArray(exchanges)) {
      let sum = 0;
      for (const it of exchanges) {
        if (isRecord(it)) {
          const v = it.totalUSDT;
          if (typeof v === "number") sum += v;
          else if (typeof v === "string" && !Number.isNaN(Number(v)))
            sum += Number(v);
        }
      }
      if (sum > 0) return sum;
    }

    if (isRecord(d.summary)) {
      const v = d.summary["totalUSDT"];
      if (typeof v === "number") return v;
      if (typeof v === "string" && !Number.isNaN(Number(v))) return Number(v);
    }
    return undefined;
  };

  // Base sort by time ascending (for graph), and descending for list
  const sortedAsc = useMemo(() => {
    return emotions
      ? [...emotions].sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
      : [];
  }, [emotions]);
  const sortedDesc = [...sortedAsc].reverse();

  // Compute a totalUSDT time series from decrypted records
  const portfolioSeries = useMemo(() => {
    const points: { t: number; v: number }[] = [];
    for (const rec of sortedAsc) {
      const parsed = parseEmotionJson(rec.emotion);
      if (!parsed) continue;
      const d = parsed.data || {};
      // compute total from exchangeData or summary
      let total = 0;
      const ex = isRecord(d.exchangeData) ? d.exchangeData : undefined;
      const combined = isRecord(getKey(ex, "combinedSummary"))
        ? (getKey(ex, "combinedSummary") as Record<string, unknown>)
        : undefined;
      const combinedTotal =
        combined && typeof combined.totalUSDT === "number"
          ? combined.totalUSDT
          : combined &&
            typeof combined.totalUSDT === "string" &&
            !Number.isNaN(Number(combined.totalUSDT))
          ? Number(combined.totalUSDT)
          : undefined;

      if (typeof combinedTotal === "number") {
        total = combinedTotal;
      } else {
        // sum exchanges[].totalUSDT if present
        const exchanges = getKey(ex, "exchanges");
        if (Array.isArray(exchanges)) {
          let sum = 0;
          for (const it of exchanges) {
            if (isRecord(it)) {
              const v = it.totalUSDT;
              if (typeof v === "number") sum += v;
              else if (typeof v === "string" && !Number.isNaN(Number(v)))
                sum += Number(v);
            }
          }
          if (sum > 0) total = sum;
        }
      }

      // fallback to summary.totalUSDT at root if available
      if (!total && isRecord(d.summary)) {
        const v = (d.summary as Record<string, unknown>)["totalUSDT"];
        if (typeof v === "number") total = v;
        else if (typeof v === "string" && !Number.isNaN(Number(v)))
          total = Number(v);
      }

      if (Number.isFinite(total) && total > 0) {
        points.push({ t: Number(rec.timestamp), v: total });
      }
    }
    // Already in ascending order by timestamp due to sortedAsc loop
    return points;
  }, [sortedAsc, parseEmotionJson]);

  const RoadmapItem: React.FC<RoadmapItemProps> = ({
    record,
    onHover,
    onClick,
  }) => {
    // Parse JSON-based emotion string to derive display fields
    const parsed = parseEmotionJson(record.emotion);
    const d = parsed?.data || {};
    const title =
      d.emotions && typeof d.emotions === "string" && d.emotions.trim()
        ? (d.emotions as string)
        : record.emotion;
    const total = computeTotalUSDT(d);
    const ex = isRecord(d.exchangeData) ? d.exchangeData : undefined;
    const exs = getKey(ex, "exchanges");
    let exchangeLabel: string | undefined;
    if (
      Array.isArray(exs) &&
      exs.length > 0 &&
      isRecord(exs[0]) &&
      typeof exs[0].exchange === "string"
    ) {
      exchangeLabel = exs[0].exchange as string;
    }
    const tagList = Array.isArray(d.tags) ? d.tags.slice(0, 3) : [];

    return (
      <div
        className="relative bg-[#111] rounded-xl p-4 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] shadow-xl hover:shadow-2xl z-20"
        onMouseEnter={() => onHover(record)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(record)}
      >
        <div className="flex items-start">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold capitalize mb-1 text-lg truncate">
              {title}
            </h4>
            <p className="text-gray-300 text-sm">
              {formatTimestamp(record.timestamp)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {typeof total === "number" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#111] border border-[#2A2A2A] text-[#E0E0E0]">
                  Total ${total.toFixed(2)}
                </span>
              )}
              {exchangeLabel && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#111] border border-[#2A2A2A] text-[#E0E0E0]">
                  {exchangeLabel}
                </span>
              )}
              {tagList.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#0F0F0F] border border-[#2A2A2A] text-[#A0A0A0]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4FF00]/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <SiteNavbar />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Controls (no wallet address shown) */}
        {/* <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="text-gray-300 text-sm">
              You're viewing your journey
            </div>
            <button
              onClick={() => refetch()}
              disabled={!address}
              className="bg-gray-700 text-gray-200 py-2 px-4 rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div> */}

        {/* Results */}
        {queryUserId && (
          <div className="space-y-8">
            {/* Portfolio Trend */}
            <div className="bg-[#151515] border border-[#242424] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight">
                  Portfolio Trend
                </h2>
                <div className="text-sm text-[#A0A0A0]">
                  Data from your on-chain records
                </div>
              </div>
              <PortfolioSparkline data={portfolioSeries} />
            </div>

            {/* Journey timeline */}
            <div className="bg-[#151515] border border-[#242424] rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  My Journey
                </h2>
                {emotions && (
                  <p className="text-[#A0A0A0]">
                    {emotions.length} emotional milestone
                    {emotions.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {isLoading && (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2A2A2A] border-t-[#D4FF00]"></div>
                  <p className="mt-4 text-[#A0A0A0]">
                    Loading your crypto journey...
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-[#2A0F12] border border-red-500/40 text-red-300 px-6 py-4 rounded-xl mb-6">
                  ❌ Error loading emotions: {error.message}
                </div>
              )}

              {sortedDesc.length > 0 && !isLoading && (
                <div className="relative">
                  {/* Shining roadmap line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2">
                    <div className="w-full h-full bg-[#2A2A2A] rounded-full shadow-lg">
                      <div className="w-full h-full bg-[#2A2A2A] rounded-full animate-pulse opacity-70"></div>
                    </div>
                  </div>

                  {/* Emotions displayed chronologically */}
                  <div className="space-y-8 sm:space-y-12">
                    {sortedDesc.map((emotion, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <div
                          key={index}
                          className="relative flex items-center w-full"
                        >
                          {/* Connection line from main roadmap to emotion - shortened to not overlap with box */}
                          <div
                            className={`absolute top-1/2 h-0.5 bg-gradient-to-r transform -translate-y-1/2 z-0 ${
                              isEven
                                ? "left-1/2 w-16 sm:w-20 from-[#2A2A2A] to-[#2A2A2A]"
                                : "right-1/2 w-16 sm:w-20 from-[#2A2A2A] to-[#2A2A2A]"
                            }`}
                          ></div>

                          {/* Emotion node on the main line */}
                          <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-gradient-to-r from-[#D4FF00] to-[#BEF264] rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 ring-2 ring-[#0D0D0D]/40 shadow-lg"></div>

                          {/* Emotion card positioned alternately with solid background */}
                          <div
                            className={`flex w-full z-10 ${
                              isEven
                                ? "justify-end pr-4 sm:pr-8"
                                : "justify-start pl-4 sm:pl-8"
                            }`}
                          >
                            <div className="w-full max-w-xs sm:max-w-sm">
                              <RoadmapItem
                                record={emotion}
                                onHover={setHoveredEmotion}
                                onClick={setSelectedEmotion}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {sortedDesc.length === 0 && !isLoading && !error && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Journey Yet
                  </h3>
                  <p className="text-[#A0A0A0] mb-6">
                    This crypto journey hasn't begun. Start recording emotions
                    to see them mapped here!
                  </p>
                  <div className="bg-[#151515] border border-[#242424] rounded-xl p-6 max-w-md mx-auto">
                    <p className="text-[#E0E0E0] text-sm">
                      � Connect your wallet and record emotions as you learn
                      about crypto and DeFi
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emotion Detail Modal */}
        {selectedEmotion && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEmotion(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative bg-[#151515] border border-[#242424] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                aria-label="Close"
                onClick={() => setSelectedEmotion(null)}
                className="absolute top-3 right-3 h-9 w-9 rounded-lg bg-[#111] border border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="text-center">
                {(() => {
                  const parsed = parseEmotionJson(selectedEmotion.emotion);
                  const displayTitle =
                    parsed?.data?.emotions || selectedEmotion.emotion;
                  return (
                    <h3 className="text-2xl font-bold text-white capitalize mb-2 tracking-tight">
                      {displayTitle}
                    </h3>
                  );
                })()}
                <p className="text-[#A0A0A0] mb-6">
                  {formatTimestamp(selectedEmotion.timestamp)}
                </p>
                {/* JSON details if present */}
                {(() => {
                  const parsed = parseEmotionJson(selectedEmotion.emotion);
                  if (!parsed) return null;
                  const d = parsed.data || {};
                  return (
                    <div className="text-left bg-[#151515] border border-[#242424] rounded-xl p-4 mb-6 shadow-inner">
                      <h4 className="text-white font-semibold mb-3 tracking-tight">
                        Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {d.date && (
                          <div className="text-[#E0E0E0]">
                            <span className="text-[#A0A0A0]">Date:</span>{" "}
                            {new Date(d.date).toLocaleString()}
                          </div>
                        )}
                        {d.market && (
                          <div className="text-[#E0E0E0]">
                            <span className="text-[#A0A0A0]">Market:</span>{" "}
                            {d.market}
                          </div>
                        )}
                        {d.mistakes && (
                          <div className="text-[#E0E0E0]">
                            <span className="text-[#A0A0A0]">Mistakes:</span>{" "}
                            {d.mistakes}
                          </div>
                        )}
                        {d.lessons && (
                          <div className="text-[#E0E0E0]">
                            <span className="text-[#A0A0A0]">Lessons:</span>{" "}
                            {d.lessons}
                          </div>
                        )}
                        {Array.isArray(d.tags) && d.tags.length > 0 && (
                          <div className="text-[#E0E0E0]">
                            <span className="text-[#A0A0A0]">Tags:</span>{" "}
                            {d.tags.join(", ")}
                          </div>
                        )}
                      </div>

                      {(() => {
                        // Exchange snapshot (flexible parsing)
                        const ex = isRecord(d.exchangeData)
                          ? d.exchangeData
                          : undefined;
                        const combinedSummaryUnknown = getKey(
                          ex,
                          "combinedSummary"
                        );
                        const combinedSummary = isRecord(combinedSummaryUnknown)
                          ? (combinedSummaryUnknown as Record<string, unknown>)
                          : undefined;
                        const exSummaryUnknown = getKey(ex, "summary");
                        const summary = combinedSummary
                          ? combinedSummary
                          : isRecord(exSummaryUnknown)
                          ? (exSummaryUnknown as Record<string, unknown>)
                          : isRecord(d.summary)
                          ? d.summary
                          : undefined;
                        const exHoldings = getKey(ex, "holdings");
                        const csTopHoldings =
                          combinedSummary &&
                          Array.isArray(
                            getKey(combinedSummary, "topCombinedHoldings")
                          )
                            ? (getKey(
                                combinedSummary,
                                "topCombinedHoldings"
                              ) as unknown[])
                            : undefined;
                        const holdings: unknown[] | undefined = Array.isArray(
                          csTopHoldings
                        )
                          ? csTopHoldings
                          : Array.isArray(exHoldings)
                          ? (exHoldings as unknown[])
                          : Array.isArray(d.assets)
                          ? d.assets
                          : undefined;
                        const exPositions = getKey(ex, "positions");
                        const positions: unknown[] | undefined = Array.isArray(
                          exPositions
                        )
                          ? (exPositions as unknown[])
                          : Array.isArray(d.positions)
                          ? d.positions
                          : undefined;
                        const exchangesUnknown = getKey(ex, "exchanges");
                        const exchangesArr:
                          | Array<Record<string, unknown>>
                          | undefined = Array.isArray(exchangesUnknown)
                          ? (exchangesUnknown.filter((it) =>
                              isRecord(it)
                            ) as Array<Record<string, unknown>>)
                          : undefined;

                        if (!ex && !summary && !holdings && !positions)
                          return null;
                        return (
                          <div className="mt-4 border-t border-[#242424] pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-white font-semibold tracking-tight">
                                Portfolio Snapshot
                              </h5>
                              {summary &&
                                (() => {
                                  const total = getKey(
                                    summary as Record<string, unknown>,
                                    "totalUSDT"
                                  );
                                  if (
                                    typeof total === "number" ||
                                    (typeof total === "string" && total)
                                  ) {
                                    const num =
                                      typeof total === "number"
                                        ? total
                                        : Number(total);
                                    if (!Number.isNaN(num)) {
                                      return (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#111] border border-[#2A2A2A] text-[#E0E0E0]">
                                          Total $
                                          {num.toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                          })}
                                        </span>
                                      );
                                    }
                                  }
                                  return null;
                                })()}
                            </div>

                            {summary && (
                              <div className="mb-4">
                                <div className="text-[#A0A0A0] text-sm mb-2">
                                  Summary
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {(() => {
                                    const keys = [
                                      "exchangesTotalUSDT",
                                      "walletUSDT",
                                      "totalUSDT",
                                      "totalPositions",
                                      "totalUnrealizedPnl",
                                    ];
                                    return keys
                                      .map(
                                        (k) =>
                                          [
                                            k,
                                            getKey(
                                              summary as Record<
                                                string,
                                                unknown
                                              >,
                                              k
                                            ),
                                          ] as const
                                      )
                                      .filter(
                                        ([, v]) =>
                                          typeof v === "string" ||
                                          typeof v === "number"
                                      )
                                      .map(([k, v]) => (
                                        <div key={k} className="text-[#E0E0E0]">
                                          <span className="text-[#A0A0A0] capitalize">
                                            {k}:
                                          </span>{" "}
                                          {k.toLowerCase().includes("usdt")
                                            ? `$${Number(v).toLocaleString(
                                                undefined,
                                                { maximumFractionDigits: 2 }
                                              )}`
                                            : String(v)}
                                        </div>
                                      ));
                                  })()}
                                </div>
                              </div>
                            )}

                            {exchangesArr && exchangesArr.length > 0 && (
                              <div className="mb-4">
                                <div className="text-[#A0A0A0] text-sm mb-2">
                                  Exchanges
                                </div>
                                <ul className="space-y-1 text-sm">
                                  {exchangesArr.slice(0, 4).map((exi, i) => {
                                    const name =
                                      pickStr(exi, ["exchange"]) || `#${i + 1}`;
                                    const total =
                                      pickNum(exi, ["totalUSDT"]) || undefined;
                                    return (
                                      <li key={i} className="text-[#E0E0E0]">
                                        <span className="text-white font-medium">
                                          {name}
                                        </span>
                                        {total && (
                                          <span className="text-[#A0A0A0]">
                                            {" "}
                                            • $
                                            {Number(total).toLocaleString(
                                              undefined,
                                              { maximumFractionDigits: 2 }
                                            )}
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {holdings && holdings.length > 0 && (
                              <div className="mb-2">
                                <div className="text-[#A0A0A0] text-sm mb-2">
                                  Top Holdings
                                </div>
                                <ul className="space-y-1">
                                  {holdings.slice(0, 5).map((h, idx) => {
                                    if (!isRecord(h)) return null;
                                    const symbol =
                                      pickStr(h, [
                                        "symbol",
                                        "ticker",
                                        "coin",
                                        "asset",
                                        "name",
                                      ]) || `#${idx + 1}`;
                                    const amount = pickNum(h, [
                                      "amount",
                                      "qty",
                                      "quantity",
                                      "size",
                                    ]);
                                    const value = pickNum(h, [
                                      "value",
                                      "usdValue",
                                      "balanceUsd",
                                      "worth",
                                      "estUSDT",
                                    ]);
                                    return (
                                      <li
                                        key={idx}
                                        className="text-[#E0E0E0] text-sm"
                                      >
                                        <span className="text-white font-medium">
                                          {symbol}
                                        </span>
                                        {amount && (
                                          <span className="text-[#A0A0A0]">
                                            {" "}
                                            • {Number(amount).toLocaleString()}
                                          </span>
                                        )}
                                        {value && (
                                          <span className="text-[#A0A0A0]">
                                            {" "}
                                            • $
                                            {Number(value).toLocaleString(
                                              undefined,
                                              { maximumFractionDigits: 2 }
                                            )}
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {(() => {
                              const totalPositions =
                                summary &&
                                getKey(
                                  summary as Record<string, unknown>,
                                  "totalPositions"
                                );
                              const count =
                                typeof totalPositions === "number"
                                  ? totalPositions
                                  : positions?.length;
                              return typeof count === "number" ? (
                                <div className="text-[#A0A0A0] text-xs">
                                  Positions: {count}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        );
                      })()}
                      {/* Raw JSON for completeness */}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-[#A0A0A0]">
                          View raw JSON
                        </summary>
                        <pre className="mt-2 text-xs text-[#E0E0E0] bg-[#0F0F0F] border border-[#242424] p-3 rounded-lg overflow-auto">
                          {JSON.stringify(parsed.root, null, 2)}
                        </pre>
                      </details>
                    </div>
                  );
                })()}
                <div className="flex justify-center">
                  <button
                    onClick={() => setSelectedEmotion(null)}
                    className="bg-[#D4FF00] text-[#0D0D0D] px-6 py-3 rounded-xl hover:bg-[#BEF264] transition-all duration-200 font-semibold shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hover tooltip */}
        {hoveredEmotion &&
          (() => {
            const parsed = parseEmotionJson(hoveredEmotion.emotion);
            const title =
              parsed?.data?.emotions &&
              typeof parsed.data.emotions === "string" &&
              parsed.data.emotions.trim()
                ? (parsed.data.emotions as string)
                : "Entry";
            return (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#111] border border-[#2A2A2A] text-white px-4 py-2 rounded-lg shadow-xl z-40 pointer-events-none">
                <p className="text-sm">
                  {title} • {formatTimestamp(hoveredEmotion.timestamp)}
                </p>
              </div>
            );
          })()}

        {/* Instructions */}
        {!queryUserId && (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Begin Your Crypto Journey
            </h3>
            <p className="text-gray-400 mb-6">
              Connect your wallet to view your crypto journey timeline.
            </p>
            {!address && (
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                  💡 Connect your wallet to track emotions during your crypto
                  journey
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPage;
