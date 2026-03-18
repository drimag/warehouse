import React, { forwardRef } from "react";

const DatePicker = forwardRef(
  ({ selected, setSelected, title }, ref) => {
    return (
      <div className="scan-field">
        <label>{title}</label>
        <input
          ref={ref}
          type="datetime-local"
          value={selected}
          className="datetime-input"
          onChange={(e) => setSelected(e.target.value)}
        />
      </div>
    );
  },
);

export default DatePicker;
