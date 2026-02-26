import WaybillHeader from "../components/WaybillHeader";
import GenericTable from "../components/GenericTable";

const mockWaybill = {
  id: "wb-7721",
  waybill_number: "WB-2026-X99",
  client_name: "Honda Logistics",
  status: "IN_TRANSIT",
  origin_name: "Laguna Plant",
  destination_name: "North Harbor",
  driver_name: "Alex Reyes",
  truck_plate: "PH-9920",
  expected_quantity: 40,
  actual_quantity: 38,
  last_updated: "2026-02-24T10:45:00Z",
};

const logColumns = [
  {
    label: "Time",
    key: "timestamp",
    // render: (val) =>
    //   new Date(val).toLocaleString([], {
    //     month: "short",
    //     day: "2-digit",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //   }),
  },
  {
    label: "Event/Status",
    key: "status",
    render: (status) => (
      <span className={`badge badge-${status.toLowerCase()}`}>
        {status.replace("_", " ")}
      </span>
    ),
  },
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
  {
    label: "Type",
    key: "type",
    // render: (val) => (
    //   <strong style={{ color: val === 'DEPARTURE' ? '#1976d2' : '#2e7d32' }}>
    //     {val}
    //   </strong>
    // )
  },
  {
    label: "Scheduled For",
    key: "expected_time",
    // render: (val) => new Date(val).toLocaleString([], {
    //   month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
    // })
  },
  {
    label: "Created At",
    key: "timestamp",
    // render: (val) => new Date(val).toLocaleDateString([], {
    //   month: "short", day: "2-digit"
    // })
  },
  { label: "User", key: "user_name" },
];

const scanColumns = [
  {
    label: "Scanned Value",
    key: "scan",
    // render: (val) => <code style={{ fontSize: '1rem', color: '#333' }}>{val}</code>
  },
  {
    label: "Match Status",
    key: "status",
    // render: (status) => (
    //   <span className={`badge badge-${status.toLowerCase()}`}>
    //     {status}
    //   </span>
    // )
  },
  {
    label: "Scan Time",
    key: "timestamp",
    // render: (val) => new Date(val).toLocaleTimeString([], {
    //   hour: '2-digit', minute: '2-digit', second: '2-digit'
    // })
  },
  {
    label: "Log Ref",
    key: "waybill_log_id",
    render: (val) => <small>Log: {val}</small>,
  },
];

export const MOCK_WB_ADVICE = [
  {
    id: "adv-101",
    waybill_id: "wb-7721",
    type: "DEPARTURE",
    expected_time: "2026-02-24T08:00:00Z",
    timestamp: "2026-02-23T14:00:00Z",
    user_name: "admin2",
  },
  {
    id: "adv-102",
    waybill_id: "wb-7721",
    type: "ARRIVAL",
    expected_time: "2026-02-25T16:00:00Z",
    timestamp: "2026-02-23T14:05:00Z",
    user_name: "admin1",
  },
];

export const MOCK_WAYBILL_LOGS = [
  {
    id: "log-3",
    status: "ARRIVED",
    timestamp: "2026-02-24T14:30:00Z",
    driver: "Alex Reyes",
    truck: "PH-9920",
    quantity: 38,
    photo: "https://example.com/truck-arrival.jpg",
    user_name: "user1",
  },
  {
    id: "log-2",
    status: "IN_TRANSIT",
    timestamp: "2026-02-24T10:00:00Z",
    driver: "Alex Reyes",
    truck: "PH-9920",
    quantity: 40,
    photo: "https://example.com/truck-departure.jpg",
    user_name: "user2",
  },
  {
    id: "log-1",
    status: "ADVICE",
    timestamp: "2026-02-23T16:45:00Z",
    driver: "TBD",
    truck: "TBD",
    quantity: 40,
    photo: null,
    user_name: "user3",
  },
];

export const MOCK_SCANS = [
  {
    id: "scan-901",
    waybill_log_id: "log-2", // Matches the "Departure" log
    scan: "ENG-882910",
    status: "MATCHED",
    timestamp: "2026-02-24T10:05:12Z",
  },
  {
    id: "scan-902",
    waybill_log_id: "log-2",
    scan: "ENG-882911",
    status: "MATCHED",
    timestamp: "2026-02-24T10:06:45Z",
  },
  {
    id: "scan-903",
    waybill_log_id: "log-2",
    scan: "ENG-882912", // Example of a bad scan
    status: "PENDING",
    timestamp: "2026-02-24T10:08:00Z",
  },
];

export default function WaybillLogs() {
  return (
    <div className="page">
      <WaybillHeader waybill={mockWaybill} />

      <h1 className="page-title">Waybill Logs</h1>
      <GenericTable
        columns={logColumns}
        data={MOCK_WAYBILL_LOGS}
        emptyMessage="No activity logged for this waybill yet."
      />

      <hr className="divider" />

      <h1 className="page-title">Waybill Advice</h1>
      <GenericTable
        columns={adviceColumns}
        data={MOCK_WB_ADVICE}
        emptyMessage="No activity logged for this waybill yet."
      />

      <hr className="divider" />

      <h1 className="page-title">Unit Scan</h1>
      <GenericTable
        columns={scanColumns}
        data={MOCK_SCANS}
        emptyMessage="No scans recorded for this session."
      />
    </div>
  );
}
