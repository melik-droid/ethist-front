import React, { useEffect, useState } from "react";
import { useGetEmotions } from "../hooks/useContract";
import { useAccount } from "wagmi";

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

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      excited: "🤩",
      nervous: "😰",
      calm: "😌",
      confused: "😕",
      grateful: "🙏",
      tired: "😴",
      energetic: "⚡",
      love: "❤️",
      joy: "😄",
      fear: "😨",
      surprised: "😲",
      disgusted: "🤢",
      anxious: "😟",
      bored: "😴",
      curious: "🤔",
      hopeful: "🤞",
      proud: "😤",
      embarrassed: "😳",
      frustrated: "😤",
      relaxed: "😎",
      amazed: "🤯",
      content: "😌",
      overwhelmed: "😵",
      peaceful: "☮️",
      motivated: "💪",
      inspired: "✨",
      thoughtful: "🤔",
    };

    const lowerEmotion = emotion.toLowerCase();
    if (emojiMap[lowerEmotion]) {
      return emojiMap[lowerEmotion];
    }

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerEmotion.includes(key) || key.includes(lowerEmotion)) {
        return emoji;
      }
    }

    return "🤔";
  };

  const getEmotionColor = (emotion: string) => {
    const colorMap: Record<string, string> = {
      happy: "from-yellow-400 to-orange-400",
      sad: "from-blue-400 to-blue-600",
      angry: "from-red-400 to-red-600",
      excited: "from-purple-400 to-pink-400",
      nervous: "from-gray-400 to-gray-600",
      calm: "from-green-400 to-blue-400",
      confused: "from-yellow-300 to-yellow-500",
      grateful: "from-pink-400 to-purple-400",
      tired: "from-indigo-400 to-purple-600",
      energetic: "from-yellow-400 to-red-400",
      love: "from-red-400 to-pink-400",
      joy: "from-yellow-300 to-yellow-500",
      fear: "from-gray-500 to-black",
      surprised: "from-cyan-400 to-blue-400",
      anxious: "from-orange-400 to-red-400",
      peaceful: "from-green-300 to-blue-300",
      motivated: "from-orange-400 to-yellow-400",
      inspired: "from-purple-400 to-pink-400",
    };

    const lowerEmotion = emotion.toLowerCase();
    return colorMap[lowerEmotion] || "from-indigo-400 to-purple-600";
  };

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

  const hasData = (obj: unknown): obj is { data: JournalJsonData } => {
    return !!obj && typeof obj === "object" && "data" in (obj as object);
  };

  const parseEmotionJson = (
    value: string
  ): { root: unknown; data: JournalJsonData } | null => {
    try {
      const root = JSON.parse(value);
      const data = hasData(root)
        ? (root.data as JournalJsonData)
        : (root as JournalJsonData);
      return { root, data };
    } catch {
      return null;
    }
  };

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

  // Sort emotions chronologically (oldest first for roadmap)
  const sortedEmotions = emotions
    ? [...emotions].sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
    : [];

  const RoadmapItem: React.FC<RoadmapItemProps> = ({
    record,
    onHover,
    onClick,
  }) => {
    const gradientClass = getEmotionColor(record.emotion);

    return (
      <div
        className="relative bg-gray-800 backdrop-blur-sm rounded-xl p-4 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-gray-700 border border-gray-700/60 hover:border-gray-500 shadow-xl hover:shadow-2xl z-20"
        onMouseEnter={() => onHover(record)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(record)}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center text-white text-xl shadow-xl ring-2 ring-white/20`}
          >
            <span className="drop-shadow-lg">
              {getEmotionEmoji(record.emotion)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold capitalize mb-1 text-lg">
              {record.emotion}
            </h4>
            <p className="text-gray-300 text-sm">
              {formatTimestamp(record.timestamp)}
            </p>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              � Crypto Journey
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Your path to financial freedom mapped with emotions
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8">
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
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                My Journey
              </h2>
              {emotions && (
                <p className="text-gray-400">
                  {emotions.length} emotional milestone
                  {emotions.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {isLoading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-cyan-500"></div>
                <p className="mt-4 text-gray-400">
                  Loading your crypto journey...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-6 py-4 rounded-xl mb-6">
                ❌ Error loading emotions: {error.message}
              </div>
            )}

            {sortedEmotions.length > 0 && !isLoading && (
              <div className="relative">
                {/* Shining roadmap line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2">
                  <div className="w-full h-full bg-gradient-to-b from-white via-gray-300 to-white rounded-full shadow-lg">
                    <div className="w-full h-full bg-gradient-to-b from-white to-gray-200 rounded-full animate-pulse opacity-70"></div>
                  </div>
                </div>

                {/* Emotions displayed chronologically */}
                <div className="space-y-8 sm:space-y-12">
                  {sortedEmotions.map((emotion, index) => {
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
                              ? "left-1/2 w-16 sm:w-20 from-white to-gray-600"
                              : "right-1/2 w-16 sm:w-20 from-gray-600 to-white"
                          }`}
                        ></div>

                        {/* Emotion node on the main line */}
                        <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-gradient-to-r from-white to-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 ring-2 ring-gray-900/30 shadow-lg"></div>

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
            {sortedEmotions.length === 0 && !isLoading && !error && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Journey Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  This crypto journey hasn't begun. Start recording emotions to
                  see them mapped here!
                </p>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-gray-300 text-sm">
                    � Connect your wallet and record emotions as you learn about
                    crypto and DeFi
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emotion Detail Modal */}
        {selectedEmotion && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${getEmotionColor(
                    selectedEmotion.emotion
                  )} flex items-center justify-center text-3xl text-white mx-auto mb-4 shadow-lg`}
                >
                  {getEmotionEmoji(selectedEmotion.emotion)}
                </div>
                {(() => {
                  const parsed = parseEmotionJson(selectedEmotion.emotion);
                  const displayTitle =
                    parsed?.data?.emotions || selectedEmotion.emotion;
                  return (
                    <h3 className="text-2xl font-bold text-white capitalize mb-2">
                      {displayTitle}
                    </h3>
                  );
                })()}
                <p className="text-gray-400 mb-6">
                  {formatTimestamp(selectedEmotion.timestamp)}
                </p>
                {/* JSON details if present */}
                {(() => {
                  const parsed = parseEmotionJson(selectedEmotion.emotion);
                  if (!parsed) return null;
                  const d = parsed.data || {};
                  return (
                    <div className="text-left bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
                      <h4 className="text-white font-semibold mb-3">Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {d.id && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">ID:</span> {d.id}
                          </div>
                        )}
                        {d.userId && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">User ID:</span>{" "}
                            {d.userId}
                          </div>
                        )}
                        {d.date && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Date:</span>{" "}
                            {new Date(d.date).toLocaleString()}
                          </div>
                        )}
                        {d.market && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Market:</span>{" "}
                            {d.market}
                          </div>
                        )}
                        {d.mistakes && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Mistakes:</span>{" "}
                            {d.mistakes}
                          </div>
                        )}
                        {d.lessons && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Lessons:</span>{" "}
                            {d.lessons}
                          </div>
                        )}
                        {Array.isArray(d.tags) && d.tags.length > 0 && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Tags:</span>{" "}
                            {d.tags.join(", ")}
                          </div>
                        )}
                        {d.createdAt && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Created:</span>{" "}
                            {new Date(d.createdAt).toLocaleString()}
                          </div>
                        )}
                        {d.updatedAt && (
                          <div className="text-gray-300">
                            <span className="text-gray-400">Updated:</span>{" "}
                            {new Date(d.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {(() => {
                        // Exchange snapshot (flexible parsing)
                        const ex = isRecord(d.exchangeData)
                          ? d.exchangeData
                          : undefined;
                        const exSummaryUnknown = getKey(ex, "summary");
                        const summary = isRecord(exSummaryUnknown)
                          ? exSummaryUnknown
                          : isRecord(d.summary)
                          ? d.summary
                          : undefined;
                        const exTopHoldings = getKey(ex, "topHoldings");
                        const exHoldings = getKey(ex, "holdings");
                        const holdings: unknown[] | undefined = Array.isArray(
                          exTopHoldings
                        )
                          ? (exTopHoldings as unknown[])
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

                        if (!ex && !summary && !holdings && !positions)
                          return null;
                        return (
                          <div className="mt-4 border-t border-gray-700 pt-4">
                            <h5 className="text-white font-semibold mb-3">
                              Exchange Snapshot
                            </h5>

                            {summary && (
                              <div className="mb-4">
                                <div className="text-gray-400 text-sm mb-2">
                                  Summary
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {Object.entries(summary)
                                    .filter(
                                      ([, v]) =>
                                        typeof v === "string" ||
                                        typeof v === "number"
                                    )
                                    .slice(0, 8)
                                    .map(([k, v]) => (
                                      <div key={k} className="text-gray-300">
                                        <span className="text-gray-400 capitalize">
                                          {k}:
                                        </span>{" "}
                                        {String(v)}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {holdings && holdings.length > 0 && (
                              <div className="mb-2">
                                <div className="text-gray-400 text-sm mb-2">
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
                                    ]);
                                    return (
                                      <li
                                        key={idx}
                                        className="text-gray-300 text-sm"
                                      >
                                        <span className="text-white font-medium">
                                          {symbol}
                                        </span>
                                        {amount && (
                                          <span className="text-gray-400">
                                            {" "}
                                            • {amount}
                                          </span>
                                        )}
                                        {value && (
                                          <span className="text-gray-400">
                                            {" "}
                                            • ${value}
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {positions && (
                              <div className="text-gray-400 text-xs">
                                Positions: {positions.length}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {/* Raw JSON for completeness */}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-gray-400">
                          View raw JSON
                        </summary>
                        <pre className="mt-2 text-xs text-gray-300 bg-gray-900 p-3 rounded-lg overflow-auto">
                          {JSON.stringify(parsed.root, null, 2)}
                        </pre>
                      </details>
                    </div>
                  );
                })()}
                <button
                  onClick={() => setSelectedEmotion(null)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hover tooltip */}
        {hoveredEmotion && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg shadow-xl z-40 pointer-events-none">
            <p className="text-sm">
              {hoveredEmotion.emotion} •{" "}
              {formatTimestamp(hoveredEmotion.timestamp)}
            </p>
          </div>
        )}

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
