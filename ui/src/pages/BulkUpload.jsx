import React, { useState } from 'react';
import { api } from "../services/api";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append('excelFile', file);

    setUploading(true);
    try {
      const response = await api.uploadSheet(formData);
      setResults(response);
      alert("Bulk upload completed!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Import Units & Waybills</h1>
      <div className="border-2 border-dashed border-gray-300 p-10 text-center">
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
        >
          {uploading ? "Processing..." : "Upload Spreadsheet"}
        </button>
      </div>

      {results && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Results:</h3>
          <p>Success: {results.successCount}</p>
          <p>Errors: {results.errorCount}</p>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;