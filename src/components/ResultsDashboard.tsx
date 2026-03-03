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
      <div className="bg-white rounded-3xl border border-purple-100 p-10 text-center">
        <h2 className="text-2xl font-bold text-purple-900 mb-2">No Analysis Yet</h2>
        <p className="text-purple-500 mb-6">
          Run an image scan first to view your ingredient safety report.
        </p>
        <button
          onClick={onBackToAnalyzer}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Analyzer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {image ? (
            <img
              src={image}
              alt="Analyzed product"
              className="w-16 h-16 rounded-xl object-cover border border-purple-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-purple-400" />
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-purple-500">Results Dashboard</p>
            <h2 className="text-lg font-bold text-purple-900">{result.productName}</h2>
          </div>
        </div>
        <button
          onClick={onBackToAnalyzer}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      <AnalysisResultView data={result} />
    </div>
  );
};

export default ResultsDashboard;
