import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import ProcessDashboard from "./pages/ProcessDashboard";
import ClientRegister from "./pages/ClientRegister";
import QualificationRegister from "./pages/QualificationRegister";
import ProcessTitleRegister from "./pages/ProcessTitleRegister";
import JuizoRegister from "./pages/JuizoRegister";
import AcaoRegister from "./pages/AcaoRegister";
import ProcessoRegister from "./pages/ProcessoRegister";
import Kanban from "./pages/Kanban";
import DashboardFinanceiro from "./pages/DashboardFinanceiro";
import LancamentoRegister from "./pages/LancamentoRegister";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";

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
        <Route path="/kanban" element={<PrivateRoute><Kanban /></PrivateRoute>} />
        <Route path="/financeiro" element={<PrivateRoute><DashboardFinanceiro /></PrivateRoute>} />
        <Route path="/lancamentos" element={<PrivateRoute><LancamentoRegister /></PrivateRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;