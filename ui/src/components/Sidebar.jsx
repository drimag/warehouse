import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Database, 
  Truck, 
  ScanLine, 
  FilePlus, 
  PlusSquare, 
  UploadCloud 
} from "lucide-react"; // Example using Lucide icons

const Sidebar = () => {
  const getNavClass = ({ isActive }) => {
    const baseClasses = "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 group";
    const activeClasses = "bg-blue-600 text-white shadow-lg shadow-blue-200";
    const inactiveClasses = "text-gray-400 hover:bg-gray-100 hover:text-gray-600";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <aside className="sidebar">
      
      {/* Units */}
      <NavLink to="/units" className={getNavClass} title="Units Inventory">
        <Database size={24} />
      </NavLink>

      {/* Waybills */}
      <NavLink to="/waybills" className={getNavClass} title="Waybills List">
        <Truck size={24} />
      </NavLink>

      {/* Scan */}
      <NavLink to="/scan" className={getNavClass} title="Scan Barcode">
        <ScanLine size={24} />
      </NavLink>

      {/* Waybill Form */}
      <NavLink to="/waybill_form" className={getNavClass} title="Create Waybill">
        <FilePlus size={24} />
      </NavLink>

      {/* Unit Form */}
      <NavLink to="/unit_form" className={getNavClass} title="Add Single Unit">
        <PlusSquare size={24} />
      </NavLink>

      {/* Bulk Upload */}
      <NavLink to="/bulk_upload" className={getNavClass} title="Bulk Upload">
        <UploadCloud size={24} />
      </NavLink>

    </aside>
  );
};

export default Sidebar;