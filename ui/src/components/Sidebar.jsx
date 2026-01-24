import { useNavigate } from "react-router-dom";
import "../styles/layout.css";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="nav-icon" onClick={() => navigate("/inventory")} />
      <div className="nav-icon" onClick={() => navigate("/movement")} />
      <div className="nav-icon" onClick={() => navigate("/scan")} />
    </div>
  );
}
