import React, { forwardRef } from "react";

const GenericSelect = forwardRef(({ selected, setSelected, title, options, placeholder }, ref) => {
  return (
    <div className="scan-field">
      <label>{title}</label>
      <select
        ref={ref}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
});

export default GenericSelect;