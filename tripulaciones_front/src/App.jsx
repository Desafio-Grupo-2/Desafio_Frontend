import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login"; 
import Employes from "./components/Employes/Employes"
import Dashboard from "./components/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminDashboard from './components/Admin_dashboard/Admin_dashboard';
import AdminVehiculos from './components/Admin_vehiculos/Admin_vehiculos';
import GasStationHotspots from './components/Admin/GasStationHotspots';
import Home from "./components/Home/Home";

export default function App() {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Employes"  element={
                <ProtectedRoute allowedRoles={['administrador']}>
                    <Employes />
                </ProtectedRoute>
            } />
        <Route 
            path="/dashboard" 
            element={
                <ProtectedRoute allowedRoles={['conductor']}>
                    <Home />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/admin-dashboard" 
            element={
                <ProtectedRoute allowedRoles={['administrador']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/admin-vehiculos" 
            element={
                <ProtectedRoute allowedRoles={['administrador']}>
                    <AdminVehiculos />
                </ProtectedRoute>
            } 
        />
        <Route 
            path="/admin-hotspots" 
            element={
                <ProtectedRoute allowedRoles={['administrador']}>
                    <GasStationHotspots />
                </ProtectedRoute>
            } 
        />
    </Routes>
  );
}

