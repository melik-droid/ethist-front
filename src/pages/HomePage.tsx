import React from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

const HomePage: React.FC = () => {
  const { isConnected, address } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            💭 EmotionRecorder
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Record and track emotions on the Rise Testnet blockchain
          </p>

          {isConnected ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg inline-block">
              ✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg inline-block">
              ⚠️ Please connect your wallet to use the app
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Record Emotion Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Record Emotion
              </h2>
              <p className="text-gray-600 mb-6">
                Store your emotions permanently on the blockchain. Each record
                includes a timestamp and is immutable.
              </p>
              <Link
                to="/record"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
              >
                Start Recording
              </Link>
            </div>
          </div>

          {/* Show Records Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                View Records
              </h2>
              <p className="text-gray-600 mb-6">
                Search and view emotion records by User ID. See the complete
                emotion history stored on-chain.
              </p>
              <Link
                to="/show-records"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium inline-block"
              >
                View Records
              </Link>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Contract Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium text-gray-700">Network:</p>
              <p className="text-gray-600">Rise Testnet (Chain ID: 11155931)</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Contract Address:</p>
              <p className="text-gray-600 break-all">
                0x6a024ed7c631796590910D5DAF874D4Dbd2061A4
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Functions:</p>
              <p className="text-gray-600">recordEmotion, getEmotions</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Explorer:</p>
              <a
                href="https://explorer.testnet.riselabs.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View on Blockscout
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with RainbowKit, Wagmi, and Viem on Rise Testnet</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
