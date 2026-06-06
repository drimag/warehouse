import React, { forwardRef } from "react";

const GenericSelect = forwardRef(
  ({ selected, setSelected, title, options, placeholder }, ref) => {
    return (
      <div className="scan-field">
        <label>{title}</label>
        <select
          ref={ref}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => {
            const isObject = typeof opt === "object" && opt !== null;

            const optionValue = isObject ? (opt.value ?? opt.id) : opt;
            const optionLabel = isObject ? (opt.label ?? opt.name) : opt;

            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      </div>
    );
  },
);

export default GenericSelect;
