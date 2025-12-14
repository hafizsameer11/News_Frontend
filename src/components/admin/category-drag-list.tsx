"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Category } from "@/types/category.types";
import { getCategoryBreadcrumb, getCategoryLevel } from "@/lib/helpers/category-helpers";

interface CategoryDragListProps {
  categories: Category[];
  onReorder: (newOrder: Array<{ id: string; order: number }>) => void;
  parentId?: string | null;
}

interface SortableCategoryItemProps {
  category: Category;
  allCategories: Category[];
}

function SortableCategoryItem({ category, allCategories }: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const level = getCategoryLevel(category, allCategories);
  const breadcrumb = category.parentId 
    ? getCategoryBreadcrumb(category, allCategories)
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border-2 rounded-lg transition-all ${
        isDragging 
          ? "border-blue-400 shadow-lg scale-105" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded transition"
        aria-label="Drag to reorder"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{category.nameEn}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Level {level}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
            Order: {category.order}
          </span>
          {breadcrumb && (
            <span className="text-xs text-gray-500 truncate" title={breadcrumb}>
              {breadcrumb}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CategoryDragList({ categories, onReorder, parentId }: CategoryDragListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);

      // Create order updates - maintain order within same parent level
      const orderUpdates = reorderedCategories.map((cat, index) => ({
        id: cat.id,
        order: index,
      }));

      onReorder(orderUpdates);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <p>No categories to reorder</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {categories.map((category) => (
            <SortableCategoryItem 
              key={category.id} 
              category={category} 
              allCategories={categories}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

