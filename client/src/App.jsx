import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { setAuthToken } from "@/lib/api";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";

const STORAGE_KEY = "mern_auth";

function App() {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { token: "", user: null };
    }

    try {
      const parsed = JSON.parse(raw);
      setAuthToken(parsed.token);
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return { token: "", user: null };
    }
  });

  const token = auth?.token || "";
  const user = auth?.user || null;

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const handleAuthSuccess = ({ token: nextToken, user: nextUser }) => {
    const nextAuth = { token: nextToken, user: nextUser };
    setAuth(nextAuth);
    setAuthToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
  };

  const handleLogout = () => {
    setAuth({ token: "", user: null });
    setAuthToken("");
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute token={token}>
            <DashboardPage onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;
