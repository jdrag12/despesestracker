import React from "react";
import { formatEuro } from "../utils/storage.js";

// Arc path for a pie slice (angle in radians, 0 = top, clockwise)
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = {
    x: cx + r * Math.sin(startAngle),
    y: cy - r * Math.cos(startAngle),
  };
  const end = {
    x: cx + r * Math.sin(endAngle),
    y: cy - r * Math.cos(endAngle),
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", r, r, 0, largeArc, 1, end.x, end.y,
    "Z",
  ].join(" ");
}

// Pie chart with real slices (hover works per segment)
export function PieChart({
  data,
  boxSize = 220,
  colors = [],
}) {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const leaveTimeoutRef = React.useRef(null);
  const svgRef = React.useRef(null);

  const size = boxSize;
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = Math.min(cx, cy) - 8;

  const clearLeaveTimeout = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = (i) => {
    clearLeaveTimeout();
    setHoveredIndex(i);
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => setHoveredIndex(null), 150);
  };

  const handleMouseLeaveSvg = () => {
    clearLeaveTimeout();
    setHoveredIndex(null);
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const point = svgRef.current.createSVGPoint();
    point.x = e.clientX - svgRect.left;
    point.y = e.clientY - svgRect.top;
    setTooltipPos({ x: point.x, y: point.y });
  };

  React.useEffect(() => () => clearLeaveTimeout(), []);

  let acc = 0;
  const sliceData = data.map((d, i) => {
    const startAngle = (acc / total) * 2 * Math.PI - Math.PI / 2;
    acc += d.value;
    const endAngle = (acc / total) * 2 * Math.PI - Math.PI / 2;
    const color = colors[i % colors.length] || `hsl(${(i * 47) % 360}, 65%, 52%)`;
    const pathD = describeArc(cx, cy, outerR, startAngle, endAngle);
    return { pathD, color, i, d };
  });

  // Draw smallest slices first so largest are on top and easier to hover
  const slices = [...sliceData].reverse().map(({ pathD, color, i, d }) => {
    const isHovered = hoveredIndex === i;
    return (
      <path
        key={i}
        d={pathD}
        fill={color}
        stroke="#fff"
        strokeWidth={1.5}
        style={{
          cursor: "pointer",
          opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <title>{d.label}: {((d.value / total) * 100).toFixed(1)}%</title>
      </path>
    );
  });

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const percentage = hoveredData
    ? ((hoveredData.value / total) * 100).toFixed(1)
    : 0;

  const tw = 120;
  const th = 32;
  const tx = Math.max(8, Math.min(tooltipPos.x - tw / 2, size - tw - 8));
  const ty = Math.max(8, Math.min(tooltipPos.y - th - 12, size - th - 8));

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={handleMouseLeaveSvg}
      >
        {slices}
        {hoveredIndex !== null && hoveredData && (
          <g pointerEvents="none">
            <rect
              x={tx}
              y={ty}
              width={tw}
              height={th}
              fill="rgba(0, 0, 0, 0.9)"
              rx={6}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="0.5"
            />
            <text x={tx + tw / 2} y={ty + 14} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">
              {hoveredData.label}
            </text>
            <text x={tx + tw / 2} y={ty + 26} textAnchor="middle" fontSize="10" fill="#e5e7eb">
              {formatEuro(hoveredData.value)} ({percentage}%)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// Simple SVG Bar chart with expense numbers and hover breakdown (fix / variable / total)
export function BarChart({
  items,
  boxWidth = 640,
  boxHeight = 280,
  colors = { fixed: "#2563eb", variable: "#16a34a" },
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);

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
  const bottomSpace = 24;
  const scaleY = (v) => (v / maxVal) * (height - padding * 2 - bottomSpace);
  const centerX = (gx) => gx + barWidth + 3;

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const point = svgRef.current.createSVGPoint();
    point.x = e.clientX - svgRect.left;
    point.y = e.clientY - svgRect.top;
    setTooltipPos({ x: point.x, y: point.y });
  };

  const hovered = hoveredIdx !== null ? items[hoveredIdx] : null;

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {items.map((i, idx) => {
          const gx = padding + idx * groupWidth;
          const hFixed = scaleY(i.fixed);
          const hVar = scaleY(i.variable);
          const cx = centerX(gx);
          const total = i.fixed + i.variable;
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={i.monthKey}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseMove={handleMouseMove}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={gx}
                y={height - padding - bottomSpace - Math.max(hFixed, hVar)}
                width={groupWidth}
                height={height - padding - bottomSpace}
                fill="transparent"
              />
              <rect
                x={gx}
                y={height - padding - bottomSpace - hFixed}
                width={barWidth}
                height={hFixed}
                fill={colors.fixed}
                rx={4}
                opacity={isHovered ? 1 : 0.85}
              />
              <rect
                x={gx + barWidth + 6}
                y={height - padding - bottomSpace - hVar}
                width={barWidth}
                height={hVar}
                fill={colors.variable}
                rx={4}
                opacity={isHovered ? 1 : 0.85}
              />
              <text
                x={cx}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {i.monthKey.slice(5)}
              </text>
            </g>
          );
        })}
        {hoveredIdx !== null && hovered && (() => {
          const tw = 200;
          const th = 72;
          const tx = Math.max(10, Math.min(tooltipPos.x - tw / 2, width - tw - 10));
          const ty = Math.max(10, tooltipPos.y - th - 10);
          const tcx = tx + tw / 2;
          const lineH = 22;
          return (
            <g>
              <rect
                x={tx}
                y={ty}
                width={tw}
                height={th}
                fill="rgba(0, 0, 0, 0.9)"
                rx={8}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
              />
              <text x={tcx} y={ty + 20} textAnchor="middle" fontSize="13" fill="#93c5fd">
                Fixes: {formatEuro(hovered.fixed)}
              </text>
              <text x={tcx} y={ty + 20 + lineH} textAnchor="middle" fontSize="13" fill="#86efac">
                Variables: {formatEuro(hovered.variable)}
              </text>
              <text x={tcx} y={ty + 20 + lineH * 2} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
                Total: {formatEuro(hovered.fixed + hovered.variable)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
