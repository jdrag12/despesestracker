import React from "react";
import { formatEuro } from "../utils/storage.js";

// Simple responsive SVG Pie chart
export function PieChart({
  data,
  boxSize = 220,
  strokeWidth = 24,
  colors = [],
}) {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);

  // Responsive SVG: width 100%, height auto, with static viewBox
  const size = boxSize;
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const point = svgRef.current.createSVGPoint();
    point.x = e.clientX - svgRect.left;
    point.y = e.clientY - svgRect.top;
    setTooltipPos({ x: point.x, y: point.y });
  };

  const circles = data.map((d, i) => {
    const val = d.value;
    const dash = (val / total) * (2 * Math.PI * radius);
    const gap = 2 * Math.PI * radius - dash;
    const rot = (acc / total) * 360;
    const percentage = ((val / total) * 100).toFixed(1);
    acc += val;
    const color = colors[i % colors.length] || `hsl(${(i * 47) % 360} 70% 50%)`;
    return (
      <circle
        key={i}
        r={radius}
        cx={cx}
        cy={cy}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        transform={`rotate(${rot} ${cx} ${cy})`}
        strokeLinecap="butt"
        style={{
          cursor: "pointer",
          opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1,
        }}
        onMouseEnter={() => setHoveredIndex(i)}
        onMouseLeave={() => setHoveredIndex(null)}
        onMouseMove={handleMouseMove}
      >
        <title>
          {d.label}: {percentage}%
        </title>
      </circle>
    );
  });

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const percentage = hoveredData
    ? ((hoveredData.value / total) * 100).toFixed(1)
    : 0;

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {circles}
        {hoveredIndex !== null && hoveredData && (
          <g>
            <rect
              x={tooltipPos.x - 55}
              y={tooltipPos.y - 35}
              width={110}
              height={28}
              fill="rgba(0, 0, 0, 0.9)"
              rx={4}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
            />
            <text
              x={tooltipPos.x}
              y={tooltipPos.y - 20}
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {hoveredData.label}
            </text>
            <text
              x={tooltipPos.x}
              y={tooltipPos.y - 7}
              textAnchor="middle"
              fontSize="9"
              fill="#e5e7eb"
            >
              {formatEuro(hoveredData.value)} ({percentage}%)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// Simple SVG Bar chart
export function BarChart({
  items,
  boxWidth = 640,
  boxHeight = 240,
  colors = { fixed: "#2563eb", variable: "#16a34a" },
}) {
  // Responsive SVG via viewBox and width:100%
  const width = boxWidth;
  const height = boxHeight;
  const padding = 28;
  const innerWidth = width - padding * 2;
  const groupWidth = items.length > 0 ? innerWidth / items.length : innerWidth;
  const barWidth = Math.max(8, (groupWidth - 8) / 2);
  const maxVal = Math.max(
    1,
    ...items.map((i) => Math.max(i.fixed, i.variable))
  );
  const scaleY = (v) => (v / maxVal) * (height - padding * 2);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {items.map((i, idx) => {
        const gx = padding + idx * groupWidth;
        const hFixed = scaleY(i.fixed);
        const hVar = scaleY(i.variable);
        return (
          <g key={i.monthKey}>
            <rect
              x={gx}
              y={height - padding - hFixed}
              width={barWidth}
              height={hFixed}
              fill={colors.fixed}
              rx={4}
            />
            <rect
              x={gx + barWidth + 6}
              y={height - padding - hVar}
              width={barWidth}
              height={hVar}
              fill={colors.variable}
              rx={4}
            />
            <text
              x={gx + barWidth}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {i.monthKey.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
