import React from "react";

type Props = {
  show: boolean; // mounted when true
  exiting?: boolean; // animate out when true
  message?: string;
};

const RecordEntryOverlay: React.FC<Props> = ({
  show,
  exiting = false,
  message,
}) => {
  if (!show && !exiting) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center transition-all duration-300 ease-out ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      role="alert"
      aria-live="polite"
      aria-label="Loading record"
    >
      {/* Dim + blur background */}
      <div className="absolute inset-0 bg-[#0D0D0D]/80 backdrop-blur-xl" />

      {/* Content card */}
      <div
        className={`relative mx-6 w-full max-w-md rounded-2xl border border-[#242424] bg-[#121212] p-8 text-center shadow-xl transition-transform duration-300 ease-out ${
          exiting ? "-translate-y-2" : "translate-y-0"
        }`}
      >
        {/* Spinner */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F0F0F] border border-[#1F1F1F] shadow-inner">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-[#D4FF00]" />
        </div>
        <div className="text-lg font-semibold tracking-tight">
          Preparing your record…
        </div>
        <div className="mt-1 text-sm text-[#A0A0A0]">
          {message ?? "Fetching details and pre-filling your form."}
        </div>

        {/* Progress bar shimmer */}
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1A] relative">
          {/* Primary moving bar */}
          <div
            className="absolute inset-y-0 rounded-full bg-[#D4FF00]"
            style={{
              animation:
                "indeterminatePrimary 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              willChange: "left, right",
            }}
          />
          {/* Secondary trailing bar */}
          <div
            className="absolute inset-y-0 rounded-full bg-[#BEF264] opacity-90"
            style={{
              animation:
                "indeterminateSecondary 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              willChange: "left, right",
            }}
          />
        </div>
      </div>

      {/* Keyframes for progress */}
      <style>{`
        /* Material-like indeterminate progress animation */
        @keyframes indeterminatePrimary {
          0% {
            left: -35%;
            right: 100%;
          }
          60% {
            left: 100%;
            right: -90%;
          }
          100% {
            left: 100%;
            right: -90%;
          }
        }

        @keyframes indeterminateSecondary {
          0% {
            left: -200%;
            right: 100%;
          }
          60% {
            left: 107%;
            right: -8%;
          }
          100% {
            left: 107%;
            right: -8%;
          }
        }
      `}</style>
    </div>
  );
};

export default RecordEntryOverlay;
