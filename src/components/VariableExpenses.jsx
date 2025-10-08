import React, { useState } from "react";
import {
  addVariableExpense,
  updateVariableExpense,
  deleteVariableExpense,
  getMonth,
  formatEuro,
} from "../utils/storage.js";

export default function VariableExpenses({ data, monthKey, onDataChange }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "",
    note: "",
  });

  const month = getMonth(data, monthKey);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.category) return;
    addVariableExpense(data, monthKey, form);
    onDataChange({ ...data });
    setForm({ name: "", amount: "", category: "", note: "" });
  };

  const onDelete = (id) => {
    deleteVariableExpense(data, monthKey, id);
    onDataChange({ ...data });
  };

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    amount: "",
    category: "",
    note: "",
  });

  const startEdit = (v) => {
    setEditingId(v.id);
    setEditForm({
      name: v.name,
      amount: String(v.amount),
      category: v.category,
      note: v.note || "",
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateVariableExpense(data, monthKey, editingId, editForm);
    setEditingId(null);
    onDataChange({ ...data });
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="card">
      <h3 className="section-title">Despeses variables ({monthKey})</h3>
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
          Afegir variable
        </button>
      </form>
      <div className="spacer" />
      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Import</th>
            <th>Categoria</th>
            <th>Nota</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {month.variable.map((v) => (
            <tr key={v.id}>
              <td>
                {editingId === v.id ? (
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                ) : (
                  v.name
                )}
              </td>
              <td>
                {editingId === v.id ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                  />
                ) : (
                  formatEuro(v.amount)
                )}
              </td>
              <td>
                {editingId === v.id ? (
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
                  v.category
                )}
              </td>
              <td>
                {editingId === v.id ? (
                  <input
                    value={editForm.note}
                    onChange={(e) =>
                      setEditForm({ ...editForm, note: e.target.value })
                    }
                  />
                ) : (
                  v.note
                )}
              </td>
              <td style={{ whiteSpace: "nowrap" }}>
                {editingId === v.id ? (
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
                    <button onClick={() => startEdit(v)}>Editar</button>
                    <button
                      className="danger"
                      onClick={() => onDelete(v.id)}
                      style={{ marginLeft: 6 }}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {month.variable.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                Sense despeses variables.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
