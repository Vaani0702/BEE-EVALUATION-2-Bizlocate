// ONE place that talks to the Express backend.
// Every page calls api.get / api.post / ... instead of writing fetch() again and again.
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// The JWT lives in an httpOnly COOKIE that the server sets at login. JavaScript cannot read it
// and does not need to: the browser sends it automatically because of credentials: "include".
// In localStorage we only keep "currentUser" (name, email, role) to show user info quickly.
const USER_KEY = "currentUser";
export const getSavedUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
export const saveUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

async function request(method, path, body) {
  const headers = {};

  let payload;
  if (body instanceof FormData) {
    payload = body; // files: do NOT set Content-Type, the browser adds "multipart/form-data; boundary=..."
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body); // object -> JSON string
  }

  let res;
  try {
    res = await fetch(API + path, { method, headers, body: payload, credentials: "include" }); // include = send the cookie
  } catch (err) {
    throw new Error("Cannot reach the server. Is the backend running on " + API + " ?");
  }

  const data = await res.json().catch(() => ({})); // JSON string -> object
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  del: (path) => request("DELETE", path),

  // The ownership PDF is private. We fetch it (the cookie goes along),
  // turn the reply into a blob and open that in a new tab.
  async openDocument(propertyId) {
    const win = window.open("", "_blank"); // open the tab first so popup blockers allow it
    try {
      const res = await fetch(API + "/api/properties/" + propertyId + "/document", {
        credentials: "include"
      });
      if (!res.ok) throw new Error((await res.json()).message || "Could not open document");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (win) win.location.href = url;
      else window.location.href = url;
    } catch (err) {
      if (win) win.close();
      throw err;
    }
  }
};
