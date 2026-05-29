import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate("/units"); // Redirect to dashboard landing page on success
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Logistics Portal Login</h2>
      {error && <div style={{ color: "red", marginBottom: "15px", fontWeight: "bold" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {isSubmitting ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};