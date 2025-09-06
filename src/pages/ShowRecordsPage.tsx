import React, { useState } from "react";
import { useGetEmotions } from "../hooks/useContract";

interface EmotionRecord {
  emotion: string;
  timestamp: bigint;
}

const ShowRecordsPage: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [queryUserId, setQueryUserId] = useState<number | undefined>(undefined);

  const {
    data: emotions,
    isLoading,
    error,
    refetch,
  } = useGetEmotions(queryUserId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      setQueryUserId(parseInt(userId));
    }
  };

  const handleReset = () => {
    setUserId("");
    setQueryUserId(undefined);
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
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
    };
    return emojiMap[emotion.toLowerCase()] || "😐";
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Show Emotion Records
      </h1>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Search User Emotions
        </h2>

        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label
              htmlFor="searchUserId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              User ID
            </label>
            <input
              type="number"
              id="searchUserId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID to search emotions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>

          <button
            type="submit"
            disabled={!userId || isLoading}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Results Section */}
      {queryUserId !== undefined && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              Emotions for User ID: {queryUserId}
            </h3>
            <button
              onClick={() => refetch()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              🔄 Refresh
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading emotions...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ❌ Error loading emotions: {error.message}
            </div>
          )}

          {emotions && !isLoading && (
            <>
              {emotions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">
                    No emotions recorded for this user yet.
                  </p>
                  <p className="text-sm mt-2">
                    Be the first to record an emotion!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Found {emotions.length} emotion record
                    {emotions.length !== 1 ? "s" : ""}
                  </p>

                  {emotions.map((record: EmotionRecord, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getEmotionEmoji(record.emotion)}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800 capitalize">
                              {record.emotion}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTimestamp(record.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            Record #{index + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {queryUserId === undefined && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Enter a User ID above to view their emotion records from the
            blockchain.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShowRecordsPage;
