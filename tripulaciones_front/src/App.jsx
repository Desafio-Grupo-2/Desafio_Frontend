import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from './components/Admin_dashboard/Admin_dashboard';
import AdminVehiculos from './components/Admin_vehiculos/Admin_vehiculos';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path='/adminVehiculos' element={<AdminVehiculos />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
