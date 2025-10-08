import React from 'react'

// Month selector (YYYY-MM)
export default function MonthSelector({ value, onChange }) {
  return (
    <div className="row">
      <label htmlFor="month">Mes</label>
      <input
        id="month"
        type="month"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  )
}


