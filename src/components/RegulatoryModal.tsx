import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { FDA_BANNED, EU_BANNED, EU_RESTRICTED } from '@/data/regulatoryData';

interface RegulatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'FDA' | 'EU';
}

const RegulatoryModal: React.FC<RegulatoryModalProps> = ({ isOpen, onClose, initialTab = 'FDA' }) => {
  const [activeTab, setActiveTab] = useState<'FDA' | 'EU'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Cosmetic Regulatory Standards</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 font-medium text-sm transition ${
              activeTab === 'FDA' ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('FDA')}
          >
            FDA (USA) Regulations
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition ${
              activeTab === 'EU' ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('EU')}
          >
            EU Cosmetics Regulations
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'FDA' && (
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center text-lg font-semibold text-red-600 mb-3">
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  FDA Banned & Restricted Ingredients
                </h3>
                <p className="text-sm text-gray-600 mb-4">
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-500">
          Data sourced from FDA Regulations & EU Cosmetics Regulation (EC) No 1223/2009
        </div>
      </div>
    </div>
  );
};

export default RegulatoryModal;