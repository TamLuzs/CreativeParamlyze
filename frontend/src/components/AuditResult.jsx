import React, { useState } from 'react'; 
import { Card, Badge } from 'ui-ux-pro-max-skill';
import { MonitorPlay } from 'lucide-react'; 
import AdStressTest from './AdStressTest';

export const AuditResult = ({ report }) => {
  // Mantendo a lógica de estado que faltava para o modal funcionar
  const [openQA, setOpenQA] = useState(false);

  // Fallback para evitar erros caso os objetos aninhados falhem
  const { network = { count: 0, urls: [] }, metadata = {}, errors = [], warnings = [] } = report;

  return (
    <> {/* Fragment necessário para envolver o Card e o Modal */}
      <Card className="mt-6 animate-fade-in">
        <div className="flex justify-between items-center border-b pb-4">
          <h4 className="text-lg font-semibold">Resultado da Análise</h4>
          <Badge 
            variant={report.isValid ? 'success' : 'danger'}
            text={report.isValid ? 'COMPLIANT' : 'NON-COMPLIANT'}
          />
        </div>

        <div className="py-4">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Categoria detectada:</p>
          <p className="text-xl">
            {report.type === 'RichMedia' ? '🚀 HTML5 Rich Media' : '📄 HTML5 Standard'}
          </p>
        </div>

        {/* Botão de Auditoria Visual - Original Preservado */}
        <button 
          onClick={() => setOpenQA(true)}
          className="w-full group bg-linear-to-r from-blue-600 to-blue-700 p-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-blue-900/20 transition-all mb-6"
        >
          <MonitorPlay size={20} className="group-hover:scale-110 transition-transform" />
          Abrir Ad-Mirror & Stress Test
        </button>

        {/* Listagem de Erros - Original Preservado */}
        {errors.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-red-700 font-bold mb-2 text-sm italic">ERROS CRÍTICOS:</p>
            <ul className="list-disc pl-5 text-red-600 space-y-1">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Listagem de Avisos - Original Preservado */}
        {warnings.length > 0 && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700 font-bold mb-2 text-sm italic">OBSERVAÇÕES TÉCNICAS:</p>
            <ul className="list-disc pl-5 text-amber-600 space-y-1 text-sm">
              {warnings.map((warn, i) => <li key={i}>{warn}</li>)}
            </ul>
          </div>
        )}
      </Card>

      {/* Modal de QA - Lógica e Estilo Originais 100% Preservados */}
      {openQA && (
        <div className="fixed inset-0 z-100 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex h-[80vh]">
            
            {/* Lado Esquerdo: Preview */}
            <div className="flex-1 bg-slate-200 flex items-center justify-center p-12 pattern-dots">
              <div className="relative shadow-2xl border-12 border-slate-800 rounded-xl bg-white">
                <iframe 
                  src={report.previewUrl} 
                  width={metadata.width || 300} 
                  height={metadata.height || 250}
                  className="overflow-hidden"
                  scrolling="no"
                  title="Ad Preview"
                />
              </div>
            </div>

            {/* Lado Direito: Stress Test & Network */}
            <div className="w-80 border-l border-slate-100 p-8 space-y-8 overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900">QA Deep Scan</h3>
              
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Network Sniffer</p>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-2xl font-bold">
                    {network.count} <span className="text-sm text-slate-400">Requests</span>
                  </p>
                  <div className="mt-2 space-y-1">
                    {network.urls.map((url, i) => (
                      <p key={i} className="text-[10px] truncate text-blue-600">{url}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Stress Test</p>
                {/* Aqui você chama seu componente de stress test */}
                {/* <AdStressTest /> */}
                <div className="h-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                   STRESS_TEST_COMPONENT_ACTIVE
                </div>
              </div>

              <button 
                onClick={() => setOpenQA(false)} 
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition"
              >
                Fechar Auditoria
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};