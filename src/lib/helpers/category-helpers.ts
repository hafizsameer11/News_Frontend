import { Category } from "@/types/category.types";

/**
 * Recursively flatten hierarchical categories into a flat array
 * @param categories - Array of categories (may contain nested children)
 * @returns Flat array of all categories including subcategories
 */
export function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of categories) {
    // Create a copy without children to avoid circular references
    const { children, ...categoryWithoutChildren } = cat;
    result.push(categoryWithoutChildren as Category);
    
    // Recursively flatten children
    if (children && Array.isArray(children) && children.length > 0) {
      result.push(...flattenCategories(children));
    }
  }
  return result;
}

/**
 * Get only root categories (categories without a parent)
 * @param categories - Array of categories (may contain nested children)
 * @returns Array of root categories only
 */
export function getRootCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => !cat.parentId);
}

/**
 * Get subcategories for a specific category
 * @param categoryId - ID of the parent category
 * @param categories - Array of categories (may contain nested children)
 * @returns Array of subcategories
 */
export function getSubcategories(categoryId: string, categories: Category[]): Category[] {
  const flat = flattenCategories(categories);
  return flat.filter((cat) => cat.parentId === categoryId);
}

/**
 * Find a category by ID in a hierarchical or flat array
 * @param id - Category ID to find
 * @param categories - Array of categories (may contain nested children)
 * @returns Category if found, null otherwise
 */
export function findCategoryById(id: string, categories: Category[]): Category | null {
  const flat = flattenCategories(categories);
  return flat.find((cat) => cat.id === id) || null;
}

/**
 * Get the parent category for a given category
 * @param parentId - ID of the parent category
 * @param categories - Array of categories (may contain nested children)
 * @returns Parent category if found, null otherwise
 */
export function getParentCategory(
  parentId: string | null | undefined,
  categories: Category[]
): Category | null {
  if (!parentId) return null;
  const flat = flattenCategories(categories);
  return flat.find((cat) => cat.id === parentId) || null;
}

/**
 * Get the full category path from root to current category
 * @param category - The category to get the path for
 * @param categories - Array of categories (may contain nested children)
 * @returns Array of categories representing the path (root first, current last)
 */
export function getCategoryPath(category: Category, categories: Category[]): Category[] {
  const path: Category[] = [];
  const flat = flattenCategories(categories);
  
  let current: Category | null = category;
  
  // Build path by traversing up the parent chain
  while (current) {
    path.unshift(current);
    if (current.parentId) {
      current = flat.find((cat) => cat.id === current!.parentId) || null;
    } else {
      current = null;
    }
  }
  
  return path;
}

/**
 * Get the depth level of a category (0 = root, 1 = child, 2 = grandchild, etc.)
 * @param category - The category to get the level for
 * @param categories - Array of categories (may contain nested children)
 * @returns The depth level (0-based)
 */
export function getCategoryLevel(category: Category, categories: Category[]): number {
  if (!category.parentId) return 0;
  
  const flat = flattenCategories(categories);
  let level = 0;
  let current: Category | null = category;
  
  // Traverse up the parent chain to count levels
  while (current && current.parentId) {
    level++;
    current = flat.find((cat) => cat.id === current!.parentId) || null;
  }
  
  return level;
}

/**
 * Get all subcategories recursively up to a maximum depth
 * @param categoryId - ID of the parent category
 * @param categories - Array of categories (may contain nested children)
 * @param maxDepth - Maximum depth to traverse (default: 3, 0 = unlimited)
 * @param currentDepth - Current depth (internal use)
 * @returns Array of all descendant categories
 */
export function getSubcategoriesRecursive(
  categoryId: string,
  categories: Category[],
  maxDepth: number = 3,
  currentDepth: number = 0
): Category[] {
  if (maxDepth > 0 && currentDepth >= maxDepth) {
    return [];
  }
  
  const flat = flattenCategories(categories);
  const directChildren = flat.filter((cat) => cat.parentId === categoryId);
  const result: Category[] = [...directChildren];
  
  // Recursively get children of children
  for (const child of directChildren) {
    const grandchildren = getSubcategoriesRecursive(
      child.id,
      categories,
      maxDepth,
      currentDepth + 1
    );
    result.push(...grandchildren);
  }
  
  return result;
}

