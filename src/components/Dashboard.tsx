import React, { useState, useRef } from 'react';
import { Upload, Camera, Info, Loader2, Sparkles } from 'lucide-react';
import { analyzeCosmeticImage } from '@/services/geminiService';
import { AnalysisResult } from '@/types/types';
import { processImage } from '@/utils/imageUtils';
import { auth } from '@/lib/firebase';
import { saveScan } from '@/services/historyService';

interface DashboardProps {
  onAnalysisComplete: (result: AnalysisResult, image: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAnalysisComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file).then((resizedImage) => {
        setImage(resizedImage);
      }).catch(err => console.error("Image processing failed", err));
      // Reset the input value to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64Data = image.split(',')[1];
      const data = await analyzeCosmeticImage(base64Data);

      // Auto-save to history if user is logged in
      if (auth.currentUser) {
        saveScan(auth.currentUser.uid, data).catch(console.error);
      }
      onAnalysisComplete(data, image);
    } catch (err) {
      console.error("Analysis failed", err);
      alert(`something went wrong during the analysis. Error- ${err}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-[#fffaf8] via-[#fff4f6] to-[#fdf8f5] p-6 md:p-10 animate-fade-in shadow-[0_20px_80px_rgba(120,84,94,0.14)]">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(230,182,196,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,182,196,0.18)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(60,40,45,0.08)]" />

      <style>{`
        @keyframes floatSoft {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>

      <div className="relative z-10 space-y-10">
        <div className="flex flex-col gap-3 text-center md:text-left animate-[revealUp_420ms_ease-out]">
          <h1 className="text-4xl md:text-5xl leading-[0.95] text-[#2d2327]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Analysis Dashboard
          </h1>
          <p className="text-[#78686f] max-w-2xl">
            Upload a clear ingredient label, run analysis, and review the complete safety report on the results page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="backdrop-blur-2xl bg-white/55 p-8 rounded-[2rem] border border-white/70 shadow-[0_18px_40px_rgba(128,89,101,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(128,89,101,0.20)] animate-[revealUp_520ms_ease-out]">
              <h2 className="text-3xl mb-6 flex items-center gap-3 text-[#2f262a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Camera className="w-6 h-6 text-rose-500" />
                Upload Product Image
              </h2>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {!image ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-3xl p-[1px] bg-gradient-to-r from-rose-300 via-pink-200 to-amber-100 animate-[floatSoft_5s_ease-in-out_infinite] cursor-pointer group"
                >
                  <div className="rounded-3xl bg-white/70 backdrop-blur-xl p-12 flex flex-col items-center justify-center gap-5 border border-white/70 transition-all duration-300 group-hover:shadow-[0_18px_35px_rgba(224,128,151,0.26)]">
                    <div className="bg-white/80 ring-1 ring-rose-200/60 p-5 rounded-full shadow-[0_10px_25px_rgba(223,132,152,0.28)]">
                      <Upload className="w-8 h-8 text-rose-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#2f262a] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Drop or upload your label image</p>
                      <p className="text-[#8f7a81] text-sm mt-1">Clear shot of the ingredient list works best</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative group rounded-2xl overflow-hidden border border-white/70 aspect-square shadow-[0_14px_30px_rgba(112,76,84,0.16)]">
                    <img src={image} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/95 text-[#47353c] px-6 py-2 rounded-full font-semibold shadow-lg"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <button
                    disabled={isAnalyzing}
                    onClick={startAnalysis}
                    className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 font-bold text-lg shadow-[0_12px_30px_rgba(233,108,147,0.45)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_18px_38px_rgba(233,108,147,0.52)]"
                  >
                    <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent group-hover:animate-[shimmerSweep_800ms_ease-out]" />
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Reveal Ingredients
                      </>
                    )}
                  </button>

                  <button
                    onClick={reset}
                    className="w-full bg-white/60 backdrop-blur-xl text-[#54424a] py-4 rounded-2xl font-semibold border border-white/70 hover:bg-white/80 transition-colors"
                  >
                    Clear Image
                  </button>
                </div>
              )}
            </div>

            <div className="backdrop-blur-2xl bg-white/40 text-[#3a2c31] p-6 rounded-[2rem] border border-white/70 shadow-[0_18px_40px_rgba(128,89,101,0.12)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(128,89,101,0.20)] animate-[revealUp_620ms_ease-out]">
              <div className="absolute -right-14 -bottom-14 w-56 h-56 rounded-full bg-gradient-to-br from-rose-200/60 to-transparent blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-xl mb-3 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Info className="w-5 h-5 text-rose-500" />
                  Why analyze?
                </h3>
                <p className="text-[#7a686f] text-sm leading-relaxed">
                  Many cosmetics contain endocrine disruptors and allergens that are not clearly labeled for toxicity. This analysis cross-references ingredient intelligence and regulatory watchlists to deliver practical risk context.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {!isAnalyzing ? (
              <div className="relative h-full min-h-[420px] flex flex-col items-center justify-center text-center p-12 rounded-[2rem] border border-white/70 bg-white/45 backdrop-blur-2xl shadow-[0_18px_40px_rgba(128,89,101,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(128,89,101,0.20)] animate-[revealUp_700ms_ease-out]">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-52 w-52 rounded-full bg-rose-200/40 blur-3xl" />
                </div>
                <Sparkles className="w-16 h-16 text-rose-300 mb-6 relative z-10" />
                <h3 className="text-4xl text-[#2f262a] relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Analyze</h3>
                <p className="text-[#8b757d] max-w-md mt-3 relative z-10">
                  Upload a photo, then click Reveal Ingredients. You will be redirected to a dedicated results page.
                </p>
              </div>
            ) : (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center p-12 bg-white/55 backdrop-blur-2xl rounded-[2rem] border border-white/70 shadow-[0_18px_40px_rgba(128,89,101,0.12)] animate-[revealUp_380ms_ease-out]">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500 w-8 h-8" />
                </div>
                <h3 className="text-4xl text-[#2f262a] mt-8" style={{ fontFamily: "'Playfair Display', serif" }}>Thinking Deeply...</h3>
                <p className="text-[#7c6870] mt-2 max-w-md">
                  Our AI is scanning ingredient databases and compliance references to build your personalized safety profile.
                </p>

                <div className="mt-8 space-y-4 w-full max-w-xs">
                  <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-[#9f8a91]">
                    <span>Extracting Labels</span>
                    <span>Verifying toxicity</span>
                  </div>
                </div>
                <style>{`
                  @keyframes loading {
                    0% { width: 0%; margin-left: 0%; }
                    50% { width: 50%; margin-left: 25%; }
                    100% { width: 0%; margin-left: 100%; }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
