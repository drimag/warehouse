import { useNavigate } from "react-router-dom";
export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="nav-icon" onClick={() => navigate("/inventory")} />
      <div className="nav-icon" onClick={() => navigate("/movement")} />
      <div className="nav-icon" onClick={() => navigate("/waybills")} />
      <div className="nav-icon" onClick={() => navigate("/stockin")} />
      <div className="nav-icon" onClick={() => navigate("/stockout")} />
      <div className="nav-icon" onClick={() => navigate("/scan")} />
    </div>
  );
}
