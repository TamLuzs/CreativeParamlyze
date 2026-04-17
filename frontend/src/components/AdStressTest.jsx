import React, { useEffect, useState } from 'react';

export const AdStressTest = ({ iframeRef }) => {
  const [metrics, setMetrics] = useState({ loadTime: 0, memory: 0 });

  useEffect(() => {
    const checkPerformance = () => {
      if (window.performance) {
        // Tempo de carregamento do frame
        const [entry] = performance.getEntriesByType("navigation");
        
        // Uso de memória (apenas Chrome/Edge)
        const memory = performance.memory ? 
          (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) : "N/A";

        setMetrics({
          loadTime: entry ? entry.duration.toFixed(2) : "Calculando...",
          memory: memory
        });
      }
    };

    const timer = setTimeout(checkPerformance, 2000); // Aguarda 2s após o load
    return () => clearTimeout(timer);
  }, [iframeRef]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900 rounded-2xl border border-white/10">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold">Initial Load Time</p>
        <p className={`text-lg font-mono ${metrics.loadTime > 1100 ? 'text-red-400' : 'text-emerald-400'}`}>
          {metrics.loadTime}ms
        </p>
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold">JS Memory Heap</p>
        <p className="text-lg font-mono text-blue-400">{metrics.memory} MB</p>
      </div>
    </div>
  );
};