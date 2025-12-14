// Export utility functions

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get file extension from format
 */
export function getFileExtension(format: "csv" | "json"): string {
  return format === "csv" ? "csv" : "json";
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  type: string,
  format: "csv" | "json",
  date?: Date
): string {
  const dateStr = date
    ? date.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const extension = getFileExtension(format);
  return `${type}-${dateStr}.${extension}`;
}

