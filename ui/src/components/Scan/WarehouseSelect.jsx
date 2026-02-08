import React, { forwardRef } from "react";
import Select from "react-select";

const warehouseOptions = [
  { value: "A", label: "Warehouse A" },
  { value: "B", label: "Warehouse B" },
  { value: "C", label: "Warehouse C" },
];

const WarehouseSelect = forwardRef(({ warehouse, setWarehouse, title }, ref) => {
  const currentValue = warehouseOptions.find(opt => opt.value === warehouse) || null;

  const handleChange = (selectedOption) => {
    setWarehouse(selectedOption ? selectedOption.value : "");
  };

  return (
    <div className="scan-field" style={{ width: '100%' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>{title}</label>
      <Select
        ref={ref}                 
        value={currentValue}
        onChange={handleChange}
        options={warehouseOptions}
        placeholder="Select warehouse..."
        isClearable
        classNamePrefix="react-select" 
      />
    </div>
  );
});

export default WarehouseSelect;