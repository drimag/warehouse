import UnitHeader from "../components/UnitHeader";
import GenericTable from "../components/GenericTable";

const unitLogColumns = [
  {
    label: "Event",
    key: "event",
    render: (val) => (
      <span className={`event-type event-${val.toLowerCase()}`}>{val}</span>
    ),
  },
  {
    label: "Waybill Ref",
    key: "waybill_id",
    render: (val) => (val ? <span className="text-link">#{val}</span> : "N/A"),
  },
  {
    label: "Date & Time",
    key: "timestamp",
    render: (val) =>
      new Date(val).toLocaleString([], {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  { label: "User", key: "user_id" },
];

export const MOCK_UNIT_LOGS = [
  {
    id: "ulog-303",
    waybill_id: "WB-2026-X99",
    engine: "ENG-882910",
    event: "ARRIVAL",
    timestamp: "2026-02-24T14:30:00Z",
    user_id: "user3",
  },
  {
    id: "ulog-302",
    waybill_id: "WB-2026-X99",
    engine: "ENG-882910",
    event: "DEPARTURE",
    timestamp: "2026-02-24T10:00:00Z",
    user_id: "user2",
  },
  {
    id: "ulog-301",
    waybill_id: null, // No waybill yet when first generated
    engine: "ENG-882910",
    event: "GENERATED",
    timestamp: "2026-02-22T09:00:00Z",
    user_id: "user1",
  },
];

const mockUnitDetail = {
  engine: "ENG-882910",
  frame: "FRM-XP122",
  model: "Hilux G",
  color: "Super White",
  da: "DA-2026-005",
  current_warehouse: "Laguna Plant",
  status: "IN STOCK",
  last_updated: "2026-02-24T15:30:00Z",
};

export default function UnitPage() {
  return (
    <div className="page">
      <UnitHeader unit={mockUnitDetail} />
      <h1 className="page-title">Unit Logs</h1>
      <GenericTable
        columns={unitLogColumns}
        data={MOCK_UNIT_LOGS}
        emptyMessage="No movement history found for this engine."
      />
    </div>
  );
}
