import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropzone } from '../components/Dropzone';
import { ResultCard } from '../components/ResultCard';
import { auditService } from '../services/api';
import { ShieldCheck, Info } from 'lucide-react';

export const AuditPage = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleFileSelect = async (file) => {
    setLoading(true);
    // Removemos o relatório antigo para dar lugar ao novo scanner
    setReport(null); 

    try {
      // Aqui o serviço chama o backend que já configuramos com FFmpeg e Network Sniffer
      const data = await auditService.uploadAsset(file);
      setReport(data);
    } catch (error) {
      console.error("Erro na auditoria:", error);
      alert("Falha técnica ao processar o asset. Verifique se o servidor backend está online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      
      {/* Header Contextual - Mantendo a autoridade do projeto */}
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100"
        >
          <ShieldCheck size={12} /> IAB Tech Lab 2024-2026 Compliant
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Análise de Criativos
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Scanner de assets para <span className="text-slate-900 font-semibold">Ad Server e IAB.</span>
          </p>
        </div>
      </header>

      {/* Área de Upload - Mantendo a lógica de Dropzone anterior */}
      <section className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
        <Dropzone onFileSelect={handleFileSelect} isLoading={loading} />
      </section>

      {/* Renderização do Relatório com Animação de Entrada */}
      <AnimatePresence mode="wait">
        {report ? (
          <motion.div
            key={report.fileName} // Identificador único para reiniciar animação
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
          >
            <ResultCard report={report} />
          </motion.div>
        ) : !loading && (
          /* Dica amigável quando está vazio */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-slate-400 text-sm italic"
          >
            <Info size={14} /> Aguardando arquivo para iniciar auditoria técnica...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};