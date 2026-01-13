"use client";

import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { formatPrice } from "@/lib/helpers/ad-pricing";

interface RateCardItem {
  id: string;
  name: string;
  nameIt: string;
  size: string;
  position: string;
  positionIt: string;
  prices: {
    "3": number;
    "6": number;
    "9": number;
    "12": number;
  };
  compatibleSlots: string[];
}

const RATE_CARD_DATA: RateCardItem[] = [
  {
    id: "TOP_BANNER",
    name: "TOP BANNER",
    nameIt: "BANNER SUPERIORE",
    size: "728 × 90 px",
    position: "Homepage articles (above the category bar)",
    positionIt: "Articoli homepage (sopra la barra delle categorie)",
    prices: {
      "3": 1800,
      "6": 3300,
      "9": 4800,
      "12": 6000,
    },
    compatibleSlots: ["HEADER"],
  },
  {
    id: "SIDE_BANNER",
    name: "SIDE BANNER",
    nameIt: "BANNER LATERALE",
    size: "250 × 208 px",
    position: "Right side of homepage / right side of articles",
    positionIt: "Lato destro homepage / lato destro articoli",
    prices: {
      "3": 1200,
      "6": 2200,
      "9": 3200,
      "12": 4000,
    },
    compatibleSlots: ["SIDEBAR"],
  },
  {
    id: "INLINE_BANNER",
    name: "INLINE BANNER",
    nameIt: "BANNER IN LINEA",
    size: "728 × 90 px or 992 × 600 px",
    position: "Homepage (4 repetitions) / bottom of article pages",
    positionIt: "Homepage (4 ripetizioni) / fondo pagine articoli",
    prices: {
      "3": 2400,
      "6": 4400,
      "9": 6400,
      "12": 8000,
    },
    compatibleSlots: ["INLINE_ARTICLE"],
  },
  {
    id: "FOOTER_BANNER",
    name: "FOOTER BANNER",
    nameIt: "BANNER PIÈ DI PAGINA",
    size: "728 × 90 px",
    position: "Page footer (all sections)",
    positionIt: "Piè di pagina (tutte le sezioni)",
    prices: {
      "3": 900,
      "6": 1600,
      "9": 2300,
      "12": 3000,
    },
    compatibleSlots: ["FOOTER"],
  },
  {
    id: "TOP_SLIDER",
    name: "TOP SLIDER",
    nameIt: "SLIDER SUPERIORE",
    size: "728 × 90 px",
    position: "Below the category bar / controlled rotation",
    positionIt: "Sotto la barra delle categorie / rotazione controllata",
    prices: {
      "3": 1500,
      "6": 2800,
      "9": 4000,
      "12": 5000,
    },
    compatibleSlots: ["HEADER"],
  },
  {
    id: "FIXED_SIDE_BANNER",
    name: "FIXED SIDE BANNER",
    nameIt: "BANNER LATERALE FISSO",
    size: "250 × 208 px",
    position: "Always fixed on the right / no rotation",
    positionIt: "Sempre fisso a destra / nessuna rotazione",
    prices: {
      "3": 2000,
      "6": 3800,
      "9": 5500,
      "12": 7000,
    },
    compatibleSlots: ["SIDEBAR"],
  },
];

interface RateCardProps {
  selectedSlot?: string;
  selectedType?: string;
  durationMonths?: number;
  onSelect?: (rateCardId: string, adType: string, slot: string) => void;
  startDate?: string;
  endDate?: string;
  availabilityStatus?: Record<string, { isAvailable: boolean; conflictingAd?: { title: string } }>;
}

// Map rate card IDs to ad types and slots
const RATE_CARD_TO_AD_TYPE: Record<string, { type: string; slot: string }> = {
  TOP_BANNER: { type: "BANNER_TOP", slot: "HEADER" },
  SIDE_BANNER: { type: "BANNER_SIDE", slot: "SIDEBAR" },
  INLINE_BANNER: { type: "INLINE", slot: "INLINE_ARTICLE" },
  FOOTER_BANNER: { type: "FOOTER", slot: "FOOTER" },
  TOP_SLIDER: { type: "SLIDER", slot: "HEADER" },
  FIXED_SIDE_BANNER: { type: "STICKY", slot: "SIDEBAR" },
};

