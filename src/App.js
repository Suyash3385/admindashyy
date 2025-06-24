import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import ChartViewer from "./pages/ChartViewer";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/chart" element={<ChartViewer />} />
    </Routes>
  );
};

export default App;
