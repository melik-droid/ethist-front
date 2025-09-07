import React from "react";

type Point = { t: number; v: number };

interface Props {
  data: Point[]; // expects ascending by t
  height?: number; // pixel height
  stroke?: string;
  fill?: string;
}

const PortfolioSparkline: React.FC<Props> = ({
  data,
  height = 140,
  stroke = "#D4FF00",
  fill = "rgba(212,255,0,0.08)",
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-[#A0A0A0]">No portfolio data to display</div>
    );
  }

  // Use a responsive SVG via viewBox; width scales to container (100%)
  const padX = 20;
  const padY = 12;
  const w = 1000; // logical width units for viewBox
  const h = Math.max(height, 60);

  const vals = data.map((p) => p.v).filter((v) => Number.isFinite(v));
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const spanV = maxV - minV || 1; // avoid div by zero

  const n = data.length;
  const stepX = n > 1 ? (w - padX * 2) / (n - 1) : 0;

  const toX = (i: number) => padX + i * stepX;
  const toY = (v: number) => padY + (1 - (v - minV) / spanV) * (h - padY * 2);

  const path = data
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.v)}`)
    .join(" ");

  // Area under curve
  const area = `${path} L${toX(n - 1)},${h - padY} L${toX(0)},${h - padY} Z`;

  const last = data[data.length - 1];
  const first = data[0];
  const delta = last.v - first.v;
  const deltaColor = delta >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm text-[#A0A0A0]">Portfolio Value (USDT)</div>
        <div className="text-sm">
          <span className="text-[#E0E0E0] font-semibold">
            {last.v.toFixed(2)}
          </span>
          <span className={`ml-2 ${deltaColor}`}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(2)}
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        className="block"
        aria-label="Portfolio sparkline"
        role="img"
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* No inner background; use container background */}
        <path d={area} fill="url(#sparkFill)" />
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
      </svg>
    </div>
  );
};

export default PortfolioSparkline;