export function RateCard({ 
  selectedSlot, 
  selectedType, 
  durationMonths,
  onSelect,
  startDate,
  endDate,
  availabilityStatus = {},
}: RateCardProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelect = (card: RateCardItem) => {
    const mapping = RATE_CARD_TO_AD_TYPE[card.id];
    if (mapping && onSelect) {
      onSelect(card.id, mapping.type, mapping.slot);
    }
  };

  const isSelected = (card: RateCardItem) => {
    const mapping = RATE_CARD_TO_AD_TYPE[card.id];
    return mapping && mapping.type === selectedType && mapping.slot === selectedSlot;
  };

  // Filter rate cards based on selected slot/type
  const filteredRateCards = selectedSlot || selectedType
    ? RATE_CARD_DATA.filter((card) => {
        if (selectedSlot) {
          return card.compatibleSlots.includes(selectedSlot);
        }
        if (selectedType) {
          // Map ad types to rate card IDs
          const typeMap: Record<string, string[]> = {
            BANNER_TOP: ["TOP_BANNER", "TOP_SLIDER"],
            BANNER_SIDE: ["SIDE_BANNER", "FIXED_SIDE_BANNER"],
            INLINE: ["INLINE_BANNER"],
            FOOTER: ["FOOTER_BANNER"],
            SLIDER: ["TOP_SLIDER"],
            STICKY: ["FIXED_SIDE_BANNER"],
          };
          return typeMap[selectedType]?.includes(card.id);
        }
        return true;
      })
    : RATE_CARD_DATA;

  // Calculate price for a specific duration
  const getPriceForDuration = (prices: RateCardItem["prices"], months: number): number => {
    if (months <= 3) return prices["3"];
    if (months <= 6) return prices["6"];
    if (months <= 9) return prices["9"];
    return prices["12"];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {language === "it" ? "Tariffario Pubblicitario" : "Advertising Rate Card"}
        </h3>
        {isAdmin && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            {language === "it" ? "GRATIS" : "FREE"}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {filteredRateCards.map((card) => {
          const isExpanded = expandedItems.includes(card.id);
          const displayPrice = durationMonths
            ? getPriceForDuration(card.prices, durationMonths)
            : null;
          const selected = isSelected(card);
          const availability = availabilityStatus[card.id];
          const isBooked = availability && !availability.isAvailable;

          return (
            <div
              key={card.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                selected
                  ? "border-red-500 bg-red-50 shadow-md"
                  : isBooked
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-full px-4 py-3 flex items-center justify-between transition cursor-pointer ${
                  selected ? "bg-red-50" : isBooked ? "bg-yellow-50" : "hover:bg-gray-50"
                }`}
                onClick={() => handleSelect(card)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-gray-900">
                      {language === "it" ? card.nameIt : card.name}
                    </div>
                    {selected && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
                        {language === "it" ? "Selezionato" : "Selected"}
                      </span>
                    )}
                    {isBooked && (
                      <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-semibold rounded">
                        {language === "it" ? "Prenotato" : "Booked"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {card.size} • {language === "it" ? card.positionIt : card.position}
                  </div>
                  {isBooked && availability?.conflictingAd && (
                    <div className="text-xs text-yellow-700 mt-1 font-medium">
                      {language === "it"
                        ? `Prenotato da: "${availability.conflictingAd.title}"`
                        : `Booked by: "${availability.conflictingAd.title}"`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {displayPrice && (
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${selected ? "text-red-600" : "text-red-600"}`}>
                        {isAdmin ? (
                          <span className="text-green-600">
                            {language === "it" ? "GRATIS" : "FREE"}
                          </span>
                        ) : (
                          formatPrice(displayPrice)
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {durationMonths} {language === "it" ? "mesi" : "months"}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => toggleItem(card.id, e)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                  <div className="pt-3">
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      {language === "it" ? "Prezzi per durata:" : "Pricing by duration:"}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(["3", "6", "9", "12"] as const).map((months) => (
                        <div
                          key={months}
                          className={`p-2 rounded border ${
                            durationMonths && Math.ceil(durationMonths / 3) * 3 === parseInt(months)
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="text-xs text-gray-600 mb-1">
                            {months} {language === "it" ? "mesi" : "months"}
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            {isAdmin ? (
                              <span className="text-green-600">
                                {language === "it" ? "GRATIS" : "FREE"}
                              </span>
                            ) : (
                              formatPrice(card.prices[months])
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            {language === "it"
              ? "Come amministratore, tutti gli annunci sono gratuiti."
              : "As an administrator, all ads are free."}
          </p>
        </div>
      )}
    </div>
  );
}

