import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Employees from "./components/Employees/Employees"
import Dashboard from "./components/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminDashboard from './components/Admin_dashboard/Admin_dashboard';
import AdminVehiculos from './components/Admin_vehiculos/Admin_vehiculos';
import AdminAnaliticas from './components/Admin_analiticas/Admin_analiticas';
import GasStationHotspots from './components/Admin/GasStationHotspots';
import Home from "./components/Home/Home";
import AdminSidebar from './components/Admin_sidebar/Admin_sidebar';
import Tickets from './components/Tickets/Tickets';
import Analiticas from './components/Analiticas/Analiticas';
import Metricas from './components/Metricas/Metricas';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Employees" element={
                <ProtectedRoute allowedRoles={['administrador']}>
                    <div style={{ display: "flex", minHeight: "100vh" }}>
                        <AdminSidebar />
                        <div style={{ flex: 1, padding: "1rem" }}>
                            <Employees />
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
                path="/admin-analytics"
                element={
                    <ProtectedRoute allowedRoles={['administrador']}>
                        <div style={{ display: "flex", minHeight: "100vh" }}>
                            <AdminSidebar />
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <AdminAnaliticas />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin-tickets"
                element={
                    <ProtectedRoute allowedRoles={['administrador']}>
                        <div style={{ display: "flex", minHeight: "100vh" }}>
                            <AdminSidebar />
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <Tickets />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin-metricas"
                element={
                    <ProtectedRoute allowedRoles={['administrador']}>
                        <div style={{ display: "flex", minHeight: "100vh" }}>
                            <AdminSidebar />
                            <div style={{ flex: 1, padding: "1rem" }}>
                                <Metricas />
                            </div>
                        </div>
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

