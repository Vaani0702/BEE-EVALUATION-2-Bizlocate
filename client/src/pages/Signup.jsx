import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "business" });
  const [busy, setBusy] = useState(false);

  // One handler for all text inputs: it uses the input's "name" to know which field changed.
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await signup(form.name.trim(), form.email.trim(), form.password, form.role);
      showToast("Account created!", "success");
      navigate(user.role === "owner" ? "/owner-form" : "/business-form", { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-shadow";

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4">
      <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join BizLocate in seconds</p>
          <div className="flex items-center justify-center space-x-4 border-b border-gray-200 mt-6 mb-2">
            <Link className="pb-2 px-4 text-gray-500 hover:text-blue-700 font-semibold transition-colors" to="/login">Login</Link>
            <span className="pb-2 px-4 text-blue-700 border-b-2 border-blue-700 font-bold">Signup</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 font-semibold" htmlFor="signup-name">Full Name</label>
            <input id="signup-name" name="name" type="text" required value={form.name} onChange={change} placeholder="John Doe" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 font-semibold" htmlFor="signup-email">Email Address</label>
            <input id="signup-email" name="email" type="email" required value={form.email} onChange={change} placeholder="Enter your email" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 font-semibold" htmlFor="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" required minLength={6} value={form.password} onChange={change} placeholder="At least 6 characters" className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 mb-2 font-semibold">Role</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input className="peer sr-only" name="role" type="radio" value="business" checked={form.role === "business"} onChange={change} />
                <div className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-semibold transition-all hover:-translate-y-0.5">
                  <span className="text-sm">Business</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input className="peer sr-only" name="role" type="radio" value="owner" checked={form.role === "owner"} onChange={change} />
                <div className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-600 font-semibold transition-all hover:-translate-y-0.5">
                  <span className="text-sm">Owner</span>
                </div>
              </label>
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-orange w-full !py-3">{busy ? "Creating..." : "Create Account"}</button>
          <p className="text-center text-sm text-gray-500">Already have an account? <Link className="text-blue-700 font-bold hover:underline" to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
