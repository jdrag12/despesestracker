import React, { useMemo } from "react";
import {
  sumFixedForMonth,
  sumVariableForMonth,
  formatEuro,
  totalsByCategoryForMonth,
  totalsByMonthForYear,
} from "../utils/storage.js";
import { PieChart, BarChart } from "./Charts.jsx";

export default function Dashboard({ data, monthKey }) {
  const fixed = sumFixedForMonth(data, monthKey);
  const variable = sumVariableForMonth(data, monthKey);
  const total = fixed + variable;
  const year = Number(monthKey.slice(0, 4));
  const byCat = useMemo(
    () =>
      totalsByCategoryForMonth(data, monthKey).map((x) => ({
        label: x.category,
        value: x.amount,
      })),
    [data, monthKey]
  );
  const yearSeries = useMemo(
    () => totalsByMonthForYear(data, year),
    [data, year]
  );
  return (
    <div className="card">
      <h3 className="section-title">Panell</h3>
      <div className="totals">
        <div className="total-pill">
          Fixes: <strong>{formatEuro(fixed)}</strong>
        </div>
        <div className="total-pill">
          Variables: <strong>{formatEuro(variable)}</strong>
        </div>
        <div className="total-pill">
          Total mensual: <strong>{formatEuro(total)}</strong>
        </div>
      </div>
      <div
        className="row"
        style={{
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginTop: 12,
        }}
      >
        <div className="card" style={{ flex: "1 1 280px", minWidth: 260 }}>
          <div className="muted">Distribució per categories ({monthKey})</div>
          <div style={{ maxWidth: 380 }}>
            <PieChart data={byCat} boxSize={220} strokeWidth={28} />
          </div>
          <div
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
          >
            {byCat.map((d, i) => (
              <span key={i} className="total-pill" style={{ fontSize: 12 }}>
                {d.label}: {formatEuro(d.value)}
              </span>
            ))}
          </div>
        </div>
        <div className="card" style={{ flex: 2, minWidth: 320 }}>
          <div className="muted">Resum anual {year} (F/V)</div>
          <BarChart items={yearSeries} />
        </div>
      </div>
    </div>
  );
}
