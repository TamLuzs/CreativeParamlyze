import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropzone } from '../components/Dropzone';
import { ResultCard } from '../components/ResultCard';
import { auditService } from '../services/api';
import { ShieldCheck, Info } from 'lucide-react';

export const AboutPage = () => {
   return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      
      {/* Header Contextual - Mantendo a autoridade do projeto */}
      <header className="text-center space-y-4">
               
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Sobre AuditorPro
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Auditor/Scanner para equipe operacionais que trabalham com alto volume de validação de requisitos tecnicos relácionados a normas e padrões de Ad.
          </p>
        </div>
      </header>

     
    </div>
  );
};