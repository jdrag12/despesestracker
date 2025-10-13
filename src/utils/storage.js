// Local storage utilities and data model for expense tracking
// All comments are in English only.

const STORAGE_KEY = "expenseTracker_v1";

// Default categories in Catalan
export const DEFAULT_CATEGORIES = [
  "Habitatge", // Housing
  "Menjar", // Food
  "Transport",
  "Oci", // Leisure
];

// Returns YYYY-MM string
export function toMonthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function nowMonthKey() {
  return toMonthKey(new Date());
}

// Compute previous month key (YYYY-MM)
export function prevMonthKey(monthKey) {
  const [yStr, mStr] = monthKey.split("-");
  let y = parseInt(yStr, 10);
  let m = parseInt(mStr, 10) - 1;
  if (m === 0) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

// Read the whole data blob from localStorage
export function readData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      categories: [...DEFAULT_CATEGORIES],
      fixedTemplates: [], // array of { id, name, amount, category, note, startMonth }
      months: {}, // { 'YYYY-MM': { variable: [expense], fixedAppliedFromTemplates: true } }
      lastOpenedMonth: nowMonthKey(),
    };
  }
  try {
    const data = JSON.parse(raw);
    if (!data.categories) data.categories = [...DEFAULT_CATEGORIES];
    if (!data.fixedTemplates) data.fixedTemplates = [];
    if (!data.months) data.months = {};
    if (!data.lastOpenedMonth) data.lastOpenedMonth = nowMonthKey();
    return data;
  } catch (e) {
    console.error("Failed to parse storage. Resetting.", e);
    return {
      categories: [...DEFAULT_CATEGORIES],
      fixedTemplates: [],
      months: {},
      lastOpenedMonth: nowMonthKey(),
    };
  }
}

export function writeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Ensure the month entry exists; apply fixed templates if first time opened.
export function ensureMonthInitialized(data, monthKey) {
  if (!data.months[monthKey]) {
    data.months[monthKey] = {
      variable: [],
      fixed: [], // concrete fixed instances for this month
      fixedAppliedFromTemplates: false,
    };
  }
  const month = data.months[monthKey];
  if (!month.fixedAppliedFromTemplates) {
    // On first activation of a month, auto-copy previous month's fixed entries if none exist.
    const hasExistingFixed =
      Array.isArray(month.fixed) && month.fixed.length > 0;
    if (!hasExistingFixed) {
      const prevKey = prevMonthKey(monthKey);
      const prevMonth = data.months[prevKey];
      if (prevMonth && Array.isArray(prevMonth.fixed)) {
        month.fixed = prevMonth.fixed.map((f) => ({ ...f, id: generateId() }));
      }
    }
    month.fixedAppliedFromTemplates = true;
  }
}

export function getMonth(data, monthKey) {
  ensureMonthInitialized(data, monthKey);
  return data.months[monthKey];
}

// Fixed template operations (affect future months only via startMonth)
export function addFixedTemplate(
  data,
  { name, amount, category, note },
  effectiveMonth
) {
  const template = {
    id: generateId(),
    name,
    amount: parseFloat(amount),
    category,
    note: note || "",
    startMonth: effectiveMonth, // edits apply only going forward
  };
  data.fixedTemplates.push(template);
  return template;
}

export function updateFixedTemplate(data, templateId, updates, effectiveMonth) {
  const idx = data.fixedTemplates.findIndex((t) => t.id === templateId);
  if (idx === -1) return;
  const old = data.fixedTemplates[idx];
  // Create a new template effective from the specified month, keep old for past months
  const newTemplate = {
    id: generateId(),
    name: updates.name ?? old.name,
    amount: updates.amount != null ? parseFloat(updates.amount) : old.amount,
    category: updates.category ?? old.category,
    note: updates.note != null ? updates.note : old.note,
    startMonth: effectiveMonth,
  };
  data.fixedTemplates.push(newTemplate);

  // Also update already-initialized months from effectiveMonth onward so current/future exports reflect the change
  for (const [monthKey, month] of Object.entries(data.months)) {
    if (monthKey >= effectiveMonth) {
      // Ensure structure exists
      ensureMonthInitialized(data, monthKey);
      const list = data.months[monthKey].fixed || [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].templateId === templateId) {
          list[i] = {
            ...list[i],
            templateId: newTemplate.id,
            name: newTemplate.name,
            amount: newTemplate.amount,
            category: newTemplate.category,
            note: newTemplate.note,
          };
        }
      }
    }
  }
}

