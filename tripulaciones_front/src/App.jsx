import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Employes from "./components/Employes/Employes"
import Dashboard from "./components/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminDashboard from './components/Admin_dashboard/Admin_dashboard';
import AdminVehiculos from './components/Admin_vehiculos/Admin_vehiculos';
import GasStationHotspots from './components/Admin/GasStationHotspots';
import Home from "./components/Home/Home";
import AdminSidebar from './components/Admin_sidebar/Admin_sidebar';
import Analiticas from './components/Analiticas/Analiticas';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Employes" element={
                <ProtectedRoute allowedRoles={['administrador']}>
                    <div style={{ display: "flex", minHeight: "100vh" }}>
                        <AdminSidebar />
                        <div style={{ flex: 1, padding: "1rem" }}>
                            <Employes />
                        </div>
                    </div>
                </ProtectedRoute>
            } />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute allowedRoles={['conductor']}>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin-dashboard" 
                element={
                    <ProtectedRoute allowedRoles={['administrador']}>
                        <div style={{ display: "flex", minHeight: "100vh" }}>
                            <AdminSidebar />
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <AdminDashboard />
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin-vehiculos" 
                element={
                    <ProtectedRoute allowedRoles={['administrador']}>
                        <div style={{ display: "flex", minHeight: "100vh" }}>
                            <AdminSidebar />
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <AdminVehiculos />
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />
            <Route
                path="/analiticas"
                element={
                    <ProtectedRoute allowedRoles={['administrador']}>
                        <div style={{ display: "flex", minHeight: "100vh" }}>
                            <AdminSidebar />
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <Analiticas />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route 
                path="/admin-hotspots" 
                element={
                    <ProtectedRoute allowedRoles={['administrador']}>
                        <div style={{ display: "flex", minHeight: "100vh" }}>
                            <AdminSidebar />
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <GasStationHotspots />
                            </div>
                        </div>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/home" 
                element={
                    <ProtectedRoute allowedRoles={['conductor']}>
                        <Home />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}

