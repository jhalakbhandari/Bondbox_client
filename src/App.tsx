// import React from "react";
// import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Timeline from "./Pages/Timeline";
import Auth from "./Pages/Auth";
import { useEffect, useState } from "react";
// import App from "./App";
// import Home from "./src/pages/Home";
// import Timeline from "./pages/Timeline";

// App.tsx
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRoomId = localStorage.getItem("roomId");

    setIsAuthenticated(!!token);
    setRoomId(storedRoomId);
    setLoading(false);
  }, []);

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <Auth
              onAuth={(rId) => {
                setIsAuthenticated(true);
                setRoomId(rId);
              }}
            />
          }
        />
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/auth" />
            ) : roomId ? (
              <Navigate to={`/timeline/${roomId}`} />
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="/timeline/:roomId"
          element={isAuthenticated ? <Timeline /> : <Navigate to="/auth" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
