"use client";

import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCategories } from "@/lib/hooks/useCategories";

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    categoryIds?: string[];
    startDate?: string;
    endDate?: string;
    sortBy?: "relevance" | "date" | "views";
  }) => void;
  className?: string;
}

export function SearchFilters({ onFiltersChange, className = "" }: SearchFiltersProps) {
  const { language } = useLanguage();
  const { data: categoriesData } = useCategories(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "views">("relevance");

  // Flatten categories
  const flattenCategories = (cats: any[]): any[] => {
    const result: any[] = [];
    for (const cat of cats || []) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children));
      }
    }
    return result;
  };

  const allCategories = categoriesData?.data ? flattenCategories(categoriesData.data) : [];

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    onFiltersChange({
      categoryIds: newCategories.length > 0 ? newCategories : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
    });
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    onFiltersChange({
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      startDate: type === "start" ? value : startDate || undefined,
      endDate: type === "end" ? value : endDate || undefined,
      sortBy,
    });
  };

  const handleSortChange = (value: "relevance" | "date" | "views") => {
    setSortBy(value);
    onFiltersChange({
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: value,
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setStartDate("");
    setEndDate("");
    setSortBy("relevance");
    onFiltersChange({});
  };

  const hasActiveFilters = selectedCategories.length > 0 || startDate || endDate || sortBy !== "relevance";

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {language === "it" ? "Filtri" : "Filters"}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 transition"
          >
            {language === "it" ? "Cancella" : "Clear"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "it" ? "Ordina per" : "Sort by"}
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as "relevance" | "date" | "views")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900"
          >
            <option value="relevance">
              {language === "it" ? "Rilevanza" : "Relevance"}
            </option>
            <option value="date">{language === "it" ? "Data" : "Date"}</option>
            <option value="views">{language === "it" ? "Visualizzazioni" : "Views"}</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "it" ? "Intervallo Date" : "Date Range"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {language === "it" ? "Da" : "From"}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {language === "it" ? "A" : "To"}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "it" ? "Categorie" : "Categories"}
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {allCategories.slice(0, 10).map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                />
                <span className="text-sm text-gray-700">
                  {language === "it" ? category.nameIt : category.nameEn}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

