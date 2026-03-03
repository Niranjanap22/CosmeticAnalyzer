import React, { useState } from "react";
import { AnalysisResult } from "@/types/types";
import {
  ShieldCheck,
  AlertCircle,
  List,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Skull,
  Zap
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import RegulatoryModal from './RegulatoryModal';

interface Props {
  data: AnalysisResult;
}

const AnalysisResultView: React.FC<Props> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'FDA' | 'EU' | 'CARCINOGENS' | 'ALLERGENS' | 'ENDOCRINE'>('FDA');

  const chartData = [
    { name: "Score", value: data.overallSafetyScore },
    { name: "Remaining", value: 100 - data.overallSafetyScore },
  ];

  const openModal = (tab: 'FDA' | 'EU' | 'CARCINOGENS' | 'ALLERGENS' | 'ENDOCRINE') => {
    setModalTab(tab);
    setShowModal(true);
  };

  const highRiskReasons: string[] = [];
  if (!data.carcinogenStatus?.isClean) highRiskReasons.push("Carcinogen concern");
  if (!data.endocrineStatus?.isClean) highRiskReasons.push("Endocrine disruptor concern");

  const mediumRiskReasons: string[] = [];
  if (!data.allergenStatus?.isClean) mediumRiskReasons.push("Allergen/irritant concern");
  if (!data.euCompliance?.isClean) mediumRiskReasons.push("Restricted ingredient concern");

  const highRiskHeading =
    highRiskReasons.length > 0
      ? `High Risk : ${highRiskReasons.join(", ")}`
      : "High Risk : severe toxicity concern";

  const mediumRiskHeading =
    mediumRiskReasons.length > 0
      ? `Medium Risk : ${mediumRiskReasons.join(", ")}`
      : "Medium Risk : moderate irritation/sensitivity concern";

  const lowRiskHeading =
    highRiskReasons.length === 0 && mediumRiskReasons.length === 0
      ? "Low Risk : no major carcinogen/disruptor/allergen flags"
      : "Low Risk : relatively safer in typical cosmetic use";

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-purple-50 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="purple-gradient p-8 text-white relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold mb-1">{data.productName}</h2>
            <p className="text-purple-100 font-medium opacity-90">
              {data.brand}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="w-16 h-16 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={20}
                    outerRadius={30}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    <Cell fill="white" />
                    <Cell fill="rgba(255,255,255,0.2)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-purple-200">
                Safety Score
              </p>
              <p className="text-2xl font-black">
                {data.overallSafetyScore}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-purple-900">Confidence in Reading Image</h4>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-purple-600">
                {data.trustPercentage}%
              </span>
              <p className="text-sm text-purple-500 mb-1 leading-tight font-medium">
                Image Reading Accuracy
              </p>
            </div>
            <div className="mt-4 h-1.5 w-full bg-purple-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-1000"
                style={{ width: `${data.trustPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-indigo-900">Overall Verdict</h4>
            </div>
            <p className="text-indigo-800 text-sm font-medium leading-relaxed italic">
              "{data.summary}"
            </p>
          </div>
        </div>

        {/* Regulatory Compliance Section (Added) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FDA Card */}
          <div className={`p-6 rounded-2xl border ${data.fdaCompliance?.isClean ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {data.fdaCompliance?.isClean ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="font-bold text-gray-900">FDA Compliance</h3>
              </div>
              <button onClick={() => openModal('FDA')} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                <BookOpen className="w-3 h-3" /> Standards
              </button>
            </div>
            {data.fdaCompliance?.isClean ? (
              <p className="text-sm text-green-800">No FDA banned ingredients detected.</p>
            ) : (
              <ul className="text-sm text-red-800 space-y-1">
                {data.fdaCompliance?.issues?.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            )}
          </div>

          {/* EU Card */}
          <div className={`p-6 rounded-2xl border ${data.euCompliance?.isClean ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {data.euCompliance?.isClean ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                )}
                <h3 className="font-bold text-gray-900">EU Compliance</h3>
              </div>
              <button onClick={() => openModal('EU')} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                <BookOpen className="w-3 h-3" /> Standards
              </button>
            </div>
            {data.euCompliance?.isClean ? (
              <p className="text-sm text-green-800">No EU banned/restricted ingredients detected.</p>
            ) : (
              <ul className="text-sm text-amber-900 space-y-1">
                {data.euCompliance?.issues?.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Carcinogens Card */}
          <div className={`p-6 rounded-2xl border ${data.carcinogenStatus?.isClean ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {data.carcinogenStatus?.isClean ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Skull className="w-6 h-6 text-red-600" />
                )}
                <h3 className="font-bold text-gray-900">Carcinogens</h3>
              </div>
              <button onClick={() => openModal('CARCINOGENS')} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                <BookOpen className="w-3 h-3" /> List
              </button>
            </div>
            {data.carcinogenStatus?.isClean ? (
              <p className="text-sm text-green-800">No known carcinogens detected.</p>
            ) : (
              <ul className="text-sm text-red-800 space-y-1">
                {data.carcinogenStatus?.issues?.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Allergens Card */}
          <div className={`p-6 rounded-2xl border ${data.allergenStatus?.isClean ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {data.allergenStatus?.isClean ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
                <h3 className="font-bold text-gray-900">Allergens</h3>
              </div>
              <button onClick={() => openModal('ALLERGENS')} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                <BookOpen className="w-3 h-3" /> List
              </button>
            </div>
            {data.allergenStatus?.isClean ? (
              <p className="text-sm text-green-800">No common allergens detected.</p>
            ) : (
              <ul className="text-sm text-amber-900 space-y-1">
                {data.allergenStatus?.issues?.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Endocrine Disruptors Card */}
          <div className={`p-6 rounded-2xl border ${data.endocrineStatus?.isClean ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100'} md:col-span-2`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {data.endocrineStatus?.isClean ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Zap className="w-6 h-6 text-purple-600" />
                )}
                <h3 className="font-bold text-gray-900">Endocrine Disruptors</h3>
              </div>
              <button onClick={() => openModal('ENDOCRINE')} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                <BookOpen className="w-3 h-3" /> List
              </button>
            </div>
            {data.endocrineStatus?.isClean ? (
              <p className="text-sm text-green-800">No known endocrine disruptors detected.</p>
            ) : (
              <ul className="text-sm text-purple-800 space-y-1">
                {data.endocrineStatus?.issues?.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {data.toxicCompounds.length > 0 && (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-bold text-lg">
                Warning: Toxic Compounds Detected
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.toxicCompounds.map((comp, idx) => (
                <span
                  key={idx}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200"
                >
                  {comp}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-red-700/80 font-medium">
              These substances are linked to skin irritation or long-term health
              concerns. Use with caution.
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-extrabold text-purple-900 flex items-center gap-2">
              <List className="w-6 h-6 text-purple-600" />
              Detailed Ingredients
            </h4>
            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {data.ingredients.length} items analyzed
            </span>
          </div>

          <div className="space-y-6">
            {data.ingredients.filter((i) => i.hazardLevel === "High").length >
              0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <h5 className="font-bold text-lg text-red-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  {highRiskHeading}
                </h5>
                <div className="space-y-3">
                  {data.ingredients
                    .filter((i) => i.hazardLevel === "High")
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="group border border-purple-50 hover:border-purple-200 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-purple-50/50 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="font-bold text-purple-900">
                              {item.name}
                            </span>
                            <span className="text-xs text-purple-400 font-medium">
                              • {item.purpose}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-red-50 text-red-600">
                            {item.hazardLevel} Risk
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-purple-500 mt-2 leading-snug group-hover:text-purple-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {data.ingredients.filter((i) => i.hazardLevel === "Medium").length >
              0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <h5 className="font-bold text-lg text-amber-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  {mediumRiskHeading}
                </h5>
                <div className="space-y-3">
                  {data.ingredients
                    .filter((i) => i.hazardLevel === "Medium")
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="group border border-purple-50 hover:border-purple-200 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-purple-50/50 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <span className="font-bold text-purple-900">
                              {item.name}
                            </span>
                            <span className="text-xs text-purple-400 font-medium">
                              • {item.purpose}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-600">
                            {item.hazardLevel} Risk
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-purple-500 mt-2 leading-snug group-hover:text-purple-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {data.ingredients.filter((i) => i.hazardLevel === "Low").length >
              0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                <h5 className="font-bold text-lg text-emerald-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  {lowRiskHeading}
                </h5>
                <div className="space-y-3">
                  {data.ingredients
                    .filter((i) => i.hazardLevel === "Low")
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="group border border-purple-50 hover:border-purple-200 rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-purple-50/50 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            <span className="font-bold text-purple-900">
                              {item.name}
                            </span>
                            <span className="text-xs text-purple-400 font-medium">
                              • {item.purpose}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                            {item.hazardLevel} Risk
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-purple-500 mt-2 leading-snug group-hover:text-purple-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-purple-900 text-white p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-purple-800 p-3 rounded-xl">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-lg mb-1">Our Recommendation</h5>
            <p className="text-purple-200 text-sm leading-relaxed">
              {data.recommendation}
            </p>
          </div>
        </div>
      </div>
      <RegulatoryModal isOpen={showModal} onClose={() => setShowModal(false)} initialTab={modalTab} />
    </div>
  );
};

export default AnalysisResultView;
