import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import GenericTable from "../components/GenericTable";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [locations, setLocations] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const driverColumns = [
    { label: "Database ID", key: "id" },
    { label: "Driver", key: "full_name" },
  ];

  const locationColumns = [
    { label: "Database ID", key: "id" },
    { label: "Location", key: "name" },
  ];

  const truckColumns = [
    { label: "Database ID", key: "id" },
    { label: "Truck Plate Numers", key: "plate_number" },
  ];

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
        console.log(err);
        alert(err.message || "An unexpected error occurred");
      }
    } finally {
      setUploading(false);
    }
  };

  const DownloadTemplate = () => {
    return (
      <a
        href="/Templates.zip"
        download="Inventory_Templates.zip"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: ".6rem",
          borderRadius: "6px",
          backgroundColor: "#4B5563",
          color: "white",
          fontSize: "0.875rem",
        }}
      >
        📥 Download xlsx Templates (.zip)
      </a>
    );
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
              <strong>Row {err.row}</strong> ({err.id}
              {err.engine}): {err.details.join(", ")}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    const fetchPageData = async () => {
      if (authLoading) return;
      if (!user) return;
      try {
        setLoading(true);
        setNetworkError(null);
        const [locs, drvs, trks] = await Promise.all([
          api.getLocations(),
          api.getDrivers(),
          api.getTrucks(),
        ]);
        setLocations(locs);
        setDrivers(drvs);
        setTrucks(trks);
      } catch (err) {
        console.error(err);
        setNetworkError("Failed to load logistics form data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [user, authLoading]);

  if (authLoading || loading) return <div>Loading Page...</div>;
  if (networkError) return <div style={{ color: "red" }}>{networkError}</div>;
  if (!user) return null;

  return (
    <div className="page">
      <h1 className="page-title">Import Units & Waybills</h1>
      <div className="border-2 border-dashed border-gray-300 p-6 flex flex-row items-center justify-center gap-8">
        <DownloadTemplate />
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {uploading ? "Processing..." : "Upload Spreadsheet"}
        </button>
      </div>

      {results && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Results:</h3>
          <p>Successful Updates/Uploads: {results.count}</p>
        </div>
      )}

      <UploadFeedback errors={uploadErrors} />
      <h1 className="page-title" style={{ marginTop: "2rem" }}>
        ID References
      </h1>
      <div className="table-row-container">
        <GenericTable columns={locationColumns} data={locations} />
        <GenericTable columns={driverColumns} data={drivers} />
        <GenericTable columns={truckColumns} data={trucks} />
      </div>
    </div>
  );
};

export default BulkUpload;
