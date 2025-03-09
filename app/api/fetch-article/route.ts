import { type NextRequest, NextResponse } from "next/server"

// Function to strip HTML tags from a string
function stripHtmlTags(html: string): string {
  // First, replace common HTML entities
  const entitiesReplaced = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Then remove all HTML tags
  return entitiesReplaced
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim() // Trim leading/trailing whitespace
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Article ID is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://magazine-api.taboola.com/content/article/${id}/body`)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch article: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the content as text instead of trying to parse as JSON
    const htmlContent = await response.text()

    // Clean the HTML content
    const cleanedText = stripHtmlTags(htmlContent)

    return NextResponse.json({ body: cleanedText })
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 })
  }
}

