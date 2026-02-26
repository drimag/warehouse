import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Sidebar from "./components/Sidebar";
import UnitPage from "./pages/UnitHistory";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import Waybills from "./pages/Waybills";
import Scan from "./pages/Scan";
import Waybill from "./pages/Waybill";
import WaybillLogs from "./pages/WaybillLogs";
import "./styles/layout.css";
import "./styles/tables.css";
import "./styles/scan.css";
import "./styles/sidebar.css";
import "./styles/unit.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/waybills" element={<Waybills />} />
          <Route path="/waybill_logs" element={<WaybillLogs />} />
          <Route path="/units" element={<UnitPage />} />
          <Route path="/stockin" element={<StockIn />} />
          <Route path="/stockout" element={<StockOut />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/waybill" element={<Waybill />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
