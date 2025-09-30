import React from "react";
import { Link } from "react-router-dom";
import PageTitle from "../components/Layout/PageTitlle";

function Home() {
  return (
    <>
      <PageTitle>Auditor de Criativos</PageTitle>
      <p>Faça upload de vídeo, GIF ou áudio para auditoria.</p>
      <Link to="/auditoria" className="btn-primary">
        Ir para auditoria
      </Link>
    </>
  );
}

export default Home;
