import React, { useState } from "react";
import { api } from "../services/api";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("excelFile", file);

    setUploading(true);
    try {
      setUploadErrors([]);
      const response = await api.uploadSheet(formData);

      setResults(response);
      alert("Bulk upload completed!");
    } catch (err) {
      console.error("The actual crash reason:", err);
      if (err.status === 422 && err.response?.data?.errors) {
        console.log("1 - Success! Errors found:", err.response.data.errors);
        setUploadErrors(err.response.data.errors);
      } else {
        console.log("2 - Generic Error");
        alert(err.message || "An unexpected error occurred");
      }
    } finally {
      setUploading(false);
    }
  };

  const UploadFeedback = ({ errors }) => {
    if (errors.length === 0) return null;

    return (
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          borderRadius: "6px",
          backgroundColor: "#FEF2F2",
          border: "1px solid #FCA5A5",
          color: "#991B1B",
          fontSize: "0.875rem",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
          ⚠️ {errors.length} rows need fixing:
        </h4>
        <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
          {errors.map((err, i) => (
            <li key={i} style={{ marginBottom: "0.25rem" }}>
              <strong>Row {err.row}</strong> ({err.id}{err.engine}):{" "}
              {err.details.join(", ")}
            </li>
          ))}
        </ul>
      </div>
    );
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

      <UploadFeedback errors={uploadErrors} />
    </div>
  );
};

export default BulkUpload;
