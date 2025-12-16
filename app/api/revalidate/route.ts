import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * On-Demand Revalidation API
 * 
 * This API allows the backend to trigger cache revalidation when content is updated.
 * 
 * Usage:
 * POST /api/revalidate?secret=<REVALIDATION_SECRET>&path=/news/123
 * POST /api/revalidate?secret=<REVALIDATION_SECRET>&path=/category/politics&tag=news
 * 
 * Security: Protected by REVALIDATION_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  try {
    // Get secret from query params
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get("secret");
    const path = searchParams.get("path");
    const tag = searchParams.get("tag");

    // Verify secret
    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (!expectedSecret) {
      console.error("REVALIDATION_SECRET is not set in environment variables");
      return NextResponse.json(
        { error: "Revalidation secret not configured" },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Invalid secret" },
        { status: 401 }
      );
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    // Revalidate by tag (if provided)
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
    }

    // If no path or tag provided, revalidate common paths
    if (!path && !tag) {
      // Revalidate homepage
      revalidatePath("/");
      // Revalidate news listing (if exists)
      revalidatePath("/news");
      // Revalidate all categories
      revalidatePath("/category", "layout");
      console.log("Revalidated common paths");
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path: path || "common paths",
      tag: tag || null,
    });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json(
      { error: "Error revalidating" },
      { status: 500 }
    );
  }
}

// Allow GET for testing (same security)
export async function GET(request: NextRequest) {
  return POST(request);
}

