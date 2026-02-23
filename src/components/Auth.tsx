import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        await auth.createUserWithEmailAndPassword(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-purple-900 mb-4 leading-tight">
          Know exactly what goes on <br />
          <span className="text-purple-600">your skin.</span>
        </h1>
        <p className="text-purple-500 text-lg max-w-lg">
          Join 50,000+ users who analyze their skincare routine for safety and transparency.
        </p>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl shadow-purple-100 border border-purple-50">
        <div className="flex gap-4 mb-8 bg-purple-50 p-1 rounded-2xl">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-400'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-purple-300 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-purple-300 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs mt-2 px-2">{error}</p>}

          <button
            type="submit"
            className="w-full purple-gradient text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 justify-center text-xs text-purple-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Your data is protected by industry standard encryption</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;

