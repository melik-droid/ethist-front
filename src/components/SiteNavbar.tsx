import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

const SiteNavbar: React.FC = () => {
  return (
    <nav className="bg-[#0D0D0D] px-6 py-5 relative z-10 border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tight">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <span className="text-[#D4FF00]">Rac</span>fella
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link
            to="/record"
            className="text-[#A0A0A0] hover:text-white transition-colors duration-200 text-base"
          >
            Record
          </Link>
          <Link
            to="/journal"
            className="text-[#A0A0A0] hover:text-white transition-colors duration-200 text-base"
          >
            Journal
          </Link>
          <div className="ml-2">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === "authenticated");

                if (!ready) {
                  return (
                    <div
                      aria-hidden
                      style={{
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    />
                  );
                }

                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      className="bg-[#D4FF00] text-[#0D0D0D] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#BEF264] transition-colors duration-200 shadow-md focus-visible:outline-none"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain?.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md focus-visible:outline-none"
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#2A2A2A] bg-[#111] hover:bg-[#1A1A1A] text-[#E0E0E0] transition-colors duration-200 shadow-inner focus-visible:outline-none"
                  >
                    {chain?.hasIcon && chain.iconUrl && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full overflow-hidden bg-[#222]">
                        <img
                          alt={chain.name ?? "chain icon"}
                          src={chain.iconUrl}
                          className="w-4 h-4"
                        />
                      </span>
                    )}
                    <span className="truncate max-w-[120px]">
                      {account?.displayName}
                    </span>
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SiteNavbar;
