import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login"; 
import Employes from "./components/Employes/Employes"

export default function App() {
  return (
    <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/Employes" element={<Employes />} />
        <Route path="/" element={<Employes />} />
    </Routes>
  )

}

