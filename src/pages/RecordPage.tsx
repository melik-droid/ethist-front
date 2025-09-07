import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRecordEmotion } from "../hooks/useContract";
import SiteNavbar from "../components/SiteNavbar";

// Define the expected API response type
interface JournalData {
  createdAt: string;
  date: string;
  emotions?: string;
  emotion?: string;
  id: string;
  lessons: string | null;
  market: string | null;
  mistakes: string;
  tags: string[] | string;
  trades: unknown[];
  updatedAt: string;
  userId: string;
  // New optional fields from API v2
  assets?: unknown[];
  exchangeData?: unknown;
  positions?: unknown[];
  summary?: unknown;
}

// (API responses can vary; we parse dynamically without a strict interface)

// Type guards to safely parse API responses
const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object";

const isJournalData = (v: unknown): v is JournalData => {
  if (!isObject(v)) return false;
  // Heuristic: presence of at least one expected key
  return (
    "emotions" in v ||
    "emotion" in v ||
    "mistakes" in v ||
    "tags" in v ||
    "date" in v
  );
};

const hasData = (v: unknown): v is { data: unknown } =>
  isObject(v) && "data" in v;

const RecordPage: React.FC = () => {
  const { address } = useAccount();
  const [emotion, setEmotion] = useState<string>("");
  const [lessons, setLessons] = useState<string>("");
  const [market, setMarket] = useState<string>("");
  const [mistakes, setMistakes] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [apiData, setApiData] = useState<unknown | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [urlVariable, setUrlVariable] = useState<string | null>(null);
  const {
    recordEmotion,
    data: txData,
    isPending,
    isSuccess,
    error,
  } = useRecordEmotion();

  // Fetch data from API when component loads
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setApiLoading(true);
        setApiError(null);

        // Parse URL parameter: expect /record?id=<value>
        const urlParams = new URLSearchParams(window.location.search);
        const variable = urlParams.get("id");

        // Console log the parsed variable
        console.log("Parsed URL variable:", variable);
        setUrlVariable(variable);

        // Only make API call if variable is present
        if (!variable) {
          console.log("No URL variable found, skipping API call");
          setApiLoading(false);
          return;
        }

        // Ortama göre API base URL seçimi: production => tam domain, development => relative proxy
        const apiBaseUrl = import.meta.env.PROD
          ? "https://pc.tuguberk.dev/api/journal"
          : "/api/journal";

        // Build API URL with the variable
        const finalApiUrl = `${apiBaseUrl}/${encodeURIComponent(variable)}`;

        console.log("Making API request to:", finalApiUrl);

        const response = await fetch(finalApiUrl);
        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Console log the API return value
        console.log("API Response Data:", data);
        setApiData(data);

        // Immediate populate for reliability (in addition to apiData effect)
        const jdNow = parseJournalFromResponse(data);
        console.log("jdnow: " + JSON.stringify(jdNow));
        if (jdNow) {
          const emoNow = jdNow.emotions ?? jdNow.emotion ?? "";
          const tagNow = Array.isArray(jdNow.tags)
            ? jdNow.tags.join(", ")
            : typeof jdNow.tags === "string"
            ? jdNow.tags
            : "";
          console.log("Setting form (immediate) from journalData:", {
            emotion: emoNow,
            lessons: jdNow.lessons ?? "",
            market: jdNow.market ?? "",
            mistakes: jdNow.mistakes ?? "",
            tags: tagNow,
          });
          setEmotion(emoNow);
          setLessons(jdNow.lessons ?? "");
          setMarket(jdNow.market ?? "");
          setMistakes(jdNow.mistakes ?? "");
          setTags(tagNow);
        }
      } catch (err) {
        console.error("Error fetching API data:", err);
        setApiError(
          err instanceof Error ? err.message : "Failed to fetch API data"
        );
      } finally {
        setApiLoading(false);
      }
    };

    fetchApiData();
  }, []);

  // Parse helper to extract JournalData from various shapes
  const parseJournalFromResponse = (
    payload: unknown
  ): JournalData | undefined => {
    const respUnknown = payload as unknown;
    if (isJournalData(respUnknown)) {
      console.log("API parse: using root path");
      return respUnknown;
    }
    if (hasData(respUnknown)) {
      const inner1 = respUnknown.data;
      if (isJournalData(inner1)) {
        console.log("API parse: using data path");
        return inner1;
      }
      if (hasData(inner1) && isJournalData(inner1.data)) {
        console.log("API parse: using data.data path");
        return inner1.data;
      }
    }
    return undefined;
  };

  // Populate inputs whenever apiData arrives/changes
  useEffect(() => {
    if (!apiData) return;
    const journalData = parseJournalFromResponse(apiData);
    if (!journalData) {
      console.warn("API response did not contain expected journal data");
      return;
    }
    console.log("API parsed journalData:", journalData);
    const emo = journalData.emotions ?? journalData.emotion ?? "";
    const tagVal = Array.isArray(journalData.tags)
      ? journalData.tags.join(", ")
      : typeof journalData.tags === "string"
      ? journalData.tags
      : "";

    setEmotion(emo);
    setLessons(journalData.lessons ?? "");
    setMarket(journalData.market ?? "");
    setMistakes(journalData.mistakes ?? "");
    setTags(tagVal);
  }, [apiData, setEmotion, setLessons, setMarket, setMistakes, setTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!emotion) {
      alert("Please fill in the Emotion field");
      return;
    }

    try {
      // Pull exchangeData from the latest fetched API (if any)
      const parsedFromApi = apiData
        ? parseJournalFromResponse(apiData)
        : undefined;
      const exchangeData =
        parsedFromApi && parsedFromApi.exchangeData
          ? parsedFromApi.exchangeData
          : undefined;
      // Build full JSON payload strictly from the latest form state (do not use initial API object)
      const payloadData = {
        id: urlVariable || "",
        userId: "", // informational only; on-chain identity is wallet address
        date: new Date().toISOString(),
        market: market || null,
        emotions: emotion,
        mistakes: mistakes || "",
        lessons: lessons || null,
        tags: tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        trades: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Include exchange data snapshot if available
        ...(exchangeData ? { exchangeData } : {}),
      };

      const payloadRoot = { success: true, data: payloadData };
      const plaintextJson = JSON.stringify(payloadRoot);
      console.log("[Record] Payload (plaintext JSON):", payloadRoot);

      await recordEmotion(address, plaintextJson);
      // Log hash if available on hook's data
      if (txData && typeof txData === "object" && "hash" in txData) {
        // @ts-expect-error runtime dynamic
        console.log("[Record] Transaction hash:", txData.hash);
      }
    } catch (error) {
      console.error("Error recording emotion:", error);
    }
  };

  const handleReset = () => {
    setEmotion("");
    setLessons("");
    setMarket("");
    setMistakes("");
    setTags("");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <SiteNavbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-[#151515] border border-[#242424] rounded-2xl p-6 md:p-8 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Record Emotion <span className="text-[#D4FF00]">& Journal</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="emotion"
                className="block text-sm font-medium text-[#C7C7C7] mb-2"
              >
                Emotion
              </label>
              <input
                type="text"
                id="emotion"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                placeholder="Enter your emotion (e.g., happy, sad, excited, grateful...)"
                className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#2A2A2A] text-[#E0E0E0] placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-[#D4FF00] focus:border-[#D4FF00]"
                required
              />
              <p className="text-xs text-[#A0A0A0] mt-1">
                You can enter any emotion you feel - be creative and
                descriptive!
              </p>
            </div>

            <div>
              <label
                htmlFor="lessons"
                className="block text-sm font-medium text-[#C7C7C7] mb-2"
              >
                Lessons
              </label>
              <textarea
                id="lessons"
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
                placeholder="What lessons did you learn?"
                className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#2A2A2A] text-[#E0E0E0] placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-[#D4FF00] focus:border-[#D4FF00]"
                rows={3}
              />
            </div>

            <div>
              <label
                htmlFor="market"
                className="block text-sm font-medium text-[#C7C7C7] mb-2"
              >
                Market
              </label>
              <input
                type="text"
                id="market"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="Market conditions or context"
                className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#2A2A2A] text-[#E0E0E0] placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-[#D4FF00] focus:border-[#D4FF00]"
              />
            </div>

            <div>
              <label
                htmlFor="mistakes"
                className="block text-sm font-medium text-[#C7C7C7] mb-2"
              >
                Mistakes
              </label>
              <textarea
                id="mistakes"
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                placeholder="What mistakes were made?"
                className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#2A2A2A] text-[#E0E0E0] placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-[#D4FF00] focus:border-[#D4FF00]"
                rows={3}
              />
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-[#C7C7C7] mb-2"
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas (e.g., panic, mistake, learning)"
                className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#2A2A2A] text-[#E0E0E0] placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-[#D4FF00] focus:border-[#D4FF00]"
              />
              <p className="text-xs text-[#A0A0A0] mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isPending || !address || !emotion}
                className="flex-1 bg-[#D4FF00] text-[#0D0D0D] py-2 px-4 rounded-lg hover:bg-[#BEF264] focus:outline-none focus:ring-2 focus:ring-[#D4FF00]/60 focus:ring-offset-2 focus:ring-offset-[#0D0D0D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isPending ? "Recording..." : "Record Emotion"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-[#2A2A2A] bg-[#111] text-[#E0E0E0] hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2A2A2A] focus:ring-offset-2 focus:ring-offset-[#0D0D0D] transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
          {/* Status Messages */}
          {isPending && (
            <div className="mt-4 p-3 bg-[#0F172A] border border-blue-500/40 text-blue-300 rounded-lg">
              Transaction pending... Please confirm in your wallet.
            </div>
          )}

          {isSuccess && (
            <div className="mt-4 p-3 bg-[#052E16] border border-green-500/40 text-green-300 rounded-lg">
              ✅ Emotion recorded successfully!
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-[#2A0F12] border border-red-500/40 text-red-300 rounded-lg">
              ❌ Error: {error.message}
            </div>
          )}

          {/* API Data Section */}
          <div className="mt-6 p-4 bg-[#111] border border-[#2A2A2A] rounded-xl">
            <h3 className="text-sm font-medium text-[#C7C7C7] mb-2">
              API Status
            </h3>

            {/* URL Variable Info */}
            <div className="mb-3 p-2 bg-[#0F0F0F] rounded border border-[#2A2A2A]">
              <div className="text-xs font-medium text-[#A0A0A0]">
                URL Parameter:
              </div>
              {urlVariable ? (
                <div className="text-sm text-[#D4FF00]">
                  📎 Variable:{" "}
                  <code className="text-[#D4FF00]">{urlVariable}</code>
                </div>
              ) : (
                <div className="text-sm text-[#A0A0A0]">
                  No variable parameter found
                </div>
              )}
              <div className="text-xs text-[#777] mt-1">
                Use: <code>/record?id=yourvalue</code>
              </div>
            </div>

            {apiLoading && (
              <div className="text-[#BEF264]">Loading API data...</div>
            )}
            {apiError ? (
              <div className="text-red-400">API Error: {String(apiError)}</div>
            ) : null}
            {!!apiData && !apiLoading && !apiError && (
              <div className="text-green-400">
                ✅ API connected successfully
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-[#A0A0A0]">
                    View API Response
                  </summary>
                  <pre className="mt-2 text-xs text-[#E0E0E0] bg-[#0D0D0D] p-2 rounded border border-[#2A2A2A] overflow-auto max-h-40">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecordPage;
