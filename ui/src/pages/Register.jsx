import React, { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    employeeId: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanFullName = formData.fullName?.trim();
    const cleanEmail = formData.email?.trim().toLowerCase();
    const cleanEmployeeId = formData.employeeId?.trim().toUpperCase();
    const cleanPassword = formData.password;
    const cleanConfirmPassword = formData.confirmPassword;

    if (
      !cleanFullName ||
      !cleanEmail ||
      !cleanEmployeeId ||
      !cleanPassword ||
      !cleanConfirmPassword
    ) {
      setError("All fields are strictly required");
      return;
    }

    if (cleanFullName.length < 2 || cleanFullName.length > 70) {
      setError("Full name must be between 2 and 70 characters.");
      return;
    }

    if (cleanPassword.length < 8 || cleanPassword.length > 64) {
      setError("Password length must be between 8 and 64 characters.");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError("Password verification failed. Secret inputs do not match.");
      return;
    }

    // 6. Security Heuristics (Basic Password Complexity)
    const hasNumber = /\d/.test(cleanPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(cleanPassword);
    if (!hasNumber || !hasSpecial) {
      setError(
        "Password must contain at least one numerical digit and one special character.",
      );
      return;
    }

    try {
      setLoading(true);

      // Example Endpoint Integration
      // const { data, error } = await supabase.auth.signUp({ ... })

      console.log("Submitting Registration Data:", formData);

      // Simulate API lag
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Registration submitted successfully!");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased">
      {/* LEFT COLUMN: FORM INTERFACE */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-slate-900 hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ERROR ALERT MODULE */}
              {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-xs text-rose-700 font-medium animate-fadeIn">
                  ⚠️ {error}
                </div>
              )}

              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold uppercase text-slate-500 tracking-wide"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm transition-all"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase text-slate-500 tracking-wide"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm transition-all"
                    placeholder="operator@company.com"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase text-slate-500 tracking-wide"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold uppercase text-slate-500 tracking-wide"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* TERMS CHECKBOX
              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded accent-slate-900"
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-xs text-slate-600 select-none">
                  I agree to the system logging rules and compliance privacy parameters.
                </label>
              </div> */}

              {/* SUBMIT BUTTON */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering Node..." : "Register System Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
