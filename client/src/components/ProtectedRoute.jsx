import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps a page. Not logged in -> go to login. Wrong role -> friendly message.
// (The REAL protection is on the server; this only keeps people out of pages that would not work for them.)
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex-grow flex items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="empty-state max-w-md">
          <span className="material-symbols-outlined text-5xl text-orange-500">lock</span>
          <h2 className="text-xl font-extrabold text-gray-900 mt-2">Not available for your account</h2>
          <p className="mt-2">This page is only for <b>{roles.join(" / ")}</b> accounts. You are logged in as <b>{user.role}</b>.</p>
        </div>
      </div>
    );
  }
  return children;
}

export function Spinner() {
  return <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />;
}
