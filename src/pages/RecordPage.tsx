import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRecordEmotion } from "../hooks/useContract";

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

        // Hardcoded API URL - no need for environment variable
        const apiBaseUrl = "/api/journal";

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
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Record Emotion & Journal Entry
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="emotion"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Emotion
          </label>
          <input
            type="text"
            id="emotion"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="Enter your emotion (e.g., happy, sad, excited, grateful...)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can enter any emotion you feel - be creative and descriptive!
          </p>
        </div>

        <div>
          <label
            htmlFor="lessons"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Lessons
          </label>
          <textarea
            id="lessons"
            value={lessons}
            onChange={(e) => setLessons(e.target.value)}
            placeholder="What lessons did you learn?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="market"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Market
          </label>
          <input
            type="text"
            id="market"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="Market conditions or context"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="mistakes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mistakes
          </label>
          <textarea
            id="mistakes"
            value={mistakes}
            onChange={(e) => setMistakes(e.target.value)}
            placeholder="What mistakes were made?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas (e.g., panic, mistake, learning)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isPending || !address || !emotion}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Recording..." : "Record Emotion"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Status Messages */}
      {isPending && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Transaction pending... Please confirm in your wallet.
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ Emotion recorded successfully!
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ Error: {error.message}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-center">
        <p>Record your emotions on the Rise Testnet blockchain</p>
      </div>

      {/* API Data Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">API Status</h3>

        {/* URL Variable Info */}
        <div className="mb-3 p-2 bg-white rounded border">
          <div className="text-xs font-medium text-gray-600">
            URL Parameter:
          </div>
          {urlVariable ? (
            <div className="text-sm text-blue-600">
              📎 Variable: <code>{urlVariable}</code>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No variable parameter found
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Use: <code>/record?id=yourvalue</code>
          </div>
        </div>

        {apiLoading && <div className="text-blue-600">Loading API data...</div>}
        {apiError ? (
          <div className="text-red-600">API Error: {String(apiError)}</div>
        ) : null}
        {!!apiData && !apiLoading && !apiError && (
          <div className="text-green-600">
            ✅ API connected successfully
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-gray-500">
                View API Response
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordPage;
