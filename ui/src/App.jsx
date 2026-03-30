import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Units from "./pages/Units";
import UnitForm from "./pages/UnitForm";
import UnitLogs from "./pages/UnitLogs";
import Scan from "./pages/Scan";
import Waybills from "./pages/Waybills";
import WaybillForm from "./pages/WaybillForm";
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
          <Route path="/" element={<Navigate to="/units" />} />
          <Route path="/units" element={<Units />} />
          <Route path="/unit_form" element={<UnitForm />} />
          <Route path="/unit_logs/:unitID" element={<UnitLogs />} />
          <Route path="/waybills" element={<Waybills />} />
          <Route path="/waybill_form" element={<WaybillForm />} />
          <Route path="/waybill_logs/:id" element={<WaybillLogs />} />
          <Route path="/scan" element={<Scan />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
