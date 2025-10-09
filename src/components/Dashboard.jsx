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
      <div className="card" style={{ marginTop: 12, textAlign: "center" }}>
        <div className="muted">Distribució per categories ({monthKey})</div>
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <PieChart data={byCat} boxSize={260} strokeWidth={28} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 8,
            justifyContent: "center",
          }}
        >
          {byCat.map((d, i) => (
            <span key={i} className="total-pill" style={{ fontSize: 12 }}>
              {d.label}: {formatEuro(d.value)}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h4 className="section-title" style={{ marginBottom: 12 }}>
          Resum anual {year}
        </h4>
        <BarChart items={yearSeries} />
      </div>
    </div>
  );
}
