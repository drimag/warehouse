import { useState, useRef } from 'react';

export default function UnitUpload({ onFileSelect, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    
    // Simple validation for spreadsheet types
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (allowedTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      alert("Please upload a valid spreadsheet file (.xlsx or .csv)");
    }
  };

  return (
    <div 
      className={`upload-container ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => fileInputRef.current.click()}
    >
      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        onChange={(e) => handleFile(e.target.files[0])}
        accept=".xlsx, .xls, .csv"
      />

      <div className="upload-content">
        <div className="upload-icon">{isLoading ? '⏳' : '📊'}</div>
        {fileName ? (
          <div className="file-info">
            <strong>Selected:</strong> {fileName}
            {isLoading && <p>Processing file...</p>}
          </div>
        ) : (
          <div className="upload-text">
            <strong>Click to upload</strong> or drag and drop
            <span>Excel (.xlsx) or CSV files only</span>
          </div>
        )}
      </div>
    </div>
  );
}