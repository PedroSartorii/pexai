import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import ProcessDashboard from "./pages/ProcessDashboard"; // novo
import ClientRegister from "./pages/ClientRegister";
import QualificationRegister from "./pages/QualificationRegister";
import ProcessTitleRegister from "./pages/ProcessTitleRegister";
import JuizoRegister from "./pages/JuizoRegister";
import AcaoRegister from "./pages/AcaoRegister";
import ProcessoRegister from "./pages/ProcessoRegister";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/processos" element={<PrivateRoute><ProcessoRegister /></PrivateRoute>} />
        <Route path="/clients/new" element={<PrivateRoute><ClientRegister /></PrivateRoute>} />
        <Route path="/qualifications" element={<PrivateRoute><QualificationRegister /></PrivateRoute>} />
        <Route path="/process-titles" element={<PrivateRoute><ProcessTitleRegister /></PrivateRoute>} />
        <Route path="/juizos" element={<PrivateRoute><JuizoRegister /></PrivateRoute>} />
        <Route path="/acoes" element={<PrivateRoute><AcaoRegister /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;