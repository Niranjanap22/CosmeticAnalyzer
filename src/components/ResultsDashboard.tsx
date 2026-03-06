import React from 'react';
import { AnalysisResult } from '@/types/types';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import AnalysisResultView from './AnalysisResult';

interface ResultsDashboardProps {
  result: AnalysisResult | null;
  image: string | null;
  onBackToAnalyzer: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  image,
  onBackToAnalyzer
}) => {
  if (!result) {
    return (
      <div className="bg-white/65 backdrop-blur-2xl rounded-[2rem] border border-white/70 p-10 text-center shadow-[0_20px_50px_rgba(120,84,94,0.15)]">
        <h2 className="text-3xl text-[#2f262a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No Analysis Yet</h2>
        <p className="text-[#7a686f] mb-6">
          Run an image scan first to view your ingredient safety report.
        </p>
        <button
          onClick={onBackToAnalyzer}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-[0_10px_24px_rgba(233,108,147,0.35)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Analyzer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-[#fffaf8] via-[#fff4f6] to-[#fdf8f5] p-5 md:p-8 shadow-[0_20px_80px_rgba(120,84,94,0.14)]">
      <style>{`
        @keyframes revealUpSoft {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(230,182,196,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,182,196,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-rose-200/35 blur-3xl" />

      <div className="relative z-10 bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/70 shadow-[0_18px_40px_rgba(128,89,101,0.12)] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(128,89,101,0.20)] animate-[revealUpSoft_400ms_ease-out]">
        <div className="flex items-center gap-4">
          {image ? (
            <img
              src={image}
              alt="Analyzed product"
              className="w-16 h-16 rounded-xl object-cover border border-white/70 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/70 border border-white/70 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-rose-400" />
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] font-bold text-rose-500">Results Dashboard</p>
            <h2 className="text-2xl text-[#2f262a]" style={{ fontFamily: "'Playfair Display', serif" }}>{result.productName}</h2>
          </div>
        </div>
        <button
          onClick={onBackToAnalyzer}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 text-[#57444b] font-semibold hover:bg-white/70 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      <div className="relative z-10 animate-[revealUpSoft_520ms_ease-out]">
        <AnalysisResultView data={result} />
      </div>
    </div>
  );
};

export default ResultsDashboard;
