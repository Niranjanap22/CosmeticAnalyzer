import React from "react";
import { ExternalLink } from "lucide-react";

interface IngredientWikiLinkProps {
  ingredientName: string;
}

const IngredientWikiLink: React.FC<IngredientWikiLinkProps> = ({ ingredientName }) => {
  const wikipediaUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
    ingredientName.trim()
  )}`;

  return (
    <a
      href={wikipediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-800"
      aria-label={`Open Wikipedia info for ${ingredientName}`}
      title={`Learn more about ${ingredientName} on Wikipedia`}
    >
      Wikipedia <ExternalLink className="h-3 w-3" />
    </a>
  );
};

export default IngredientWikiLink;
