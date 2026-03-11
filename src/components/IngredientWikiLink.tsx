import React from "react";
import { ExternalLink } from "lucide-react";

interface IngredientWikiLinkProps {
  ingredientName: string;
}

const IngredientWikiLink: React.FC<IngredientWikiLinkProps> = ({ ingredientName }) => {
  const query = ingredientName.trim();
  const ingredientQuery = encodeURIComponent(query);
  const wikipediaSearchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${ingredientQuery}&utf8=1&format=json&origin=*`;
  const wikipediaSearchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${ingredientQuery}`;
  const fallbackDataUrl = `https://pubchem.ncbi.nlm.nih.gov/#query=${ingredientQuery}`;

  const handleOpenIngredientInfo = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

    // Open immediately to avoid popup blocking, then navigate after lookup.
    const newWindow = window.open("about:blank", "_blank");
    if (!newWindow) {
      window.open(wikipediaSearchUrl, "_blank");
      return;
    }
    // Security hardening after opening.
    newWindow.opener = null;

    try {
      const res = await fetch(wikipediaSearchApiUrl);
      if (res.ok) {
        const json = await res.json();
        const firstMatchTitle: string | undefined = json?.query?.search?.[0]?.title;
        if (firstMatchTitle) {
          newWindow.location.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(firstMatchTitle.replace(/ /g, "_"))}`;
        } else {
          newWindow.location.href = fallbackDataUrl;
        }
      } else {
        newWindow.location.href = wikipediaSearchUrl;
      }
    } catch {
      newWindow.location.href = wikipediaSearchUrl;
    }
  };

  return (
    <a
      href={wikipediaSearchUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleOpenIngredientInfo}
      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-800"
      aria-label={`Open Wikipedia info for ${ingredientName}`}
      title={`Open ingredient info (Wikipedia, fallback to PubChem)`}
    >
      Wikipedia <ExternalLink className="h-3 w-3" />
    </a>
  );
};

export default IngredientWikiLink;
