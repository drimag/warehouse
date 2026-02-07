import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Scan from "./pages/Scan";
import Movement from "./pages/Movement";
import Sidebar from "./components/Sidebar";
import UnitPage from "./pages/UnitHistory";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
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
          <Route path="/scan" element={<Scan />} />
          <Route path="/movement" element={<Movement />} />
          <Route path="/units" element={<UnitPage />} />
          <Route path="/stockin" element={<StockIn />} />
          <Route path="/stockout" element={<StockOut />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
