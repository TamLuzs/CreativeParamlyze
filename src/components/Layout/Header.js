import React from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
    borderBottom: location.pathname === path ? "2px solid #fff" : "none",
  });

  return (
    <header style={{ padding: "10px 20px", backgroundColor: "#1a73e8", color: "#fff" }}>
      <nav style={{ display: "flex", gap: "20px" }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/auditoria" style={linkStyle("/auditoria")}>Auditoria</Link>
        <Link to="/sobre" style={linkStyle("/sobre")}>Sobre</Link>
      </nav>
    </header>
  );
}

export default Header;