export function deleteFixedTemplate(data, templateId) {
  data.fixedTemplates = data.fixedTemplates.filter((t) => t.id !== templateId);
}

// Variable expense operations for a specific month
export function addVariableExpense(
  data,
  monthKey,
  { name, amount, category, note }
) {
  ensureMonthInitialized(data, monthKey);
  const exp = {
    id: generateId(),
    name,
    amount: parseFloat(amount),
    category,
    note: note || "",
    createdAt: new Date().toISOString(),
  };
  data.months[monthKey].variable.push(exp);
  return exp;
}

export function updateVariableExpense(data, monthKey, id, updates) {
  ensureMonthInitialized(data, monthKey);
  const list = data.months[monthKey].variable;
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return;
  const old = list[idx];
  list[idx] = {
    ...old,
    ...updates,
    amount: updates.amount != null ? parseFloat(updates.amount) : old.amount,
  };
}

export function deleteVariableExpense(data, monthKey, id) {
  ensureMonthInitialized(data, monthKey);
  data.months[monthKey].variable = data.months[monthKey].variable.filter(
    (e) => e.id !== id
  );
}

// Fixed expense operations for a specific month (concrete instances)
export function addFixedForMonth(
  data,
  monthKey,
  { name, amount, category, note }
) {
  ensureMonthInitialized(data, monthKey);
  const exp = {
    id: generateId(),
    name,
    amount: parseFloat(amount),
    category,
    note: note || "",
    createdAt: new Date().toISOString(),
  };
  data.months[monthKey].fixed.push(exp);
  return exp;
}

export function updateFixedForMonth(data, monthKey, id, updates) {
  ensureMonthInitialized(data, monthKey);
  const list = data.months[monthKey].fixed;
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return;
  const old = list[idx];
  list[idx] = {
    ...old,
    ...updates,
    amount: updates.amount != null ? parseFloat(updates.amount) : old.amount,
  };
}

export function deleteFixedForMonth(data, monthKey, id) {
  ensureMonthInitialized(data, monthKey);
  data.months[monthKey].fixed = data.months[monthKey].fixed.filter(
    (e) => e.id !== id
  );
}

// Category operations
export function addCategory(data, name) {
  if (!data.categories.includes(name)) data.categories.push(name);
}

export function deleteCategory(data, name) {
  data.categories = data.categories.filter((c) => c !== name);
}

// CSV handling: full export/import
// CSV columns: type(template|fixed|variable|category),month(optional),name,amount,category,note
export function exportCSV(data) {
  const rows = [["type", "month", "name", "amount", "category", "note"]];
  // Ensure current (lastOpenedMonth) is initialized so fixed templates are materialized
  const currentMonth = data.lastOpenedMonth || nowMonthKey();
  ensureMonthInitialized(data, currentMonth);
  // Collect months to export (include current even if previously absent)
  const monthsKeys = new Set(Object.keys(data.months));
  monthsKeys.add(currentMonth);
  for (const monthKey of monthsKeys) {
    const month = getMonth(data, monthKey);
    for (const f of month.fixed || []) {
      rows.push([
        "fixed",
        monthKey,
        f.name,
        String(f.amount),
        f.category,
        f.note || "",
      ]);
    }
    for (const v of month.variable || []) {
      rows.push([
        "variable",
        monthKey,
        v.name,
        String(v.amount),
        v.category,
        v.note || "",
      ]);
    }
  }
  const csv = rows
    .map((r) => r.map((field) => escapeCsvField(field)).join(","))
    .join("\n");
  return csv;
}

