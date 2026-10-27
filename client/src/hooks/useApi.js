import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

// Custom hook: loads data from the backend and tells the page if it is loading or failed.
// Usage:  const { data, loading, error, reload } = useApi("/api/properties");
// Pass null as the path to skip loading (for example while the user is not known yet).
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: !!path, error: "" });

  const load = useCallback(async () => {
    if (!path) { setState({ data: null, loading: false, error: "" }); return; }
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await api.get(path);
      setState({ data, loading: false, error: "" });
    } catch (err) {
      setState({ data: null, loading: false, error: err.message });
    }
  }, [path]);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}
