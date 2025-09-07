import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useEffect, useState } from "react";

const SiteNavbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [menuAnimateIn, setMenuAnimateIn] = useState(false);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Trigger animation on mount of the mobile menu
  useEffect(() => {
    if (open) {
      setMenuAnimateIn(false);
      const id = requestAnimationFrame(() => setMenuAnimateIn(true));
      return () => cancelAnimationFrame(id);
    } else {
      setMenuAnimateIn(false);
    }
  }, [open]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const WalletButton: React.FC<{ variant?: "desktop" | "mobile" }> = ({
    variant = "desktop",
  }) => (
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
          (!authenticationStatus || authenticationStatus === "authenticated");

        const baseBtn =
          variant === "desktop"
            ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#D4FF00] bg-[#111] hover:bg-[#1A1A1A] text-[#E0E0E0] transition-colors duration-200 shadow-inner focus-visible:outline-none"
            : "w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium border border-[#D4FF00] bg-[#111] hover:bg-[#1A1A1A] text-[#E0E0E0] transition-colors duration-200 shadow-inner focus-visible:outline-none";

        if (!ready)
          return (
            <div
              aria-hidden
              style={{ opacity: 0, pointerEvents: "none", userSelect: "none" }}
            />
          );
        if (!connected)
          return (
            <button
              onClick={openConnectModal}
              className={
                variant === "desktop"
                  ? "bg-[#D4FF00] text-[#0D0D0D] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#BEF264] transition-colors duration-200 shadow-md focus-visible:outline-none"
                  : "w-full bg-[#D4FF00] text-[#0D0D0D] px-4 py-3 rounded-lg text-base font-semibold hover:bg-[#BEF264] transition-colors duration-200 shadow-md focus-visible:outline-none"
              }
            >
              Connect Wallet
            </button>
          );
        if (chain?.unsupported)
          return (
            <button
              onClick={openChainModal}
              className={
                variant === "desktop"
                  ? "bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md focus-visible:outline-none"
                  : "w-full bg-red-600 text-white px-4 py-3 rounded-lg text-base font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md focus-visible:outline-none"
              }
            >
              Wrong network
            </button>
          );

        return (
          <button onClick={openAccountModal} className={baseBtn}>
            {chain?.hasIcon && chain.iconUrl && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full overflow-hidden bg-[#222]">
                <img
                  alt={chain.name ?? "chain icon"}
                  src={chain.iconUrl}
                  className="w-4 h-4"
                />
              </span>
            )}
            <span
              className={
                variant === "desktop"
                  ? "truncate max-w-[120px]"
                  : "truncate max-w-[60%]"
              }
            >
              {account?.displayName}
            </span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );

  return (
    <nav className="sticky top-0 px-6 py-5 z-50 border-b border-[#1A1A1A]/70 bg-[#0D0D0D]/60 backdrop-blur-md supports-[backdrop-filter]:bg-[#0D0D0D]/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        <div className="text-2xl font-bold tracking-tight">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <span className="text-[#D4FF00]">Rac</span>fella
          </Link>
        </div>
        {/* Desktop nav */}
        <div className="hidden sm:flex items-center space-x-6">
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
            <WalletButton variant="desktop" />
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg border border-[#2A2A2A] bg-[#111] text-[#E0E0E0] hover:bg-[#1A1A1A] focus-visible:outline-none"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4 12H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Mobile full-screen overlay menu */}
        {open && (
          <div
            className="sm:hidden fixed inset-0 z-[60]"
            role="dialog"
            aria-modal="true"
          >
            {/* Panel (slides from top, dims page via translucent bg) */}
            <div
              className={`relative z-10 h-[100vh] w-full overflow-y-auto px-6 pt-24 pb-8 flex flex-col gap-4 bg-[#0D0D0D]/80 backdrop-blur-xl transition-all duration-300 ease-out transform ${
                menuAnimateIn ? "translate-y-0" : "-translate-y-full"
              }`}
            >
              {/* Close button (top-right) */}
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-6 inline-flex items-center justify-center p-2 rounded-lg border border-[#2A2A2A] bg-[#111] text-[#E0E0E0] hover:bg-[#1A1A1A] focus-visible:outline-none"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Links */}
              <Link
                to="/record"
                onClick={() => setOpen(false)}
                className="block px-4 py-4 rounded-xl text-lg text-[#E0E0E0] bg-[#101010] hover:bg-[#141414] border border-[#1F1F1F] hover:border-[#242424] transition-colors"
              >
                Record
              </Link>
              <Link
                to="/journal"
                onClick={() => setOpen(false)}
                className="block px-4 py-4 rounded-xl text-lg text-[#E0E0E0] bg-[#101010] hover:bg-[#141414] border border-[#1F1F1F] hover:border-[#242424] transition-colors"
              >
                Journal
              </Link>
              <div className="mt-2">
                <WalletButton variant="mobile" />
              </div>

              {/* Footer / brand */}
              <div className="mt-auto flex items-center justify-between text-[#A0A0A0] text-sm">
                <div>
                  <span className="text-[#D4FF00] font-semibold">Rac</span>fella
                </div>
                <span className="opacity-70">Menu</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SiteNavbar;