/**
 * Validate that a category doesn't exceed the maximum depth
 * @param category - The category to validate
 * @param categories - Array of categories (may contain nested children)
 * @param maxDepth - Maximum allowed depth (default: 3, meaning 0=root, 1=child, 2=grandchild, 3=great-grandchild)
 * @returns true if depth is valid, false if it exceeds maxDepth
 */
export function validateCategoryDepth(
  category: Category,
  categories: Category[],
  maxDepth: number = 3
): boolean {
  const level = getCategoryLevel(category, categories);
  return level < maxDepth;
}

/**
 * Get the depth that would result if a category is assigned a specific parent
 * @param parentId - ID of the potential parent category
 * @param categories - Array of categories (may contain nested children)
 * @returns The depth level that would result (0 = root, 1 = child, etc.)
 */
export function getDepthWithParent(
  parentId: string | null | undefined,
  categories: Category[]
): number {
  if (!parentId) return 0;
  
  const flat = flattenCategories(categories);
  const parent = flat.find((cat) => cat.id === parentId);
  if (!parent) return 0;
  
  return getCategoryLevel(parent, categories) + 1;
}

/**
 * Build a full tree structure from categories (preserves hierarchical structure)
 * @param categories - Array of categories (may be flat or hierarchical)
 * @returns Array of root categories with nested children
 */
export function getCategoryTree(categories: Category[]): Category[] {
  // If categories already have children, assume they're already in tree structure
  if (categories.some((cat) => cat.children && Array.isArray(cat.children))) {
    return categories;
  }
  
  // Build tree from flat array
  const flat = flattenCategories(categories);
  const categoryMap = new Map<string, Category & { children?: Category[] }>();
  const rootCategories: Category[] = [];
  
  // First pass: create map of all categories
  flat.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });
  
  // Second pass: build tree structure
  flat.forEach((cat) => {
    const categoryWithChildren = categoryMap.get(cat.id)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });
  
  return rootCategories;
}

/**
 * Get category breadcrumb path as a string (e.g., "Sports > Football > Serie A")
 * @param category - The category to get the breadcrumb for
 * @param categories - Array of categories (may contain nested children)
 * @param separator - Separator between category names (default: " > ")
 * @returns Breadcrumb string
 */
export function getCategoryBreadcrumb(
  category: Category,
  categories: Category[],
  separator: string = " > "
): string {
  const path = getCategoryPath(category, categories);
  // Remove the current category from path (only show parents)
  const parentPath = path.slice(0, -1);
  return parentPath.map((cat) => cat.nameEn).join(separator);
}

/**
 * Get category level (works with both flat and hierarchical data)
 * Enhanced version that handles both data structures
 * @param category - The category to get the level for
 * @param categories - Array of categories (may be flat or hierarchical)
 * @returns The depth level (0-based)
 */
export function getCategoryLevelEnhanced(
  category: Category,
  categories: Category[]
): number {
  // If category has no parent, it's root (level 0)
  if (!category.parentId) return 0;
  
  // Use existing function which works with both structures
  return getCategoryLevel(category, categories);
}

/**
 * Filter categories by level
 * @param categories - Array of categories (may contain nested children)
 * @param level - Level to filter by (0 = root, 1 = child, etc.)
 * @returns Array of categories at the specified level
 */
export function filterCategoriesByLevel(
  categories: Category[],
  level: number
): Category[] {
  const flat = flattenCategories(categories);
  return flat.filter((cat) => getCategoryLevel(cat, categories) === level);
}

/**
 * Build category tree with support for 4 levels deep
 * Enhanced version that ensures all 4 levels are properly structured
 * @param categories - Array of categories (may be flat or hierarchical)
 * @returns Array of root categories with nested children up to 4 levels
 */
export function buildCategoryTree(categories: Category[]): Category[] {
  return getCategoryTree(categories);
}

