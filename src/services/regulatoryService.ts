import { FDA_BANNED, EU_BANNED, EU_RESTRICTED } from '../data/regulatoryData';
import { RegulatoryStatus } from '../types/types';

export const checkCompliance = (ingredients: string[]): { fda: RegulatoryStatus, eu: RegulatoryStatus } => {
  const fdaIssues: string[] = [];
  const euIssues: string[] = [];

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
  };
};