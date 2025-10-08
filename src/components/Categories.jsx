import React, { useState } from "react";
import { addCategory, deleteCategory } from "../utils/storage.js";

export default function Categories({ data, onDataChange }) {
  const [name, setName] = useState("");

  const onAdd = (e) => {
    e.preventDefault();
    if (!name) return;
    addCategory(data, name);
    onDataChange({ ...data });
    setName("");
  };

  const onDelete = (n) => {
    deleteCategory(data, n);
    onDataChange({ ...data });
  };

  return (
    <div className="card">
      <h3 className="section-title">Categories</h3>
      <form onSubmit={onAdd} className="row" style={{ gap: 8 }}>
        <input
          placeholder="Nova categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="primary" type="submit">
          Afegir
        </button>
      </form>
      <div className="spacer" />
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        {data.categories.map((c) => (
          <span key={c} className="total-pill">
            {c}{" "}
            <button
              className="ghost"
              onClick={() => onDelete(c)}
              style={{ marginLeft: 8 }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
