import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              💭 EmotionRecorder
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/record"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/record")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              📝 Record Emotion
            </Link>

            <Link
              to="/show-records"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/show-records")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              📊 Show Records
            </Link>

            {/* Wallet Connect Button */}
            <div className="ml-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
