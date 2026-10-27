import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`, "success");
      // where to go next: the page they were trying to open, or a page that fits their role
      const home = user.role === "admin" ? "/admin" : user.role === "owner" ? "/profile" : "/listings";
      navigate(location.state?.from || home, { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4">
      <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue to BizLocate</p>
          <div className="flex items-center justify-center space-x-4 border-b border-gray-200 mt-6 mb-2">
            <span className="pb-2 px-4 text-blue-700 border-b-2 border-blue-700 font-bold">Login</span>
            <Link className="pb-2 px-4 text-gray-500 hover:text-blue-700 font-semibold transition-colors" to="/signup">Signup</Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 font-semibold" htmlFor="login-email">Email Address</label>
            <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-shadow" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 font-semibold" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-shadow" />
          </div>
          <button type="submit" disabled={busy} className="btn-orange w-full !py-3">{busy ? "Signing in..." : "Sign In"}</button>
          <p className="text-center text-sm text-gray-500">Don't have an account? <Link className="text-blue-700 font-bold hover:underline" to="/signup">Signup</Link></p>
        </form>
      </div>
    </div>
  );
}
