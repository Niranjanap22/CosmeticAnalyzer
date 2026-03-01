import { FDA_BANNED, EU_BANNED, EU_RESTRICTED, CARCINOGENS, ALLERGENS, ENDOCRINE_DISRUPTORS } from '../data/regulatoryData';
import { RegulatoryStatus } from '../types/types';

export const checkCompliance = (ingredients: string[]): { fda: RegulatoryStatus, eu: RegulatoryStatus, carcinogens: RegulatoryStatus, allergens: RegulatoryStatus, endocrine: RegulatoryStatus } => {
  const fdaIssues: string[] = [];
  const euIssues: string[] = [];
  const carcinogenIssues: string[] = [];
  const allergenIssues: string[] = [];
  const endocrineIssues: string[] = [];

  ingredients.forEach((ingredient) => {
    const normalized = ingredient.toLowerCase().trim();

    // FDA Checks
    for (const banned of FDA_BANNED) {
      if (normalized.includes(banned)) {
        fdaIssues.push(`Banned: ${ingredient} (matches "${banned}")`);
      }
    }

    // EU Checks
    for (const banned of EU_BANNED) {
      if (normalized.includes(banned)) {
        euIssues.push(`Banned: ${ingredient} (matches "${banned}")`);
      }
    }

    for (const [restricted, details] of EU_RESTRICTED) {
      if (normalized.includes(restricted)) {
        euIssues.push(`Restricted: ${ingredient} - ${details}`);
      }
    }

    // Carcinogen Checks
    for (const carcinogen of CARCINOGENS) {
      if (normalized.includes(carcinogen)) {
        carcinogenIssues.push(`Potential Carcinogen: ${ingredient} (matches "${carcinogen}")`);
      }
    }

    // Allergen Checks
    for (const allergen of ALLERGENS) {
      if (normalized.includes(allergen)) {
        allergenIssues.push(`Common Allergen: ${ingredient} (matches "${allergen}")`);
      }
    }

    // Endocrine Disruptor Checks
    for (const edc of ENDOCRINE_DISRUPTORS) {
      if (normalized.includes(edc)) {
        endocrineIssues.push(`Endocrine Disruptor: ${ingredient} (matches "${edc}")`);
      }
    }
  });

  return {
    fda: {
      isClean: fdaIssues.length === 0,
      issues: [...new Set(fdaIssues)], // Deduplicate
    },
    eu: {
      isClean: euIssues.length === 0,
      issues: [...new Set(euIssues)], // Deduplicate
    },
    carcinogens: {
      isClean: carcinogenIssues.length === 0,
      issues: [...new Set(carcinogenIssues)],
    },
    allergens: {
      isClean: allergenIssues.length === 0,
      issues: [...new Set(allergenIssues)],
    },
    endocrine: {
      isClean: endocrineIssues.length === 0,
      issues: [...new Set(endocrineIssues)],
    },
  };
};