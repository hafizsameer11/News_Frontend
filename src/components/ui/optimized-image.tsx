"use client";

import Image, { ImageProps } from "next/image";
import { useMemo, useState, useRef, useEffect } from "react";

/**
 * Optimized Image component that automatically handles localhost URLs in development
 * by disabling optimization for localhost images to avoid Next.js Image Optimization issues
 * Also includes fallback handling for failed image loads
 */
export function OptimizedImage(props: ImageProps & { alt: string }) {
  const { onError, src, alt, ...imageProps } = props;
  const [imageError, setImageError] = useState(false);
  const prevSrcRef = useRef(src);

  // Check for localhost or external domains that might need unoptimized
  const isLocalhost = useMemo(() => {
    if (typeof src === "string") {
      return src.includes("localhost") || src.includes("127.0.0.1");
    }
    return false;
  }, [src]);

  // Disable optimization ONLY for localhost URLs in development to avoid fetch issues
  // In production, enable optimization for all domains including backend
  // MUST be called before any conditional returns (React Hooks rules)
  const shouldUnoptimize = useMemo(() => {
    // Only unoptimize in development for localhost
    if (process.env.NODE_ENV === "development" && isLocalhost) {
      return true;
    }
    // In production, always optimize (Next.js will handle it)
    return false;
  }, [src, isLocalhost]);

  // Reset error state when src changes - use setTimeout to defer
  useEffect(() => {
    if (prevSrcRef.current !== src && imageError) {
      const timer = setTimeout(() => {
        setImageError(false);
      }, 0);
      prevSrcRef.current = src;
      return () => clearTimeout(timer);
    } else {
      prevSrcRef.current = src;
    }
  }, [src, imageError]);

  // Don't render if src is missing or empty
  // Check for null, undefined, empty string, or empty string after trim
  const isValidSrc = src !== null && src !== undefined && src !== "" && (typeof src !== "string" || src.trim() !== "");
  
  if (!isValidSrc) {
    const fill = "fill" in props && props.fill;
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${props.className || ""}`}
        style={
          fill
            ? { position: "absolute", inset: 0 }
            : "width" in props && "height" in props
              ? { width: props.width, height: props.height }
              : {}
        }
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Image not available</p>
        </div>
      </div>
    );
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imageError) {
      setImageError(true);
      onError?.(e);
    }
  };

  // If image failed to load, show placeholder
  if (imageError) {
    const fill = "fill" in props && props.fill;
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${props.className || ""}`}
        style={
          fill
            ? { position: "absolute", inset: 0 }
            : "width" in props && "height" in props
              ? { width: props.width, height: props.height }
              : {}
        }
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Image not available</p>
        </div>
      </div>
    );
  }

  // Add style to maintain aspect ratio if width or height is modified via CSS
  // Check if className modifies dimensions (w-full, h-auto, etc.)
  const hasWidthHeightModification = 
    imageProps.className?.includes("w-full") || 
    imageProps.className?.includes("h-auto") ||
    imageProps.className?.includes("h-full") ||
    imageProps.className?.includes("w-auto");
  
  // For fill images, don't add width/height auto as they use fill
  const isFill = "fill" in props && props.fill;
  const style = hasWidthHeightModification && !isFill
    ? { ...imageProps.style, width: "auto", height: "auto" }
    : imageProps.style;

  // Ensure src and alt are passed correctly to Image component
  // Add sizes prop for better responsive image loading if not provided
  const sizes = imageProps.sizes || (isFill ? "100vw" : undefined);
  
  // Only add placeholder if not already provided and not unoptimized
  const placeholderProps = shouldUnoptimize || imageProps.placeholder
    ? {}
    : { placeholder: "blur" as const, blurDataURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==" };
  
  return (
    <Image
      {...imageProps}
      src={src}
      alt={alt}
      style={style}
      unoptimized={shouldUnoptimize}
      onError={handleError}
      sizes={sizes}
      {...placeholderProps}
    />
  );
}

