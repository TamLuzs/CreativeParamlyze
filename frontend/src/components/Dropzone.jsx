import React from 'react';
import { Upload, FileCode, Loader2 } from 'lucide-react';

export const Dropzone = ({ onFileSelect, isLoading }) => {
  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-2xl p-12
        transition-all duration-200 flex flex-col items-center justify-center
        ${isLoading ? 'border-blue-200 bg-slate-50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'}
      `}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => onFileSelect(e.target.files[0])}
        disabled={isLoading}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="font-medium text-blue-600">Analisando bytes e metadados...</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Upload size={32} />
          </div>
          <p className="text-xl font-semibold text-slate-700">Arraste seu asset aqui</p>
          <p className="text-slate-400 mt-2 text-sm">Suporta ZIP (HTML5), MP4, JPG, PNG, GIF e Fontes</p>
        </>
      )}
    </div>
  );
};