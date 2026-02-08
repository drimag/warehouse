import { forwardRef } from "react";

const ScanInput = forwardRef(({ vin, setVin, title, onKeyDown }, ref) => {
  return (
    <div className="scan-field">
      <label>{title}</label>
      <input 
        type="text"
        ref={ref} 
        value={vin} 
        onChange={(e) => setVin(e.target.value)} 
        onKeyDown={onKeyDown}
      />
    </div>
  );
});

export default ScanInput;