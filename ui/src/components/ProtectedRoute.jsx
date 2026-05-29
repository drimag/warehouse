import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ permittedRoles }) => {
  const { user, loading } = useAuth();

  // 1. If we are still figuring out if the user is logged in, show a spinner
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>Loading layout secure configurations...</h3>
      </div>
    );
  }

  // 2. Not logged in? Send them directly to the Login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Logged in, but lacks the necessary role permissions? Send to Unauthorized
  if (permittedRoles && !permittedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Everything matches perfectly! Render the nested views
  return <Outlet />;
};