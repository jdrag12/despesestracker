import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./styles/global.css";
import MonthSelector from "./components/MonthSelector.jsx";
import Dashboard from "./components/Dashboard.jsx";
import VariableExpenses from "./components/VariableExpenses.jsx";
import Categories from "./components/Categories.jsx";
import DataIO from "./components/DataIO.jsx";
import MonthlyFixed from "./components/MonthlyFixed.jsx";
import {
  readData,
  writeData,
  getMonth,
  nowMonthKey,
  ensureMonthInitialized,
} from "./utils/storage.js";

function App() {
  const initialData = readData();
  const currentMonth = nowMonthKey();

  // Auto-switch to current month if last opened month is in the past
  const initialMonthKey = (() => {
    const lastOpened = initialData.lastOpenedMonth || currentMonth;
    // If last opened month is before current month, switch to current month
    if (lastOpened < currentMonth) {
      return currentMonth;
    }
    return lastOpened;
  })();

  const [data, setData] = useState(initialData);
  const [monthKey, setMonthKey] = useState(initialMonthKey);
  const [tab, setTab] = useState("panell");

  // Initialize month when selected
  useEffect(() => {
    const cloned = { ...data };
    ensureMonthInitialized(cloned, monthKey);
    cloned.lastOpenedMonth = monthKey;
    writeData(cloned);
    setData(cloned);
  }, [monthKey]);

  // Derived current month data
  const monthData = useMemo(() => getMonth(data, monthKey), [data, monthKey]);

  const onDataChange = (next) => {
    writeData(next);
    setData(next);
  };

  const onDataReplace = (next) => {
    setMonthKey(next.lastOpenedMonth);
    setData(next);
  };

  return (
    <div className="container">
      <div className="app-header">
        <h2 style={{ margin: 0 }}>Control de Despeses</h2>
        <MonthSelector value={monthKey} onChange={setMonthKey} />
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === "panell" ? "active" : ""}`}
          onClick={() => setTab("panell")}
        >
          Panell
        </button>
        <button
          className={`tab ${tab === "gestio" ? "active" : ""}`}
          onClick={() => setTab("gestio")}
        >
          Gestió de despeses
        </button>
        <button
          className={`tab ${tab === "categories" ? "active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Categories
        </button>
        <button
          className={`tab ${tab === "dades" ? "active" : ""}`}
          onClick={() => setTab("dades")}
        >
          Dades
        </button>
      </div>

      {tab === "panell" && <Dashboard data={data} monthKey={monthKey} />}

      {tab === "gestio" && (
        <>
          <MonthlyFixed
            data={data}
            monthKey={monthKey}
            onDataChange={onDataChange}
          />
          <VariableExpenses
            data={data}
            monthKey={monthKey}
            onDataChange={onDataChange}
          />
        </>
      )}

      {tab === "categories" && (
        <Categories data={data} onDataChange={onDataChange} />
      )}

      {tab === "dades" && <DataIO data={data} onDataReplace={onDataReplace} />}
    </div>
  );
}

export default App;
