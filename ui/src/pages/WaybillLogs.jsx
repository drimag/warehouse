import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import WaybillHeader from "../components/Waybills/WaybillHeader";
import GenericTable from "../components/GenericTable";

const logColumns = [
  { label: "Time", key: "timestamp" },
  { label: "Event/Status", key: "status" },
  { label: "Driver", key: "driver" },
  { label: "Truck", key: "truck" },
  { label: "Qty", key: "quantity" },
  {
    label: "Photo",
    key: "photo",
    render: (photo) =>
      photo ? (
        <a href={photo} target="_blank" rel="noreferrer">
          View Image
        </a>
      ) : (
        "—"
      ),
  },
  { label: "User", key: "user_name" },
];

const adviceColumns = [
  { label: "Type", key: "type" },
  { label: "Scheduled For", key: "expected_time" },
  { label: "Created At", key: "timestamp" },
  { label: "User", key: "user_name" },
];

const scanColumns = [
  { label: "Scanned Value", key: "scan" },
  { label: "Match Status", key: "status" },
  { label: "Scan Time", key: "timestamp" },
  {
    label: "Log Ref",
    key: "waybill_log_id",
    render: (val) => <small>Log: {val}</small>,
  },
];

export default function WaybillLogs() {
  const { id } = useParams();
  const [waybillData, setWaybillData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getWaybillInfo(id)
      .then((data) => {
        setWaybillData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading Waybill {id}...</div>;
  if (!waybillData) return <div>Waybill not found.</div>;

  const scansIn = waybillData.scans.filter(
    (scan) => scan.log_status === "ARRIVAL",
  );
  const scansOut = waybillData.scans.filter(
    (scan) => scan.log_status === "DEPARTURE",
  );

  return (
    <div className="page">
      <WaybillHeader waybill={waybillData.details} />

      <h1 className="page-title">Waybill Logs</h1>
      <GenericTable
        columns={logColumns}
        data={waybillData.logs}
        emptyMessage="No activity logged for this waybill yet."
      />

      <hr className="divider" />

      <h1 className="page-title">Waybill Advice</h1>
      <GenericTable
        columns={adviceColumns}
        data={waybillData.advice}
        emptyMessage="No activity logged for this waybill yet."
      />

      <hr className="divider" />

      <h1 className="page-title">Unit Scan In</h1>
      <GenericTable
        columns={scanColumns}
        data={scansIn}
        emptyMessage="No scans recorded for this session."
      />

      <hr className="divider" />

      <h1 className="page-title">Unit Scan Out</h1>
      <GenericTable
        columns={scanColumns}
        data={scansOut}
        emptyMessage="No scans recorded for this session."
      />
    </div>
  );
}
