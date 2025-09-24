import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import DriverDashboard from "./components/DriverDashboard/DriverDashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

export default function App() {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route 
            path="/dashboard" 
            element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/driver" 
            element={
                <ProtectedRoute>
                    <DriverDashboard />
                </ProtectedRoute>
            } 
        />
    </Routes>
  );
}

