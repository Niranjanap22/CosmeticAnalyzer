import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '@/lib/firebase';
import AuthScreen from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import HistoryView from '@/components/HistoryView';
import ResultsDashboard from '@/components/ResultsDashboard';
import { AnalysisResult } from '@/types/types';
import { Sparkles, LogOut, History, Home, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'results' | 'history'>('dashboard');
  const [latestResult, setLatestResult] = useState<AnalysisResult | null>(null);
  const [latestImage, setLatestImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setView('dashboard'); // Reset to dashboard on auth change
      if (!currentUser) {
        setLatestResult(null);
        setLatestImage(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleAnalysisComplete = (result: AnalysisResult, image: string) => {
    setLatestResult(result);
    setLatestImage(image);
    setView('results');
  };

  const handleNewAnalysis = () => {
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f3f6] p-3 md:p-5">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fdf9fa] via-[#fcf6f8] to-[#f9f2f4]">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(229,186,198,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(229,186,198,0.22)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(73,49,57,0.08)]" />

      <nav className="relative z-40 px-4 md:px-7 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer min-w-[190px]">
          <div className="rounded-xl bg-white/70 border border-white/80 px-3 py-2 shadow-sm backdrop-blur-xl">
            <Sparkles className="text-rose-500 w-5 h-5" />
          </div>
          <span className="text-4xl tracking-tight text-[#21171b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            COSMOBOT
          </span>
        </div>

        {user && (
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="hidden lg:block min-w-[170px]" />

            <div className="flex items-center gap-2 p-1 bg-white/75 rounded-full border border-white/80 backdrop-blur-xl shadow-sm">
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-2 px-7 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  view === 'dashboard'
                    ? 'bg-white text-[#2b1f24] shadow-sm'
                    : 'text-[#6d5f65] hover:bg-white/70 hover:-translate-y-0.5'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setView('results')}
                disabled={!latestResult}
                className={`flex items-center gap-2 px-7 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  view === 'results'
                    ? 'bg-white text-[#2b1f24] shadow-sm'
                    : 'text-[#6d5f65] hover:bg-white/70 hover:-translate-y-0.5'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Results</span>
              </button>
              <button
                onClick={() => setView('history')}
                className={`flex items-center gap-2 px-7 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  view === 'history'
                    ? 'bg-white text-[#2b1f24] shadow-sm'
                    : 'text-[#6d5f65] hover:bg-white/70 hover:-translate-y-0.5'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </div>

            <div className="flex items-center gap-3 min-w-[220px] justify-end">
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8e7f86]">Partner Portal</span>
                <span className="text-xs text-[#786a71] font-medium">
                  {user.email?.split('@')[0]} • Premium Member
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/80 bg-white/70 backdrop-blur-xl text-[#4f3f46] hover:bg-white transition-all duration-300 hover:-translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-8">
        {view === 'dashboard' ? (
          <Dashboard onAnalysisComplete={handleAnalysisComplete} />
        ) : view === 'results' ? (
          <ResultsDashboard
            result={latestResult}
            image={latestImage}
            onBackToAnalyzer={handleNewAnalysis}
          />
        ) : (
          <HistoryView />
        )}
      </main>

      <footer className="relative z-10 mt-10 border-t border-rose-100/70 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[#9b8b92] text-xs tracking-[0.22em] uppercase">
            © 2024 Cosmobot Biotech • Luxury Analytics
          </p>
          <div className="flex items-center gap-10 text-xs tracking-[0.2em] uppercase text-[#9b8b92]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Lab Access</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
