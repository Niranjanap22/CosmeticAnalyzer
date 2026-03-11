import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, Skull, Activity, Zap } from 'lucide-react';
import {
  FDA_BANNED,
  EU_BANNED,
  EU_RESTRICTED,
  KNOWN_CARCINOGENS,
  SUSPECTED_CARCINOGENS,
  ALLERGENS,
  ENDOCRINE_DISRUPTORS
} from '@/data/regulatoryData';

interface RegulatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'FDA' | 'EU' | 'CARCINOGENS' | 'ALLERGENS' | 'ENDOCRINE';
}

const RegulatoryModal: React.FC<RegulatoryModalProps> = ({ isOpen, onClose, initialTab = 'FDA' }) => {
  const [activeTab, setActiveTab] = useState<'FDA' | 'EU' | 'CARCINOGENS' | 'ALLERGENS' | 'ENDOCRINE'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4">
      <style>{`
        @keyframes modalRise {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="relative w-full max-w-3xl max-h-[84vh] flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/65 backdrop-blur-2xl shadow-[0_28px_80px_rgba(49,32,38,0.35)] animate-[modalRise_260ms_ease-out]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(230,182,196,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,182,196,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />
        {/* Header */}
        <div className="relative z-10 p-5 border-b border-white/60 flex justify-between items-center bg-white/40">
          <h2 className="text-2xl text-[#2f262a]" style={{ fontFamily: "'Playfair Display', serif" }}>Cosmetic Regulatory Standards</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/70 rounded-full transition">
            <X className="w-5 h-5 text-[#7f6c73]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex border-b border-white/60 overflow-x-auto">
          <button
            className={`flex-1 py-3 font-medium text-sm transition-all duration-300 ${
              activeTab === 'FDA' ? 'text-rose-600 bg-rose-50/60 border-b-2 border-rose-400' : 'text-[#75656d] hover:bg-white/60'
            }`}
            onClick={() => setActiveTab('FDA')}
          >
            FDA (USA) Regulations
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-all duration-300 ${
              activeTab === 'EU' ? 'text-rose-600 bg-rose-50/60 border-b-2 border-rose-400' : 'text-[#75656d] hover:bg-white/60'
            }`}
            onClick={() => setActiveTab('EU')}
          >
            EU Cosmetics Regulations
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-all duration-300 ${
              activeTab === 'CARCINOGENS' ? 'text-rose-600 bg-rose-50/60 border-b-2 border-rose-400' : 'text-[#75656d] hover:bg-white/60'
            }`}
            onClick={() => setActiveTab('CARCINOGENS')}
          >
            Carcinogens
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-all duration-300 ${
              activeTab === 'ALLERGENS' ? 'text-rose-600 bg-rose-50/60 border-b-2 border-rose-400' : 'text-[#75656d] hover:bg-white/60'
            }`}
            onClick={() => setActiveTab('ALLERGENS')}
          >
            Allergens
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-all duration-300 ${
              activeTab === 'ENDOCRINE' ? 'text-rose-600 bg-rose-50/60 border-b-2 border-rose-400' : 'text-[#75656d] hover:bg-white/60'
            }`}
            onClick={() => setActiveTab('ENDOCRINE')}
          >
            Endocrine
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          {activeTab === 'FDA' && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center text-lg font-semibold text-red-600 mb-3">
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  FDA Banned & Restricted Ingredients
                </h3>
                <p className="text-sm text-[#72616a] mb-4">
                  The FDA prohibits or restricts a specific set of ingredients in cosmetics.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from(FDA_BANNED).map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-700 bg-red-50 px-3 py-2 rounded border border-red-100">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'EU' && (
            <div className="space-y-8">
              <div>
                <h3 className="flex items-center text-lg font-semibold text-red-600 mb-3">
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  EU Banned Substances (Annex II Selection)
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from(EU_BANNED).map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-700 bg-red-50 px-3 py-2 rounded border border-red-100">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="flex items-center text-lg font-semibold text-amber-600 mb-3">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  EU Restricted Substances (Annex III Selection)
                </h3>
                <div className="space-y-2">
                  {Array.from(EU_RESTRICTED.entries()).map(([item, details]) => (
                    <div key={item} className="text-sm bg-amber-50 p-3 rounded border border-amber-100">
                      <div className="font-medium text-gray-800 capitalize">{item}</div>
                      <div className="text-gray-600 mt-1">{details}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CARCINOGENS' && (
            <div className="space-y-8">
              <div>
                <h3 className="flex items-center text-lg font-semibold text-red-600 mb-3">
                  <Skull className="w-5 h-5 mr-2" />
                  Known Carcinogens
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from(KNOWN_CARCINOGENS).map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-700 bg-red-50 px-3 py-2 rounded border border-red-100">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="flex items-center text-lg font-semibold text-amber-700 mb-3">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Suspected Carcinogens
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from(SUSPECTED_CARCINOGENS).map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-700 bg-amber-50 px-3 py-2 rounded border border-amber-100">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'ALLERGENS' && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center text-lg font-semibold text-amber-600 mb-3">
                  <Activity className="w-5 h-5 mr-2" />
                  Common Cosmetic Allergens
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from(ALLERGENS).map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-700 bg-amber-50 px-3 py-2 rounded border border-amber-100">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'ENDOCRINE' && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center text-lg font-semibold text-rose-600 mb-3">
                  <Zap className="w-5 h-5 mr-2" />
                  Endocrine Disruptors
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from(ENDOCRINE_DISRUPTORS).map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-700 bg-rose-50 px-3 py-2 rounded border border-rose-100">
                      <span className="w-2 h-2 bg-rose-400 rounded-full mr-2"></span>
                      <span className="capitalize">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 p-4 border-t border-white/60 bg-white/40 text-center text-xs text-[#75656d]">
          Data sourced from FDA Regulations & EU Cosmetics Regulation (EC) No 1223/2009
        </div>
      </div>
    </div>
  );
};

export default RegulatoryModal;
