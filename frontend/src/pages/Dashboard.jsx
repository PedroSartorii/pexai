import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// O Dashboard agora só redireciona para a página principal
export default function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/processos"); }, []);
  return null;
}