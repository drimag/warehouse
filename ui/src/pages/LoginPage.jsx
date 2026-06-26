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
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased">
      {/* LEFT COLUMN: LOGIN INTERFACE */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              New user?{" "}
              <a
                href="/register"
                className="font-medium text-slate-900 hover:underline"
              >
                Create a new account
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

              {/* EMAIL ADDRESS */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase text-slate-500 tracking-wide"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm transition-all"
                    placeholder="operator@company.com"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase text-slate-500 tracking-wide"
                  >
                    Password
                  </label>
                  <div className="text-xs">
                    <a
                      href="/forgot-password"
                      className="font-medium text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* REMEMBER ME COOKIE CHECKBOX (Optional addition for classic UX)
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded accent-slate-900"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-xs text-slate-600 select-none"
                >
                  Keep me logged in on this hardware gun terminal
                </label>
              </div> */}

              {/* SUBMIT BUTTON */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Authenticating..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

     
    </div>
  );
};
