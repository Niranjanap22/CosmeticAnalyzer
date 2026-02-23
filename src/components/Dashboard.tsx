import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, Info, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { analyzeCosmeticImage } from '@/services/geminiService';
import { AnalysisResult } from '@/types/types';
import AnalysisResultView from './AnalysisResult';

const Dashboard: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64Data = image.split(',')[1];
      const data = await analyzeCosmeticImage(base64Data);
      setResult(data);
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Something went wrong during analysis. Please try a clearer image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-purple-100 border border-purple-50">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-2">
              <Camera className="w-6 h-6 text-purple-600" />
              Upload Product Image
            </h2>

            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-purple-50 transition-all group"
              >
                <div className="bg-purple-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-purple-900 text-lg">Click to upload photo</p>
                  <p className="text-purple-400 text-sm">Clear shot of the ingredient list works best</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative group rounded-2xl overflow-hidden border border-purple-100 aspect-square">
                  <img src={image} alt="Product" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-purple-700 px-6 py-2 rounded-full font-bold shadow-lg"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                {!result && (
                  <button
                    disabled={isAnalyzing}
                    onClick={startAnalysis}
                    className="w-full purple-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
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
                )}

                {result && (
                  <button
                    onClick={reset}
                    className="w-full bg-purple-100 text-purple-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    New Scan
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-300" />
                Why analyze?
              </h3>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Many cosmetics contain endocrine disruptors and allergens that aren't clearly labeled for toxicity. Our AI cross-references ingredient databases to give you the real facts.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-800 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {!result && !isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-purple-100 rounded-3xl">
              <FileText className="w-16 h-16 text-purple-200 mb-6" />
              <h3 className="text-2xl font-bold text-purple-300">Analysis Preview</h3>
              <p className="text-purple-300 max-w-sm mt-2">
                Upload a photo to see the safety breakdown, toxic compounds, and trust scores.
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl shadow-xl shadow-purple-50">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mt-8">Thinking Deeply...</h3>
              <p className="text-purple-500 mt-2 max-w-md">
                Our AI is scanning thousands of ingredient databases to ensure your cosmetic is safe for daily use.
              </p>

              <div className="mt-8 space-y-4 w-full max-w-xs">
                <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
                <div className="flex justify-between text-xs font-bold text-purple-400">
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
          ) : (
            <AnalysisResultView data={result!} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

