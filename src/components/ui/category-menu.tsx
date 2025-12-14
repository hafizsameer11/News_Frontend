"use client";

import { Category } from "@/types/category.types";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";

interface CategoryMenuProps {
  categories: Category[];
}

export function CategoryMenu({ categories }: CategoryMenuProps) {
  const { language } = useLanguage();
  
  return (
    <div className="bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-4 py-2 bg-white rounded-lg hover:bg-red-600 hover:text-white transition font-medium text-gray-700"
            >
              {language === "it" ? category.nameIt : category.nameEn}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

