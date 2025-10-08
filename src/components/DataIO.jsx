import React, { useRef } from "react";
import { exportCSV, importCSV, writeData } from "../utils/storage.js";

export default function DataIO({ data, onDataReplace }) {
  const fileRef = useRef(null);

  const onExport = () => {
    const csv = exportCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "despeses.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onImportClick = () => fileRef.current?.click();

  const onImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      try {
        const newData = importCSV(String(text));
        if (!newData) throw new Error("CSV buit o invàlid");
        writeData(newData);
        onDataReplace(newData);
        alert("Importació completada: dades reemplaçades");
      } catch (err) {
        console.error(err);
        alert(
          "Error en importar el CSV. Revisa el format i torna-ho a provar."
        );
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="card">
      <h3 className="section-title">Dades</h3>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <button className="primary" onClick={onExport}>
          Exportar CSV
        </button>
        <button onClick={onImportClick}>Importar CSV (substitueix tot)</button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onImportFile}
          style={{ display: "none" }}
        />
      </div>
      <div className="note">
        La importació substitueix completament les dades actuals.
      </div>
    </div>
  );
}
