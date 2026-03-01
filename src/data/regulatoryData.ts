export const FDA_BANNED = new Set([
  "bithionol",
  "chloroform",
  "chlorofluorocarbon",
  "halogenated salicylanilides",
  "hexachlorophene",
  "mercury",
  "methylene chloride",
  "vinyl chloride",
  "zirconium",
]);

export const EU_BANNED = new Set([
  "mercury",
  "lead",
  "arsenic",
  "cadmium",
  "lilial",
  "butylphenyl methylpropional",
  "isopropylparaben",
  "isobutylparaben",
  "phenylparaben",
  "benzylparaben",
  "pentylparaben",
]);

export const EU_RESTRICTED = new Map<string, string>([
  ["formaldehyde", "Max 0.2% (0.1% oral); warn if >0.05%"],
  ["methylparaben", "Restricted (strict limits)"],
  ["ethylparaben", "Restricted (strict limits)"],
  ["propylparaben", "Restricted (strict limits)"],
  ["butylparaben", "Restricted (strict limits)"],
  ["triclosan", "Allowed only in specific products/limits"],
  ["hydroquinone", "Banned in skin; Nail products only (0.02%)"],
  ["resorcinol", "Hair dyes only"],
  ["oxybenzone", "Max 6% (face/body), 0.5% (lips)"],
  ["benzophenone-3", "Max 6% (face/body), 0.5% (lips)"],
  ["homosalate", "Max 7.34%"],
  ["octocrylene", "Max 9%"],
  ["nitrosamines", "Max 50 µg/kg"],
]);