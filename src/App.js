import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Auditoria from "./pages/Auditoria";
import Sobre from "./pages/Sobre";
import Layout from "./components/Layout/Layout";

function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    let title = "Auditoria de Mídia";
    if (location.pathname === "/") title = "Home - Auditoria de Mídia";
    else if (location.pathname === "/auditoria") title = "Auditoria - Auditoria de Mídia";
    else if (location.pathname === "/sobre") title = "Sobre - Auditoria de Mídia";
    else title = "404 - Página não encontrada";
    document.title = title;
  }, [location]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <PageTitleManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="*" element={<div style={{ padding: "20px" }}>404 - Página não encontrada</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<div>Carregando...</div>}>
          <AppRoutes />
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
