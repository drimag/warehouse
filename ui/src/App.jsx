import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Units from "./pages/Units";
import UnitForm from "./pages/UnitForm";
import UnitLogs from "./pages/UnitLogs";
import Scan from "./pages/Scan";
import Waybills from "./pages/Waybills";
import WaybillForm from "./pages/WaybillForm";
import WaybillLogs from "./pages/WaybillLogs";
import BulkUpload from "./pages/BulkUpload";
import { HelpPage } from "./pages/HelpPage";
import Register from "./pages/Register";
import "./styles/layout.css";
import "./styles/tables.css";
import "./styles/scan.css";
import "./styles/sidebar.css";
import "./styles/unit.css";

function App() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          {/* 2. Public Pathways */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/unauthorized"
            element={
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>🛑 403 - Permission Denied</h2>
                <p>
                  Your security clearance level does not allow access to this
                  module.
                </p>
              </div>
            }
          />

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
            <Route path="/help" element={<HelpPage />} />
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

          {/* Wildcard Catch-all safety net routing */}
          <Route
            path="*"
            element={<Navigate to={user ? "/units" : "/login"} replace />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
