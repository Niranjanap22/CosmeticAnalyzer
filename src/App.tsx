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
    <div className="min-h-screen bg-purple-50/30">
      <nav className="glass sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="purple-gradient p-2 rounded-xl shadow-lg shadow-purple-200">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 tracking-tight">
            CosmoBot
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-purple-900">{user.email?.split('@')[0]}</span>
              <span className="text-xs text-purple-500 uppercase font-bold tracking-widest">Premium Member</span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 p-1 bg-purple-100 rounded-full border border-purple-200">
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-500 hover:bg-purple-50/50'}`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setView('results')}
                disabled={!latestResult}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  view === 'results'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-purple-500 hover:bg-purple-50/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Results</span>
              </button>
              <button
                onClick={() => setView('history')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'history' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-500 hover:bg-purple-50/50'}`}
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">History</span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
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

      <footer className="mt-20 border-t border-purple-100 py-10 text-center">
        <p className="text-purple-400 text-sm">
          &copy; 2024 CosmoBot AI. Empowering consumers with radical transparency.
        </p>
      </footer>
    </div>
  );
};

export default App;
