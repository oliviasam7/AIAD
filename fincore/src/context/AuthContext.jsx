import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("fc_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch("http://localhost:4000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { logout(); }
        else setUser(data);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token]);

  function login(tok, userData) {
    localStorage.setItem("fc_token", tok);
    setToken(tok);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("fc_token");
    setToken(null);
    setUser(null);
  }

  function updateUser(fields) {
    setUser((prev) => ({ ...prev, ...fields }));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}