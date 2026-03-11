import React, { useState } from "react";
import { AnalysisResult, IngredientInfo } from "@/types/types";
import {
  AlertCircle,
  List,
  Info,
  CheckCircle,
  XCircle,
  BookOpen,
  ChevronDown
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import RegulatoryModal from "./RegulatoryModal";
import IngredientWikiLink from "./IngredientWikiLink";
import {
  FDA_BANNED,
  EU_BANNED,
  EU_RESTRICTED,
  KNOWN_CARCINOGENS,
  SUSPECTED_CARCINOGENS,
  ALLERGENS,
  ENDOCRINE_DISRUPTORS
} from "@/data/regulatoryData";

interface Props {
  data: AnalysisResult;
}

const AnalysisResultView: React.FC<Props> = ({ data }) => {
  const CARCINOGEN_WATCHLIST = new Set([
    ...KNOWN_CARCINOGENS,
    ...SUSPECTED_CARCINOGENS
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showScoreMath, setShowScoreMath] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    high: true,
    medium: true,
    low: true
  });
  const [modalTab, setModalTab] = useState<
    "FDA" | "EU" | "CARCINOGENS" | "ALLERGENS" | "ENDOCRINE"
  >("FDA");

  const openModal = (
    tab: "FDA" | "EU" | "CARCINOGENS" | "ALLERGENS" | "ENDOCRINE"
  ) => {
    setModalTab(tab);
    setShowModal(true);
  };

  const toggleSection = (section: "high" | "medium" | "low") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const chartData = [
    { name: "Score", value: data.overallSafetyScore },
    { name: "Remaining", value: 100 - data.overallSafetyScore }
  ];

  const normalizeHazardLevel = (level: string | undefined): "high" | "medium" | "low" | "unknown" => {
    const normalized = (level || "").toLowerCase().trim();
    if (normalized.includes("high")) return "high";
    if (normalized.includes("medium")) return "medium";
    if (normalized.includes("low")) return "low";
    return "unknown";
  };

  const matchesIngredientToSet = (ingredientName: string, set: Set<string>) => {
    const normalizedIngredient = (ingredientName || "").toLowerCase().trim();
    for (const item of set) {
      if (
        normalizedIngredient.includes(item) ||
        item.includes(normalizedIngredient)
      ) {
        return true;
      }
    }
    return false;
  };

  const isDualWatchlistHigh = (ingredientName: string) =>
    matchesIngredientToSet(ingredientName, ENDOCRINE_DISRUPTORS) &&
    matchesIngredientToSet(ingredientName, CARCINOGEN_WATCHLIST);

  const getEffectiveHazardLevel = (ingredient: IngredientInfo) => {
    if (isDualWatchlistHigh(ingredient.name)) return "high";
    return normalizeHazardLevel(ingredient.hazardLevel);
  };

  const highIngredients = data.ingredients.filter(
    (i) => getEffectiveHazardLevel(i) === "high"
  );
  const mediumIngredients = data.ingredients.filter(
    (i) => getEffectiveHazardLevel(i) === "medium"
  );
  const lowIngredients = data.ingredients.filter(
    (i) => getEffectiveHazardLevel(i) === "low"
  );

  const getMatchedIngredients = (set: Set<string>): string[] => {
    const matches = new Set<string>();
    for (const ingredient of data.ingredients) {
      const normalizedIngredient = (ingredient.name || "").toLowerCase().trim();
      for (const item of set) {
        if (
          normalizedIngredient.includes(item) ||
          item.includes(normalizedIngredient)
        ) {
          matches.add(ingredient.name);
          break;
        }
      }
    }
    return Array.from(matches);
  };

  const knownCarcinogenMatches = getMatchedIngredients(KNOWN_CARCINOGENS);
  const suspectedCarcinogenMatches = getMatchedIngredients(SUSPECTED_CARCINOGENS);
  const scoreWeights = {
    low: 0.5,
    medium: 2.5,
    high: 5
  };

  const fallbackScoreBreakdown = (() => {
    const ingredientCounts = {
      low: lowIngredients.length,
      medium: mediumIngredients.length,
      high: highIngredients.length,
      total: data.ingredients.length
    };

    const totalRisk =
      ingredientCounts.low * scoreWeights.low +
      ingredientCounts.medium * scoreWeights.medium +
      ingredientCounts.high * scoreWeights.high;
    const maxRisk = ingredientCounts.total > 0 ? ingredientCounts.total * 5 : 0;
    const baseScore =
      maxRisk > 0 ? Number(((1 - totalRisk / maxRisk) * 100).toFixed(2)) : 0;

    const penaltyWeights = {
      fda: 8,
      eu: 6,
      carcinogen: 5,
      endocrine: 4,
      allergen: 2
    };
    const penalties = {
      fda: {
        count: data.fdaCompliance?.issues?.length || 0,
        weight: penaltyWeights.fda,
        total: (data.fdaCompliance?.issues?.length || 0) * penaltyWeights.fda
      },
      eu: {
        count: data.euCompliance?.issues?.length || 0,
        weight: penaltyWeights.eu,
        total: (data.euCompliance?.issues?.length || 0) * penaltyWeights.eu
      },
      carcinogen: {
        count: data.carcinogenStatus?.issues?.length || 0,
        weight: penaltyWeights.carcinogen,
        total:
          (data.carcinogenStatus?.issues?.length || 0) * penaltyWeights.carcinogen
      },
      endocrine: {
        count: data.endocrineStatus?.issues?.length || 0,
        weight: penaltyWeights.endocrine,
        total:
          (data.endocrineStatus?.issues?.length || 0) * penaltyWeights.endocrine
      },
      allergen: {
        count: data.allergenStatus?.issues?.length || 0,
        weight: penaltyWeights.allergen,
        total:
          (data.allergenStatus?.issues?.length || 0) * penaltyWeights.allergen
      }
    };
    const totalPenalty =
      penalties.fda.total +
      penalties.eu.total +
      penalties.carcinogen.total +
      penalties.endocrine.total +
      penalties.allergen.total;

    const rawScore = Number((baseScore - totalPenalty).toFixed(2));
    const finalScore = Number(Math.max(0, Math.min(100, rawScore)).toFixed(2));

    return {
      ingredientCounts,
      baseScore,
      penalties,
      totalPenalty,
      rawScore,
      clampedScore: finalScore,
      finalScore
    };
  })();

  const scoreBreakdown = data.scoreBreakdown || fallbackScoreBreakdown;

  const highRiskReasons: string[] = [];
  if (!data.carcinogenStatus?.isClean) highRiskReasons.push("Carcinogen concern");
  if (!data.endocrineStatus?.isClean) highRiskReasons.push("Endocrine disruptor concern");

  const mediumRiskReasons: string[] = [];
  if (!data.allergenStatus?.isClean) mediumRiskReasons.push("Allergen/irritant concern");
  if (!data.euCompliance?.isClean) mediumRiskReasons.push("Restricted ingredient concern");

  const highRiskHeading =
    highRiskReasons.length > 0
      ? `High Risk: ${highRiskReasons.join(", ")}`
      : "High Risk: severe toxicity concern";

  const mediumRiskHeading =
    mediumRiskReasons.length > 0
      ? `Medium Risk: ${mediumRiskReasons.join(", ")}`
      : "Medium Risk: moderate irritation/sensitivity concern";

  const lowRiskHeading =
    highRiskReasons.length === 0 && mediumRiskReasons.length === 0
      ? "Low Risk: no major carcinogen/disruptor/allergen flags"
      : "Low Risk: relatively safer in typical cosmetic use";

  const getToxicBasis = (compound: string): string[] => {
    const normalized = compound.toLowerCase().trim();
    const basis: string[] = [];

    const matchesAny = (set: Set<string>) => {
      for (const item of set) {
        if (normalized.includes(item) || item.includes(normalized)) return true;
      }
      return false;
    };

    if (matchesAny(FDA_BANNED)) basis.push("FDA banned list");
    if (matchesAny(EU_BANNED)) basis.push("EU banned list");
    for (const restricted of EU_RESTRICTED.keys()) {
      if (normalized.includes(restricted) || restricted.includes(normalized)) {
        basis.push("EU restricted list");
        break;
      }
    }
    if (matchesAny(KNOWN_CARCINOGENS)) basis.push("Known carcinogen list");
    if (matchesAny(SUSPECTED_CARCINOGENS)) basis.push("Suspected carcinogen list");
    if (matchesAny(ALLERGENS)) basis.push("Allergen watchlist");
    if (matchesAny(ENDOCRINE_DISRUPTORS)) basis.push("Endocrine disruptor watchlist");

    if (basis.length === 0) {
      basis.push("AI toxicity signal from ingredient profile");
    }

    return basis;
  };

  const getToxicWhyThisLevel = (compound: string): string => {
    const normalized = compound.toLowerCase().trim();

    for (const ingredient of data.ingredients) {
      const ingredientName = (ingredient.name || "").toLowerCase().trim();
      if (
        normalized.includes(ingredientName) ||
        ingredientName.includes(normalized)
      ) {
        if (ingredient.description && ingredient.description.trim().length > 0) {
          return ingredient.description.trim();
        }
        break;
      }
    }

    return getToxicBasis(compound).join(", ");
  };

  const getToxicRiskLevel = (compound: string): "High" | "Medium" | "Low" => {
    const normalized = compound.toLowerCase().trim();

    // 1) Prefer explicit hazard level from ingredient-level classification.
    for (const ingredient of data.ingredients) {
      const ingredientName = (ingredient.name || "").toLowerCase().trim();
      if (normalized.includes(ingredientName) || ingredientName.includes(normalized)) {
        const level = normalizeHazardLevel(ingredient.hazardLevel);
        if (level === "high") return "High";
        if (level === "medium") return "Medium";
        if (level === "low") return "Low";
      }
    }

    // 2) Regulatory severity fallback.
    const matchesAny = (set: Set<string>) => {
      for (const item of set) {
        if (normalized.includes(item) || item.includes(normalized)) return true;
      }
      return false;
    };
    let matchesRestricted = false;
    for (const restricted of EU_RESTRICTED.keys()) {
      if (normalized.includes(restricted) || restricted.includes(normalized)) {
        matchesRestricted = true;
        break;
      }
    }

    const endocrineHit = matchesAny(ENDOCRINE_DISRUPTORS);
    const carcinogenHit = matchesAny(CARCINOGEN_WATCHLIST);

    if (endocrineHit && carcinogenHit) return "High";

    if (matchesAny(FDA_BANNED) || matchesAny(EU_BANNED) || carcinogenHit)
      return "High";
    if (matchesRestricted || matchesAny(ALLERGENS) || endocrineHit) return "Medium";
    return "Low";
  };

  const toxicScanCompounds = data.toxicCompounds.filter(
    (comp) => getToxicRiskLevel(comp) !== "Low"
  );

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 px-2 md:px-4 py-2 md:py-4 space-y-24">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="space-y-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#a38e97] font-bold">
            Biotech Intelligence Report
          </p>
          <h2
            className="text-5xl md:text-6xl leading-[0.92] text-[#22191d]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {data.productName}
          </h2>
          <p className="text-lg text-[#6f5f66]">
            Precision cosmetic safety analysis powered by AI and regulatory cross-checking.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-[#7f6f75]">
            <span className="px-3 py-1 rounded-full bg-white/65 border border-white/80">
              Brand: {data.brand}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/65 border border-white/80">
              {data.ingredients.length} ingredients analyzed
            </span>
            <span className="px-3 py-1 rounded-full bg-white/65 border border-white/80">
              {toxicScanCompounds.length} toxic flags
            </span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute h-52 w-52 rounded-full bg-rose-200/45 blur-3xl" />
          <div className="relative rounded-full w-56 h-56 bg-white/65 backdrop-blur-2xl border border-white/80 shadow-[0_24px_60px_rgba(120,84,94,0.22)] flex items-center justify-center">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={56}
                    outerRadius={68}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    <Cell fill="#f04f8f" />
                    <Cell fill="rgba(240,79,143,0.15)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#957f87] font-bold">
                Safety Score
              </p>
              <p className="text-4xl font-black text-[#31262b]">
                {data.overallSafetyScore}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white/55 backdrop-blur-2xl border border-white/70 p-8 md:p-10 shadow-[0_18px_40px_rgba(128,89,101,0.12)] space-y-10">
        <h3
          className="text-3xl text-[#2b2025]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Safety Overview
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9b8890] font-bold">
                Overall Verdict
              </p>
              <p className="text-base md:text-lg text-[#42353b] leading-relaxed font-medium">
                {data.summary}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-[#6f5f66] font-semibold">
                <span>Confidence in reading image</span>
                <span>{data.trustPercentage}%</span>
              </div>
              <div className="h-[6px] w-full bg-rose-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${data.trustPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9b8890] font-bold">
                Compliance
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openModal("FDA")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    data.fdaCompliance?.isClean
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {data.fdaCompliance?.isClean ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  FDA
                  <BookOpen className="w-3 h-3" />
                </button>

                <button
                  onClick={() => openModal("EU")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    data.euCompliance?.isClean
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}
                >
                  {data.euCompliance?.isClean ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  EU
                  <BookOpen className="w-3 h-3" />
                </button>
              </div>
              {(!data.fdaCompliance?.isClean || !data.euCompliance?.isClean) && (
                <div className="space-y-2">
                  {!data.fdaCompliance?.isClean && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-rose-700 mb-1">FDA Alerts</p>
                      <ul className="text-sm text-rose-800 space-y-1">
                        {data.fdaCompliance.issues.map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!data.euCompliance?.isClean && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-amber-700 mb-1">EU Alerts</p>
                      <ul className="text-sm text-amber-900 space-y-1">
                        {data.euCompliance.issues.map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9b8890] font-bold">
                Toxicity Watchlists
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openModal("CARCINOGENS")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    data.carcinogenStatus?.isClean
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {data.carcinogenStatus?.isClean ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Carcinogens
                  <BookOpen className="w-3 h-3" />
                </button>

                <button
                  onClick={() => openModal("ALLERGENS")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    data.allergenStatus?.isClean
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}
                >
                  {data.allergenStatus?.isClean ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  Allergens
                  <BookOpen className="w-3 h-3" />
                </button>

                <button
                  onClick={() => openModal("ENDOCRINE")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    data.endocrineStatus?.isClean
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  {data.endocrineStatus?.isClean ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Endocrine
                  <BookOpen className="w-3 h-3" />
                </button>
              </div>
              {(!data.carcinogenStatus?.isClean ||
                !data.allergenStatus?.isClean ||
                !data.endocrineStatus?.isClean) && (
                <div className="space-y-2">
                  {!data.carcinogenStatus?.isClean && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-rose-700 mb-1">Carcinogen Alerts</p>
                      {knownCarcinogenMatches.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-bold text-rose-700 uppercase tracking-[0.12em]">
                            Known Carcinogens
                          </p>
                          <ul className="text-sm text-rose-800 space-y-1 mt-1">
                            {knownCarcinogenMatches.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {suspectedCarcinogenMatches.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-[0.12em]">
                            Suspected Carcinogens
                          </p>
                          <ul className="text-sm text-amber-800 space-y-1 mt-1">
                            {suspectedCarcinogenMatches.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {knownCarcinogenMatches.length === 0 &&
                        suspectedCarcinogenMatches.length === 0 && (
                          <ul className="text-sm text-rose-800 space-y-1">
                            {data.carcinogenStatus.issues.map((issue, idx) => (
                              <li key={idx}>• {issue}</li>
                            ))}
                          </ul>
                        )}
                    </div>
                  )}

                  {!data.allergenStatus?.isClean && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-amber-700 mb-1">Allergen Alerts</p>
                      <ul className="text-sm text-amber-900 space-y-1">
                        {data.allergenStatus.issues.map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!data.endocrineStatus?.isClean && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-rose-700 mb-1">Endocrine Alerts</p>
                      <ul className="text-sm text-rose-800 space-y-1">
                        {data.endocrineStatus.issues.map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9b8890] font-bold">
                Risk Summary
              </p>
              <div className="space-y-2 text-sm text-[#54454d]">
                <div className="flex justify-between">
                  <span>High Risk</span>
                  <span className="font-bold text-rose-700">{highIngredients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium Risk</span>
                  <span className="font-bold text-amber-700">{mediumIngredients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Low Risk</span>
                  <span className="font-bold text-emerald-700">{lowIngredients.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowScoreMath((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-left"
              >
                <span className="text-xs uppercase tracking-[0.18em] text-[#9b8890] font-bold">
                  Safety Score Math
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#7e6e75] transition-transform ${
                    showScoreMath ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showScoreMath && (
                <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 space-y-2 text-xs text-[#51444b]">
                  <p className="text-[11px] text-slate-500">
                    Formula: Final Score = clamp(Base Score - Total Penalty, 0, 100)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Base Score = (1 - ((0.5xLow + 2.5xMedium + 5xHigh) / (5xTotal Ingredients))) x 100
                  </p>
                  <div className="flex justify-between">
                    <span>Weighted risk (0.5xL + 2.5xM + 5xH)</span>
                    <span className="font-semibold">
                      {scoreBreakdown.ingredientCounts.low * scoreWeights.low +
                        scoreBreakdown.ingredientCounts.medium * scoreWeights.medium +
                        scoreBreakdown.ingredientCounts.high * scoreWeights.high}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max risk (5xTotal Ingredients)</span>
                    <span className="font-semibold">
                      {scoreBreakdown.ingredientCounts.total * 5}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ingredient counts (L/M/H)</span>
                    <span className="font-semibold">
                      {scoreBreakdown.ingredientCounts.low}/
                      {scoreBreakdown.ingredientCounts.medium}/
                      {scoreBreakdown.ingredientCounts.high}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base score</span>
                    <span className="font-semibold">{scoreBreakdown.baseScore}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 mb-1">
                      Penalties
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>
                          FDA ({scoreBreakdown.penalties.fda.count} x{" "}
                          {scoreBreakdown.penalties.fda.weight})
                        </span>
                        <span>-{scoreBreakdown.penalties.fda.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          EU ({scoreBreakdown.penalties.eu.count} x{" "}
                          {scoreBreakdown.penalties.eu.weight})
                        </span>
                        <span>-{scoreBreakdown.penalties.eu.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Carcinogen ({scoreBreakdown.penalties.carcinogen.count} x{" "}
                          {scoreBreakdown.penalties.carcinogen.weight})
                        </span>
                        <span>-{scoreBreakdown.penalties.carcinogen.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Endocrine ({scoreBreakdown.penalties.endocrine.count} x{" "}
                          {scoreBreakdown.penalties.endocrine.weight})
                        </span>
                        <span>-{scoreBreakdown.penalties.endocrine.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Allergen ({scoreBreakdown.penalties.allergen.count} x{" "}
                          {scoreBreakdown.penalties.allergen.weight})
                        </span>
                        <span>-{scoreBreakdown.penalties.allergen.total}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Total penalty</span>
                      <span className="font-semibold">-{scoreBreakdown.totalPenalty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Raw score</span>
                      <span className="font-semibold">{scoreBreakdown.rawScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final score (0-100)</span>
                      <span className="font-bold">{scoreBreakdown.finalScore}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {toxicScanCompounds.length > 0 && (
          <div className="rounded-2xl bg-rose-50/70 border border-rose-100 px-4 py-3">
            <p className="text-sm text-rose-800 font-semibold">Toxic compounds noted in this scan</p>
            <div className="mt-3 space-y-2">
              {toxicScanCompounds.map((comp, idx) => {
                const riskLevel = getToxicRiskLevel(comp);
                return (
                  <div key={idx} className="rounded-lg bg-white/80 border border-rose-100 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-rose-700">{comp}</p>
                      <span
                        className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                          riskLevel === "High"
                            ? "bg-rose-100 text-rose-700"
                            : riskLevel === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-xs text-[#6d5c64] mt-1">
                      Basis: {getToxicWhyThisLevel(comp)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-12">
        <div className="flex items-center justify-between gap-4">
          <h4
            className="text-4xl text-[#2b2025] flex items-center gap-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <List className="w-6 h-6 text-rose-500" />
            Ingredients
          </h4>
          <span className="text-xs font-bold bg-white/70 border border-white/80 text-[#6f5f66] px-3 py-1 rounded-full">
            {data.ingredients.length} items
          </span>
        </div>

        {highIngredients.length > 0 && (
          <div className="rounded-[2rem] bg-rose-50/80 p-8 shadow-[inset_0_0_28px_rgba(240,79,143,0.10)]">
            <button
              onClick={() => toggleSection("high")}
              className="w-full flex items-center justify-between text-left"
            >
              <h5 className="text-3xl text-rose-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                High Risk
              </h5>
              <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                {highIngredients.length} items
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.high ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.high && (
              <>
                <p className="mt-2 text-sm text-rose-700">{highRiskHeading}</p>
                <div className="mt-4 rounded-xl border border-rose-200 bg-white/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] font-bold text-rose-700">
                    Basis of High Risk Categorization
                  </p>
                  <p className="text-sm text-rose-900 mt-1">
                    Classified as High when ingredient descriptions indicate severe toxicity concerns
                    such as carcinogenicity, endocrine disruption, or other serious long-term health risk.
                    Ingredients matching both endocrine disruptor and carcinogen watchlists are auto-promoted to High.
                  </p>
                </div>
                <div className="mt-8 divide-y divide-rose-200/70">
                  {highIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-6 px-2 transition-all duration-300 hover:bg-rose-100/60 hover:rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="font-bold text-[#2e2025]">{item.name}</span>
                            <IngredientWikiLink ingredientName={item.name} />
                          </div>
                          <p className="text-xs text-rose-700/90">Purpose: {item.purpose}</p>
                          {item.description && (
                            <p className="text-sm text-[#5f4e56] leading-relaxed">
                              <span className="font-semibold text-rose-800">Why this level:</span> {item.description}
                            </p>
                          )}
                          {isDualWatchlistHigh(item.name) && (
                            <p className="text-xs text-rose-700 font-semibold">
                              Auto-promoted to High Risk: listed as both endocrine disruptor and possible carcinogen.
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] uppercase font-black px-2 py-1 rounded-md bg-rose-100 text-rose-700">
                          {isDualWatchlistHigh(item.name) ? "High" : item.hazardLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {mediumIngredients.length > 0 && (
          <div className="rounded-[2rem] bg-amber-50/55 p-8">
            <button
              onClick={() => toggleSection("medium")}
              className="w-full flex items-center justify-between text-left"
            >
              <h5 className="text-2xl text-amber-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Medium Risk
              </h5>
              <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                {mediumIngredients.length} items
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.medium ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.medium && (
              <>
                <p className="mt-2 text-sm text-amber-800">{mediumRiskHeading}</p>
                <div className="mt-4 rounded-xl border border-amber-200 bg-white/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] font-bold text-amber-700">
                    Basis of Medium Risk Categorization
                  </p>
                  <p className="text-sm text-amber-900 mt-1">
                    Classified as Medium when ingredients are linked to irritation, allergy/sensitization,
                    or moderate/concentration-dependent risk rather than severe systemic toxicity.
                  </p>
                </div>
                <div className="mt-8 divide-y divide-amber-200/70">
                  {mediumIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-6 px-2 transition-all duration-300 hover:bg-amber-100/50 hover:rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="font-bold text-[#2e2025]">{item.name}</span>
                            <IngredientWikiLink ingredientName={item.name} />
                          </div>
                          <p className="text-xs text-amber-800/90">Purpose: {item.purpose}</p>
                          {item.description && (
                            <p className="text-sm text-[#5f4e56] leading-relaxed">
                              <span className="font-semibold text-amber-800">Why this level:</span> {item.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] uppercase font-black px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                          {item.hazardLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {lowIngredients.length > 0 && (
          <div className="rounded-[2rem] bg-emerald-50/35 p-8">
            <button
              onClick={() => toggleSection("low")}
              className="w-full flex items-center justify-between text-left"
            >
              <h5 className="text-2xl text-emerald-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Low Risk
              </h5>
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                {lowIngredients.length} items
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.low ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.low && (
              <>
                <p className="mt-2 text-sm text-emerald-800">{lowRiskHeading}</p>
                <div className="mt-4 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] font-bold text-emerald-700">
                    Basis of Low Risk Categorization
                  </p>
                  <p className="text-sm text-emerald-900 mt-1">
                    Classified as Low when ingredients are generally well-tolerated in typical cosmetic use
                    with low toxicity evidence and no major red flags in this scan.
                  </p>
                </div>
                <div className="mt-8 divide-y divide-emerald-200/70">
                  {lowIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-6 px-2 transition-all duration-300 hover:bg-emerald-100/45 hover:rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="font-bold text-[#2e2025]">{item.name}</span>
                            <IngredientWikiLink ingredientName={item.name} />
                          </div>
                          <p className="text-xs text-emerald-800/90">Purpose: {item.purpose}</p>
                          {item.description && (
                            <p className="text-sm text-[#5f4e56] leading-relaxed">
                              <span className="font-semibold text-emerald-800">Why this level:</span> {item.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] uppercase font-black px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                          {item.hazardLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="pt-8">
        <div className="bg-gradient-to-r from-[#4a2f3a] via-[#5b3745] to-[#6c3e50] text-white p-8 md:p-10 rounded-[2rem] shadow-[0_20px_48px_rgba(75,41,54,0.30)]">
          <div className="flex items-start gap-4">
            <div className="bg-white/15 p-3 rounded-xl">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h5 className="text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Recommendation
              </h5>
              <p className="text-rose-100 leading-relaxed max-w-3xl">{data.recommendation}</p>
            </div>
          </div>
        </div>
      </section>

      <RegulatoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialTab={modalTab}
      />
    </div>
  );
};

export default AnalysisResultView;
