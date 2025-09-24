import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import DriverDashboard from "./components/DriverDashboard/DriverDashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminDashboard from './components/Admin_dashboard/Admin_dashboard';
import AdminVehiculos from './components/Admin_vehiculos/Admin_vehiculos';

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
        <Route 
            path="/admin-dashboard" 
            element={
                <ProtectedRoute>
                    <AdminDashboard />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/admin-vehiculos" 
            element={
                <ProtectedRoute>
                    <AdminVehiculos />
                </ProtectedRoute>
            } 
        />
    </Routes>
  );
}

