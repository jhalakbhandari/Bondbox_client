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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/auth" />}
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
