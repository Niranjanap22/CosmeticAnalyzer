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
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (selectedScan) {
    return (
      <div className="animate-in fade-in">
        <button
          onClick={() => setSelectedScan(null)}
          className="flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>
        <AnalysisResultView data={selectedScan} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-bold text-purple-900 flex items-center gap-3">
        <History className="w-8 h-8 text-purple-600" />
        Your Scan History
      </h2>

      {history.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-purple-100 rounded-3xl">
          <FileText className="w-16 h-16 text-purple-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-purple-300">No Scans Yet</h3>
          <p className="text-purple-300 max-w-sm mt-2 mx-auto">
            Your analyzed products will appear here. Start by scanning a new product!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-lg shadow-purple-50 border border-purple-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg text-purple-900">{item.productName}</p>
                    <p className="text-sm text-purple-500">{item.brand}</p>
                  </div>
                  <span className={`font-bold text-lg ${item.overallSafetyScore > 70 ? 'text-green-500' : item.overallSafetyScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                    {item.overallSafetyScore}
                  </span>
                </div>
                <p className="text-xs text-purple-400">
                  Scanned on: {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedScan(item.analysisData)}
                className="mt-6 w-full bg-purple-100 text-purple-700 py-2 rounded-lg font-bold hover:bg-purple-200 transition"
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