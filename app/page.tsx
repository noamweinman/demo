"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from 'next/image'

interface Tag {
  tag: string
  tagType: string
  description: string
}

export default function ArticleFetcher() {
  const [articleId, setArticleId] = useState("")
  const [articleBody, setArticleBody] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!articleId.trim()) {
      setError("Please enter an article ID")
      return
    }

    setIsLoading(true)
    setError("")
    setArticleBody("")
    setTags([])

    try {
      const response = await fetch(`/api/fetch-article?id=${articleId}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setArticleBody(data.body)
    } catch (err) {
      setError(`Failed to fetch article: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTags = async () => {
    if (!articleBody) {
      setError("No article content to analyze")
      return
    }

    setIsGeneratingTags(true)
    setError("")

    try {
      const response = await fetch("/api/generate-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: articleBody }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received tags data:', data)
      
      if (Array.isArray(data.tags)) {
        setTags(data.tags)
      } else {
        console.error('Unexpected tags format:', data.tags)
        setError('Received invalid tags format from server')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(`Failed to generate tags: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsGeneratingTags(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-50">
      <div className="mb-4">
        <img
          src="https://play-lh.googleusercontent.com/DZu20eDTCw7UcOC3a7gM5ozILHa6i5sMKDt8YVvMv-ZzlBqPzp_D9CjwGU_AyDUlw-nt=w3840-h2160-rw"
          alt="Taboola News"
          className="w-full max-w-xs mx-auto"
        />
      </div>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Taboola News - GenAI Keywords engine</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="articleId" className="block text-sm font-medium text-gray-700 mb-1">
                Article ID
              </label>
              <div className="flex space-x-2">
                <Input
                  id="articleId"
                  type="text"
                  value={articleId}
                  onChange={(e) => setArticleId(e.target.value)}
                  placeholder="Enter article ID"
                  className="flex-grow"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Fetch Article"
                  )}
                </Button>
              </div>
            </div>
          </form>

          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

          {articleBody && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Article Content:</h3>
                <div className="p-4 bg-white border border-gray-200 rounded-md max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {articleBody}
                </div>
              </div>

              {tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Generated Tags:</h3>
                  <div className="space-y-3">
                    {tags.map((tag, index) => (
                      <div key={index} className="p-3 bg-white border border-gray-200 rounded-md">
                        <div className="flex justify-between">
                          <span className="font-medium">{tag.tag}</span>
                          <span className="text-sm text-gray-500">{tag.tagType}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{tag.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Enter an article ID to fetch its content and generate tags using AI.
          </span>
          {articleBody && (
            <Button onClick={generateTags} disabled={isGeneratingTags}>
              {isGeneratingTags ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tags...
                </>
              ) : (
                "Generate Tags"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

