import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { getUserHistory } from '@/services/historyService';
import { ScanHistoryItem, AnalysisResult } from '@/types/types';
import AnalysisResultView from './AnalysisResult';
import { History, ArrowLeft, FileText, Loader2 } from 'lucide-react';

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (auth.currentUser) {
        const userHistory = await getUserHistory(auth.currentUser.uid);
        setHistory(userHistory);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (selectedScan) {
    return (
      <div className="animate-in fade-in">
        <button
          onClick={() => setSelectedScan(null)}
          className="flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-rose-200 bg-white/50 backdrop-blur-xl text-[#56434a] hover:bg-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>
        <AnalysisResultView data={selectedScan} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-[#fffaf8] via-[#fff4f6] to-[#fdf8f5] p-6 md:p-8 shadow-[0_20px_80px_rgba(120,84,94,0.14)]">
      <style>{`
        @keyframes revealLift {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(230,182,196,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,182,196,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-rose-200/35 blur-3xl" />

      <h2 className="relative z-10 text-4xl text-[#2f262a] flex items-center gap-3 animate-[revealLift_380ms_ease-out]" style={{ fontFamily: "'Playfair Display', serif" }}>
        <History className="w-8 h-8 text-rose-500" />
        Your Scan History
      </h2>

      {history.length === 0 ? (
        <div className="relative z-10 text-center p-12 border border-white/70 bg-white/55 backdrop-blur-2xl rounded-[2rem]">
          <FileText className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h3 className="text-3xl text-[#47353c]" style={{ fontFamily: "'Playfair Display', serif" }}>No Scans Yet</h3>
          <p className="text-[#8a747d] max-w-sm mt-2 mx-auto">
            Your analyzed products will appear here. Start by scanning a new product!
          </p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[revealLift_480ms_ease-out]">
          {history.map((item) => (
            <div key={item.id} className="bg-white/65 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_14px_30px_rgba(112,76,84,0.16)] border border-white/70 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(112,76,84,0.24)]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xl text-[#2f262a]" style={{ fontFamily: "'Playfair Display', serif" }}>{item.productName}</p>
                    <p className="text-sm text-[#8a747d]">{item.brand}</p>
                  </div>
                  <span className={`font-bold text-lg ${item.overallSafetyScore > 70 ? 'text-green-500' : item.overallSafetyScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                    {item.overallSafetyScore}
                  </span>
                </div>
                <p className="text-xs text-[#9b8790]">
                  Scanned on: {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedScan(item.analysisData)}
                className="mt-6 w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2.5 rounded-xl font-semibold shadow-[0_10px_24px_rgba(233,108,147,0.30)] hover:shadow-[0_14px_30px_rgba(233,108,147,0.42)] transition-all"
              >
                View Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
