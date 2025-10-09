import React, { useState } from "react";
import {
  getMonth,
  addFixedForMonth,
  updateFixedForMonth,
  deleteFixedForMonth,
  formatEuro,
} from "../utils/storage.js";

export default function MonthlyFixed({ data, monthKey, onDataChange }) {
  const month = getMonth(data, monthKey);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    amount: "",
    category: "",
    note: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.category) return;
    addFixedForMonth(data, monthKey, form);
    onDataChange({ ...data });
    setForm({ name: "", amount: "", category: "", note: "" });
  };

  const startEdit = (f) => {
    setEditingId(f.id);
    setEditForm({
      name: f.name,
      amount: String(f.amount),
      category: f.category,
      note: f.note || "",
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateFixedForMonth(data, monthKey, editingId, editForm);
    setEditingId(null);
    onDataChange({ ...data });
  };

  const cancelEdit = () => setEditingId(null);

  const onDelete = (id) => {
    deleteFixedForMonth(data, monthKey, id);
    onDataChange({ ...data });
  };

  return (
    <div className="card">
      <h3 className="section-title">Despeses fixes ({monthKey})</h3>
      <form
        onSubmit={onSubmit}
        className="row"
        style={{ gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}
      >
        <div className="col" style={{ minWidth: 140 }}>
          <label>Nom</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom"
          />
        </div>
        <div className="col" style={{ minWidth: 120 }}>
          <label>Import (€)</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="col" style={{ minWidth: 160 }}>
          <label>Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Selecciona</option>
            {data.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="col" style={{ minWidth: 200, flex: 1 }}>
          <label>Nota (opcional)</label>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Nota"
          />
        </div>
        <button className="primary" type="submit">
          Afegir fixa (mes)
        </button>
      </form>
      <div className="spacer" />
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th className="cell-right">Import</th>
              <th>Categoria</th>
              <th>Nota</th>
              <th className="actions"></th>
            </tr>
          </thead>
          <tbody>
            {month.fixed.map((f) => (
              <tr key={f.id}>
                <td>
                  {editingId === f.id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  ) : (
                    f.name
                  )}
                </td>
                <td className="cell-right">
                  {editingId === f.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, amount: e.target.value })
                      }
                    />
                  ) : (
                    formatEuro(f.amount)
                  )}
                </td>
                <td>
                  {editingId === f.id ? (
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                    >
                      {data.categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    f.category
                  )}
                </td>
                <td>
                  {editingId === f.id ? (
                    <input
                      value={editForm.note}
                      onChange={(e) =>
                        setEditForm({ ...editForm, note: e.target.value })
                      }
                    />
                  ) : (
                    f.note
                  )}
                </td>
                <td className="actions" style={{ whiteSpace: "nowrap" }}>
                  {editingId === f.id ? (
                    <>
                      <button className="primary" onClick={saveEdit}>
                        Guardar
                      </button>
                      <button onClick={cancelEdit} style={{ marginLeft: 6 }}>
                        Cancel·lar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(f)}>Editar</button>
                      <button
                        className="danger"
                        onClick={() => onDelete(f.id)}
                        style={{ marginLeft: 6 }}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {month.fixed.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  Sense despeses fixes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
