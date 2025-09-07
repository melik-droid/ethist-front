import type { AvatarComponent } from "@rainbow-me/rainbowkit";

const MoneyAvatar: AvatarComponent = ({ size }) => {
  const s = typeof size === "number" ? size : 24;
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(212,255,0,0.9) 0%, rgba(190,242,100,0.9) 100%)",
        color: "#0D0D0D",
        border: "1px solid #2A2A2A",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        lineHeight: 1,
        fontSize: Math.max(10, Math.floor(s * 0.58)),
      }}
      aria-hidden
    >
      💸
    </div>
  );
};

export default MoneyAvatar;
