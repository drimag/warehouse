import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Inventory from "./pages/Inventory";
import Scan from "./pages/Scan";
import Movement from "./pages/Movement";
import Sidebar from "./components/Sidebar";
import "./styles/layout.css";

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
        </Routes>
      </div>
    </div>
  );
}

export default App;
