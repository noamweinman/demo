import { NextResponse, type NextRequest } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)

    const { text } = body

    if (!text) {
      console.log('Missing text in request')
      return NextResponse.json({ error: "Article text is required" }, { status: 400 })
    }

    const prompt = `Extract main tags for this article: ${text}
Standardize the tags according to these rules:
  Use lowercase.
  Use singular nouns.
  Expand abbreviations.
  Group synonyms under the most common term (e.g., 'AI' and 'Artificial Intelligence' should both be 'artificial intelligence')
  Return a maximum of 5 tags
  Exclude general tags like 'technology' or 'business'.
  Output should be in JSON format as an array of objects, each containing:
  1. tag - name of the tag
  2. tagType - type of the tag
  3. description - short description about the tag non related to the article`

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a professional content tagger. Always respond with valid JSON array of tag objects."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      model: "gpt-3.5-turbo",
    })

    try {
      const content = completion.choices[0].message.content || ""
      console.log('OpenAI response:', content)
      
      const cleanedJson = content.replace(/```json\n?|```/g, "").trim()
      console.log('Cleaned JSON:', cleanedJson)
      
      const parsedTags = JSON.parse(cleanedJson)
      console.log('Parsed tags:', parsedTags)
      
      // Ensure parsedTags is an array
      const tagsArray = Array.isArray(parsedTags) ? parsedTags : [parsedTags]
      
      return NextResponse.json({ tags: tagsArray })
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ 
        error: "Failed to parse AI response",
        rawResponse: completion.choices[0].message.content 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating tags:", error)
    return NextResponse.json({ error: "Failed to generate tags" }, { status: 500 })
  }
}

