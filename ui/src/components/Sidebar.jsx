import { useNavigate } from "react-router-dom";
export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="nav-icon" onClick={() => navigate("/units")} />
      <div className="nav-icon" onClick={() => navigate("/waybills")} />
      <div className="nav-icon" onClick={() => navigate("/scan")} />
      <div className="nav-icon" onClick={() => navigate("/waybill_form")} />
      <div className="nav-icon" onClick={() => navigate("/unit_form")} />
      <div className="nav-icon" onClick={() => navigate("/bulk_upload")} />
    </div>
  );
}
