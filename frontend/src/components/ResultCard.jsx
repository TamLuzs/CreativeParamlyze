import React from 'react';
import { CheckCircle2, AlertCircle, Info, FileText } from 'lucide-react';

export const ResultCard = ({ report }) => {
  const isPass = report.isValid;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
      {/* Header do Relatório */}
      <div className={`p-6 flex justify-between items-center ${isPass ? 'bg-emerald-50' : 'bg-red-50'}`}>
        <div className="flex items-center gap-3">
          {isPass ? 
            <CheckCircle2 className="text-emerald-600" /> : 
            <AlertCircle className="text-red-600" />
          }
          <span className={`font-bold uppercase tracking-wider ${isPass ? 'text-emerald-700' : 'text-red-700'}`}>
            {isPass ? 'Aprovado para Veiculação' : 'Falha na Auditoria'}
          </span>
        </div>
        <span className="text-slate-500 text-sm font-mono">{report.fileSize}</span>
      </div>

      <div className="p-8 space-y-6">
        {/* Detalhes do Arquivo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Arquivo</p>
            <p className="text-slate-700 font-medium truncate">{report.fileName}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Categoria</p>
            <p className="text-slate-700 font-medium">{report.category || 'Asset Estático'}</p>
          </div>
        </div>

{report.metadata && Object.keys(report.metadata).length > 0 && (
  <div className="mt-4 p-4 bg-slate-900 text-slate-300 rounded-xl font-mono text-xs grid grid-cols-2 gap-2">
    {Object.entries(report.metadata).map(([key, value]) => (
      <div key={key}>
        <span className="text-blue-400 capitalize">{key}:</span> {value}
      </div>
    ))}
  </div>
)}

        {/* Erros Críticos */}
        {report.errors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-red-600 font-bold text-sm flex items-center gap-2">
              <AlertCircle size={16} /> ERROS CRÍTICOS ({report.errors.length})
            </h4>
            {report.errors.map((err, i) => (
              <div key={i} className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-red-800 text-sm">
                {err}
              </div>
            ))}
          </div>
        )}

        {/* Recomendações/Avisos */}
        {report.warnings.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-amber-600 font-bold text-sm flex items-center gap-2">
              <Info size={16} /> RECOMENDAÇÕES TÉCNICAS
            </h4>
            {report.warnings.map((warn, i) => (
              <div key={i} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-amber-800 text-sm">
                {warn}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};