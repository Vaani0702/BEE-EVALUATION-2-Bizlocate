import { createContext, useContext, useEffect, useState } from "react";
import { api, getSavedUser, saveUser } from "../api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser());   // shown instantly from localStorage "currentUser"
  const [loading, setLoading] = useState(!!getSavedUser()); // true while the server checks the cookie

  // On first load: if we have a saved user, ask the server "is your cookie still valid?" (GET /api/auth/me)
  useEffect(() => {
    if (!getSavedUser()) return;
    api.get("/api/auth/me")
      .then((data) => { setUser(data.user); saveUser(data.user); })
      .catch(() => { saveUser(null); setUser(null); }) // cookie expired or missing -> forget the user
      .finally(() => setLoading(false));
  }, []);

  // The server sets the cookie in its reply. We only keep the user info.
  async function login(email, password) {
    const data = await api.post("/api/auth/login", { email, password });
    saveUser(data.user);
    setUser(data.user);
    return data.user;
  }

  async function signup(name, email, password, role) {
    const data = await api.post("/api/auth/signup", { name, email, password, role });
    saveUser(data.user);
    setUser(data.user);
    return data.user;
  }

  // Logout: the server deletes the cookie, we clear currentUser.
  async function logout() {
    try { await api.post("/api/auth/logout"); } catch (err) { /* even if the server is down, clear locally */ }
    saveUser(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
