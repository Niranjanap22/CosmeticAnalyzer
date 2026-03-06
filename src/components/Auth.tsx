import React, { useEffect, useState } from 'react';
import 'firebase/compat/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, LogIn, UserPlus, Sparkles, FlaskConical, Droplets, ShieldCheck } from 'lucide-react';

const AuthScreen: React.FC = () => {
  type SectionId = 'ingredients' | 'technology' | 'science' | 'about';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<SectionId>('ingredients');

  const sectionContent: Record<
    SectionId,
    { title: string; body: string; badge?: string; bullets?: string[] }
  > = {
    ingredients: {
      title: 'Ingredients',
      body:
        'We decode product labels into plain-language ingredient cards with purpose, hazard level, and quick Wikipedia links so users can understand what each ingredient does.',
      badge: 'Label Intelligence',
      bullets: [
        'Ingredient Parsing: Reads the ingredient panel from uploaded product images and structures it into clean ingredient entries.',
        'Hazard Grouping: Every ingredient is categorized as Low, Medium, or High to simplify decision-making at a glance.',
        'Contextual Purpose: Shows likely function (preservative, fragrance, surfactant, UV filter, etc.) beside each ingredient.',
        'Research Shortcut: Adds one-click Wikipedia lookup so users can quickly investigate unfamiliar ingredients.',
        'Practical Readability: Ingredients are displayed in grouped sections with concise descriptions, not long raw lists.'
      ]
    },
    technology: {
      title: 'Technology',
      body:
        'CosmoBot combines image processing, OCR-style label extraction, and AI interpretation to generate a complete safety report with confidence score and risk breakdown.',
      badge: 'AI + Deterministic Checks',
      bullets: [
        'Image Pipeline: Uploaded files are processed for readable quality before analysis begins.',
        'Model Output: The AI extracts brand, product name, ingredient list, toxic compounds, summary, and recommendation.',
        'Confidence Signal: Each scan includes trust percentage indicating how clearly the label could be read.',
        'Deterministic Scoring: Final safety score is computed from hazard-level counts using a fixed formula.',
        'Structured Experience: After analysis, users are redirected to a dedicated results dashboard for full review.',
        'Scan History: Results can be stored and revisited to compare products over time.'
      ]
    },
    science: {
      title: 'Science',
      body:
        'Our risk model checks ingredients against carcinogen, allergen, and endocrine-disruptor references, and maps findings to FDA banned lists plus EU banned/restricted standards.',
      badge: 'FDA + EU Standards',
      bullets: [
        'FDA Compliance Check: Flags ingredients that appear in FDA banned references used by this project.',
        'EU Compliance Check: Separately identifies EU banned and EU restricted ingredients with relevant limit notes.',
        'Carcinogen Screening: Detects ingredients mapped to known or suspected carcinogenic concern sets.',
        'Allergen/Irritant Screening: Highlights common sensitizers and irritation-prone compounds.',
        'Endocrine Screening: Identifies ingredients associated with hormonal disruption concern categories.',
        'Transparent Reasoning: High/Medium/Low group headers explain why that risk bucket is populated.'
      ]
    },
    about: {
      title: 'About',
      body:
        'CosmoBot is a transparent cosmetic intelligence platform built to turn cosmetic label photos into practical risk insights. It combines ingredient decoding, AI-assisted interpretation, and deterministic scoring so users can understand both what is in a product and how that translates into safety.',
      badge: 'Complete Platform Overview',
      bullets: [
        'Ingredients: Converts label text into readable ingredient cards with purpose, hazard levels, and education links.',
        'Technology: Uses image processing and AI extraction to identify product name, brand, ingredients, toxic compounds, and confidence in reading quality.',
        'Science: Flags carcinogens, allergens, and endocrine disruptors using FDA banned references plus EU banned/restricted standards.',
        'Compliance Layer: Runs deterministic post-processing checks against FDA, EU, carcinogen, allergen, and endocrine datasets from the project.',
        'Experience: Moves from upload to a dedicated results dashboard and stores scan history for future comparison.',
        'Safety Score Model: Computed locally after analysis using hazard counts, not a random model estimate.'
      ]
    }
  };

  const sectionOrder: SectionId[] = ['ingredients', 'technology', 'science', 'about'];

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as SectionId;
    if (hash && Object.prototype.hasOwnProperty.call(sectionContent, hash)) {
      setActiveSection(hash);
    }
  }, []);

  const handleSectionChange = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
  };

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
    <div className="relative min-h-[calc(100vh-9rem)] overflow-hidden rounded-[2rem] border border-rose-100/70 bg-[#f7f4f6]">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(244,114,182,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,114,182,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -left-40 top-40 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-24 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative z-10 p-5 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#e7e2e8] bg-[#f8f7f8]/95 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-500/10 p-2">
                <Sparkles className="h-4 w-4 text-rose-500" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">COSMOBOT</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              {sectionOrder.map((sectionId) => (
                <button
                  key={sectionId}
                  onClick={() => handleSectionChange(sectionId)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    activeSection === sectionId
                      ? 'bg-rose-100 text-rose-600'
                      : 'text-slate-700 hover:text-rose-500'
                  }`}
                >
                  {sectionContent[sectionId].title}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-rose-300/60">Contact Us</button>
            </div>
          </div>
          <div className="mt-4 flex md:hidden items-center gap-2 overflow-x-auto pb-1">
            {sectionOrder.map((sectionId) => (
              <button
                key={`mobile-${sectionId}`}
                onClick={() => handleSectionChange(sectionId)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeSection === sectionId
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-white text-slate-600'
                }`}
              >
                {sectionContent[sectionId].title}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-rose-400 font-bold">Partner Access Portal</p>
          <h1 className="mt-5 text-5xl md:text-7xl leading-[0.95] text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Future of
            <span className="block mt-1">
              <span className="text-rose-500 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Cosmetic</span>{' '}
              <span>Ingredients</span>
            </span>
          </h1>
        </div>

        <div className="mx-auto mt-10 w-full max-w-xl rounded-[2rem] border border-white/70 bg-[#f8f6f8] p-8 md:p-10 shadow-2xl shadow-zinc-900/10">
          <div className="mb-6 flex gap-2 rounded-xl bg-[#f2eff2] p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
                isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Email Address</span>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-300 w-5 h-5" />
                <input
                  type="email"
                  placeholder="name@luxury-brand.com"
                  className="w-full rounded-2xl border border-[#ece8ed] bg-[#f2f4f5] py-3.5 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Password</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-300 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#ece8ed] bg-[#f2f4f5] py-3.5 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            {error && <p className="text-red-500 text-xs mt-1 px-1">{error}</p>}

            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 py-4 text-xl font-bold text-white shadow-xl shadow-rose-300/70 transition hover:brightness-105 flex items-center justify-center gap-2"
            >
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? 'Secure Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            <p>Authorized personnel only.</p>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-5">
          <div className="rounded-3xl border border-white/70 bg-[#f3f3f4] p-6 shadow-lg shadow-zinc-900/5">
            <div className="aspect-square rounded-2xl bg-gradient-to-b from-rose-100 to-rose-200/70 flex items-center justify-center">
              <Droplets className="h-10 w-10 text-rose-500" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/70 bg-[#f3f3f4] p-6 shadow-lg shadow-zinc-900/5">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-rose-200 to-amber-100 flex items-center justify-center">
              <FlaskConical className="h-10 w-10 text-rose-600" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/70 bg-[#f3f3f4] p-6 shadow-lg shadow-zinc-900/5">
            <div className="aspect-square rounded-2xl bg-gradient-to-b from-amber-100 to-rose-100 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-rose-500" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-6xl">
          <section
            id={activeSection}
            className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-sm p-6 md:p-8 shadow-lg shadow-zinc-900/5"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{sectionContent[activeSection].title}</h3>
            {sectionContent[activeSection].badge && (
              <span className="mt-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-500">
                {sectionContent[activeSection].badge}
              </span>
            )}
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600">
              {sectionContent[activeSection].body}
            </p>
            {sectionContent[activeSection].bullets && (
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {sectionContent[activeSection].bullets?.map((point, idx) => (
                  <li key={idx} className="rounded-xl bg-rose-50/60 border border-rose-100 px-3 py-2">
                    {point}
                  </li>
                ))}
              </ul>
            )}
            {activeSection === 'about' && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-white/80 p-4">
                <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-rose-500">How Safety Score Is Calculated</h4>
                <p className="mt-2 text-sm text-slate-600">
                  For each ingredient, hazard levels are counted as <strong>Low (L)</strong>, <strong>Medium (M)</strong>, and <strong>High (H)</strong>.
                  Weighted risk is then computed with higher penalty for higher hazard.
                </p>
                <div className="mt-3 rounded-xl bg-slate-900 text-slate-100 p-3 text-xs md:text-sm font-mono overflow-x-auto">
                  totalRisk = (1 x L) + (3 x M) + (5 x H)<br />
                  maxRisk = 5 x (L + M + H)<br />
                  safetyScore = (1 - totalRisk / maxRisk) x 100
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Result is rounded to 2 decimals. Higher High/Medium counts reduce the score faster than Low.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
