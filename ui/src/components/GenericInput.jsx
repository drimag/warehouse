import { forwardRef } from "react";

const GenericInput = forwardRef(({ val, setVal, title, onKeyDown, placeholder }, ref) => {
  return (
    <div className="scan-field">
      <label>{title}</label>
      <input 
        type="text"
        ref={ref} 
        value={val} 
        onChange={(e) => setVal(e.target.value)} 
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
});

export default GenericInput;