import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '@/lib/firebase';
import AuthScreen from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50/30">
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!user ? <AuthScreen /> : <Dashboard />}
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

