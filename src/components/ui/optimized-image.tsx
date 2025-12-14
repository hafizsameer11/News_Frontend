"use client";

import Image, { ImageProps } from "next/image";
import { useMemo, useState, useRef, useEffect } from "react";

/**
 * Optimized Image component that automatically handles localhost URLs in development
 * by disabling optimization for localhost images to avoid Next.js Image Optimization issues
 * Also includes fallback handling for failed image loads
 */
export function OptimizedImage(props: ImageProps & { alt: string }) {
  const { onError, src, ...imageProps } = props;
  const [imageError, setImageError] = useState(false);
  const prevSrcRef = useRef(src);

  // Check for localhost - must be called unconditionally
  const isLocalhost = useMemo(() => {
    if (typeof src === "string") {
      return src.includes("localhost") || src.includes("127.0.0.1");
    }
    return false;
  }, [src]);

  // Reset error state when src changes - moved to useEffect
  useEffect(() => {
    if (prevSrcRef.current !== src && imageError) {
      setImageError(false);
    }
    prevSrcRef.current = src;
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

  // In development, disable optimization for localhost URLs to avoid fetch issues
  const shouldUnoptimize = process.env.NODE_ENV === "development" && isLocalhost;

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

  // Ensure src is passed correctly to Image component
  return <Image {...imageProps} src={src} style={style} unoptimized={shouldUnoptimize} onError={handleError} />;
}

