import React from "react";

function Footer() {
  return (
    <footer style={{ padding: "20px", textAlign: "center", backgroundColor: "#f1f1f1", marginTop: "40px" }}>
      <small>&copy; {new Date().getFullYear()} Auditor de Criativos</small>
    </footer>
  );
}

export default Footer;
