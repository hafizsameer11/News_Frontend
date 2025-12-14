"use client";

import Link from "next/link";
import { useCategories } from "@/lib/hooks/useCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";

interface RelatedCategoriesProps {
  currentCategoryId: string;
  currentCategoryParentId?: string | null;
  className?: string;
}

export function RelatedCategories({
  currentCategoryId,
  currentCategoryParentId,
  className = "",
}: RelatedCategoriesProps) {
  const { language } = useLanguage();
  const { data: categoriesData, isLoading } = useCategories(true);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-bold mb-4 text-gray-900">
          {language === "it" ? "Categorie Correlate" : "Related Categories"}
        </h3>
        <Loading />
      </div>
    );
  }

  if (!categoriesData?.data) {
    return null;
  }

  // Flatten categories
  const flattenCategories = (cats: any[]): any[] => {
    const result: any[] = [];
    for (const cat of cats) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children));
      }
    }
    return result;
  };

  const allCategories = flattenCategories(categoriesData.data);

  // Get related categories: siblings (same parent) or popular categories
  let relatedCategories = allCategories.filter(
    (cat) =>
      cat.id !== currentCategoryId &&
      (currentCategoryParentId
        ? cat.parentId === currentCategoryParentId
        : !cat.parentId) // Siblings or top-level categories
  );

  // If no siblings, get other popular categories (limit to 6)
  if (relatedCategories.length === 0) {
    relatedCategories = allCategories
      .filter((cat) => cat.id !== currentCategoryId)
      .slice(0, 6);
  } else {
    relatedCategories = relatedCategories.slice(0, 6);
  }

  if (relatedCategories.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-bold mb-4 text-gray-900">
        {language === "it" ? "Categorie Correlate" : "Related Categories"}
      </h3>
      <ul className="space-y-2">
        {relatedCategories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/category/${category.slug}`}
              className="block px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded transition"
            >
              {language === "it" ? category.nameIt : category.nameEn}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

