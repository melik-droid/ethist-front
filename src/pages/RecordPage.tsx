import React, { useState } from "react";
import { useRecordEmotion } from "../hooks/useContract";

const RecordPage: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [emotion, setEmotion] = useState<string>("");
  const { recordEmotion, isPending, isSuccess, error } = useRecordEmotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !emotion) {
      alert("Please fill in both User ID and Emotion fields");
      return;
    }

    try {
      await recordEmotion(userId, emotion);
    } catch (error) {
      console.error("Error recording emotion:", error);
    }
  };

  const handleReset = () => {
    setUserId("");
    setEmotion("");
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Record Emotion
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID (e.g., user1, alice, bob...)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can enter any emotion you feel - be creative and descriptive!
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isPending || !userId || !emotion}
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
    </div>
  );
};

export default RecordPage;
