import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Units from "./pages/Units";
import UnitForm from "./pages/UnitForm";
import UnitLogs from "./pages/UnitLogs";
import Scan from "./pages/Scan";
import Waybills from "./pages/Waybills";
import WaybillForm from "./pages/WaybillForm";
import WaybillLogs from "./pages/WaybillLogs";
import BulkUpload from "./pages/BulkUpload";
import "./styles/layout.css";
import "./styles/tables.css";
import "./styles/scan.css";
import "./styles/sidebar.css";
import "./styles/unit.css";

// View Components
// import LoginView from "./views/LoginView";
// import PermissionDeniedView from "./views/PermissionDeniedView"

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          {/* Public Authentication Path
          <Route path="/login" element={<LoginView />} />
          <Route path="/unauthorized" element={<PermissionDeniedView />} /> */}

          <Route
            element={
              <ProtectedRoute permittedRoles={["ADMIN", "SCANNER", "VIEWER"]} />
            }
          >
            <Route path="/" element={<Navigate to="/units" />} />
            <Route path="/units" element={<Units />} />
            <Route path="/unit_logs/:unitID" element={<UnitLogs />} />
            <Route path="/waybills" element={<Waybills />} />
            <Route path="/waybill_logs/:id" element={<WaybillLogs />} />
          </Route>

          <Route
            element={<ProtectedRoute permittedRoles={["ADMIN", "SCANNER"]} />}
          >
            <Route path="/unit_form" element={<UnitForm />} />
            <Route path="/waybill_form" element={<WaybillForm />} />
            <Route path="/scan" element={<Scan />} />
          </Route>

          <Route element={<ProtectedRoute permittedRoles={["ADMIN"]} />}>
            <Route path="/bulk_upload" element={<BulkUpload />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
