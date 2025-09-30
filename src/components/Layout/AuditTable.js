import React from "react";
import { getPlatformLink } from "../../utils/getPlataformLink";

function AuditTable({ items }) {
  return (
    <div className="audit-table-container">
      <table className="audit-table">
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Tipo</th>
            <th>Plataforma</th>
            <th>Resultado</th>
            <th>Erros</th>
            <th>Referência</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => {
            const hasErrors = it.validationErrors?.length > 0;
            const result = hasErrors ? "Reprovado ❌" : "Aprovado ✅";
            const rowClass = hasErrors ? "error-row" : "success-row";
            return (
              <tr key={idx} className={rowClass}>
                <td>{it.meta?.name || "—"}</td>
                <td>{it.type}</td>
                <td>{it.platform.toUpperCase()}</td>
                <td>{result}</td>
                <td>
                  {hasErrors ? (
                    <ul>
                      {it.validationErrors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <a
                    href={getPlatformLink(it.platform)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 Guia
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AuditTable;
