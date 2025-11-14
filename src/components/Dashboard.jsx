import React, { useMemo } from "react";
import {
  sumFixedForMonth,
  sumVariableForMonth,
  formatEuro,
  totalsByCategoryForMonth,
  totalsByMonthForYear,
} from "../utils/storage.js";
import { BarChart } from "./Charts.jsx";

export default function Dashboard({ data, monthKey }) {
  const fixed = sumFixedForMonth(data, monthKey);
  const variable = sumVariableForMonth(data, monthKey);
  const total = fixed + variable;
  const year = Number(monthKey.slice(0, 4));
  const byCat = useMemo(
    () =>
      totalsByCategoryForMonth(data, monthKey)
        .map((x) => ({
          label: x.category,
          value: x.amount,
        }))
        .sort((a, b) => b.value - a.value), // Ordenar descendente por importe
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
      <div className="card" style={{ marginTop: 12 }}>
        <h4 className="section-title" style={{ marginBottom: 12 }}>
          Distribució per categories ({monthKey})
        </h4>
        {byCat.length > 0 ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th className="cell-right">Import</th>
                  <th className="cell-right">Percentatge</th>
                </tr>
              </thead>
              <tbody>
                {byCat.map((d, i) => {
                  const percentage = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i}>
                      <td>{d.label}</td>
                      <td className="cell-right">
                        <strong>{formatEuro(d.value)}</strong>
                      </td>
                      <td className="cell-right muted">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="muted" style={{ textAlign: "center", padding: "20px" }}>
            Sense despeses aquest mes.
          </div>
        )}
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
