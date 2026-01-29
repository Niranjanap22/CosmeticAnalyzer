// Simple mock toxicity db and weighted scoring
const hazardDB = {
  "paraben": { risk: 7, category: "Preservative", notes: "May be endocrine disruptor" },
  "methylparaben": { risk: 7, category: "Preservative", notes: "Use with caution" },
  "propylparaben": { risk: 7, category: "Preservative", notes: "Linked to irritation" },
  "phthalate": { risk: 8, category: "Plasticizer", notes: "Potential endocrine disruptor" },
  "formaldehyde": { risk: 10, category: "Carcinogen", notes: "Highly toxic; restricted" },
  "bht": { risk: 6, category: "Antioxidant", notes: "Possible carcinogen in high doses" }
  // Extend with more entries or fetch remote DB
};

export function normalizeIngredient(name) {
  return name.toLowerCase().replace(/\b(and|or|with)\b/g, "").replace(/[^\w\s-]/g, "").trim();
}

export function analyzeIngredients(list) {
  const ingredients = list.map((raw) => {
    const name = normalizeIngredient(raw);
    let matched = null;
    // Simple substring match for demonstration
    for (const key of Object.keys(hazardDB)) {
      if (name.includes(key)) {
        matched = { name: raw, normalized: name, ...hazardDB[key] };
        break;
      }
    }
    if (!matched) {
      matched = { name: raw, normalized: name, risk: 1, category: "Unknown", notes: "No immediate flags" };
    }
    return matched;
  });

  // Weighted average score 0-10
  const total = ingredients.reduce((acc, it) => acc + it.risk, 0);
  const score = Math.max(0, Math.round((Math.max(0, 10 - total / ingredients.length)) * 10) / 10);

  return { ingredients, score };
}