function escapeCsvField(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function importCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return null;
  const delimiter = detectDelimiter(lines[0]);
  const header = parseCsvLine(lines[0], delimiter);
  if (header.length > 0) header[0] = header[0].replace(/^\uFEFF/, "");
  const normalizedHeader = header.map((h) => h.trim().toLowerCase());
  const getIndex = (aliases) => {
    for (const alias of aliases) {
      const idx = normalizedHeader.indexOf(alias);
      if (idx !== -1) return idx;
    }
    return -1;
  };
  const idxType = getIndex(["type", "tipus"]);
  const idxMonth = getIndex(["month", "mes"]);
  const idxName = getIndex(["name", "nom"]);
  const idxAmount = getIndex(["amount", "import", "importe"]);
  const idxCategory = getIndex(["category", "categoria"]);
  const idxNote = getIndex(["note", "nota"]);
  const data = {
    categories: [...DEFAULT_CATEGORIES],
    fixedTemplates: [],
    months: {},
    lastOpenedMonth: nowMonthKey(),
  };
  let firstMonthSeen = null;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    const type =
      idxType !== -1 ? (cols[idxType] || "").trim().toLowerCase() : "";
    let month = idxMonth !== -1 ? (cols[idxMonth] || "").trim() : "";
    const name = idxName !== -1 ? (cols[idxName] || "").trim() : "";
    const amountStr = idxAmount !== -1 ? (cols[idxAmount] || "").trim() : "";
    const category = idxCategory !== -1 ? (cols[idxCategory] || "").trim() : "";
    const note = idxNote !== -1 ? (cols[idxNote] || "").trim() : "";
    // Normalize amount: remove euro/whitespace and convert decimal comma to dot
    const normalizedAmountStr = amountStr
      .replace(/[€\s]/g, "")
      .replace(/,/g, ".");
    const amount = normalizedAmountStr ? parseFloat(normalizedAmountStr) : 0;
    if (!name) continue;
    // Always add category found in column
    if (category && !data.categories.includes(category))
      data.categories.push(category);
    // Only accept fixed/variable rows
    if (type === "fixed" || type === "variable") {
      // Normalize month like YYYY-M or YYYY/M to YYYY-MM
      const mMatch = month.match(/^(\d{4})[-/](\d{1,2})$/);
      if (mMatch) {
        const y = mMatch[1];
        const m = String(parseInt(mMatch[2], 10)).padStart(2, "0");
        month = `${y}-${m}`;
      }
      if (!/^\d{4}-\d{2}$/.test(month)) continue;
      ensureMonthInitialized(data, month);
      // If we are importing concrete monthly data, mark as already applied
      data.months[month].fixedAppliedFromTemplates = true;
      if (!firstMonthSeen) firstMonthSeen = month;
      const entry = { id: generateId(), name, amount, category, note };
      if (type === "fixed") data.months[month].fixed.push(entry);
      else data.months[month].variable.push(entry);
    }
  }
  if (firstMonthSeen) data.lastOpenedMonth = firstMonthSeen;
  return data;
}

function detectDelimiter(line) {
  // Basic heuristic: choose the delimiter with more occurrences outside quotes
  const commaCount = countDelimiter(line, ",");
  const semiCount = countDelimiter(line, ";");
  return semiCount > commaCount ? ";" : ",";
}

function countDelimiter(line, delim) {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes && ch === delim) count++;
  }
  return count;
}

function parseCsvLine(line, delimiter = ",") {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === delimiter) {
        result.push(current);
        current = "";
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// Totals
export function sumFixedForMonth(data, monthKey) {
  const m = getMonth(data, monthKey);
  return (m.fixed || []).reduce(
    (acc, e) => acc + (parseFloat(e.amount) || 0),
    0
  );
}

export function sumVariableForMonth(data, monthKey) {
  const m = getMonth(data, monthKey);
  return (m.variable || []).reduce(
    (acc, e) => acc + (parseFloat(e.amount) || 0),
    0
  );
}

export function formatEuro(amount) {
  const num = isNaN(amount) ? 0 : Number(amount);
  return `${num.toFixed(2)} €`;
}

// Format timestamp for display
export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("ca-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Aggregate totals per month for a given year
export function getYearMonths(year) {
  return Array.from(
    { length: 12 },
    (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`
  );
}

export function totalsByMonthForYear(data, year) {
  const months = getYearMonths(year);
  return months.map((mk) => {
    // Ensure the month is initialized so fixed entries are available
    ensureMonthInitialized(data, mk);
    const fixed = sumFixedForMonth(data, mk);
    const variable = sumVariableForMonth(data, mk);
    return { monthKey: mk, fixed, variable, total: fixed + variable };
  });
}

// Sum by category for a specific month
export function totalsByCategoryForMonth(data, monthKey) {
  const m = getMonth(data, monthKey);
  const map = new Map();
  const add = (cat, amt) => {
    const prev = map.get(cat) || 0;
    map.set(cat, prev + (parseFloat(amt) || 0));
  };
  for (const f of m.fixed || []) add(f.category || "Altres", f.amount);
  for (const v of m.variable || []) add(v.category || "Altres", v.amount);
  return Array.from(map.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
}
