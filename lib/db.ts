import "server-only"
import { createClient } from "@vercel/kv"
import { z } from "zod"

// At the top of the file, add this code to check for environment variables and provide fallbacks

// Check if KV environment variables are set, otherwise use fallback values for preview
const KV_REST_API_URL = process.env.KV_REST_API_URL || "https://fake-kv-url.vercel-storage.com"
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || "fake_token_for_preview_only"

// If using fallbacks, log a warning
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.warn(
    "⚠️ KV_REST_API_URL or KV_REST_API_TOKEN environment variables not set. Using fake values for preview. KV operations will not work properly.",
  )
}

// Replace any existing kv initialization with this:
export const kv = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
})

// Story page schema
export const StoryPageSchema = z.object({
  text: z.string(),
  imagePrompt: z.string(),
})

// Story content schema
export const StoryContentSchema = z.object({
  title: z.string(),
  pages: z.array(StoryPageSchema),
  moral: z.string().optional(),
})

// Story schema
export const StorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  prompt: z.string(),
  age: z.string(),
  status: z.enum(["generating", "generating_story", "generating_images", "complete", "failed"]),
  visibility: z.enum(["public", "unlisted"]).default("public"),
  storyContent: z.string().optional(), // This is a JSON string
  images: z.string().optional(), // This is a JSON string
  createdAt: z.string(),
  completedAt: z.string().optional(),
  deletionToken: z.string(),
  error: z.string().optional(),
})

export type Story = z.infer<typeof StorySchema>
export type StoryContent = z.infer<typeof StoryContentSchema>
export type StoryPage = z.infer<typeof StoryPageSchema>

// CRUD operations for stories

/**
 * Create a new story
 */
export async function createStory(storyData: Partial<Story>): Promise<Story> {
  if (!storyData.id) {
    console.error(`[DB] Error: Story ID is required`)
    throw new Error("Story ID is required")
  }

  // Ensure storyContent is a string if provided
  if (storyData.storyContent !== undefined) {
    if (typeof storyData.storyContent !== "string") {
      try {
        storyData.storyContent = JSON.stringify(storyData.storyContent)
      } catch (error) {
        console.error(`[DB] Error stringifying storyContent:`, error)
        storyData.storyContent = "{}"
      }
    }
  }

  // Ensure images is a string if provided
  if (storyData.images !== undefined) {
    if (typeof storyData.images !== "string") {
      try {
        storyData.images = JSON.stringify(storyData.images)
      } catch (error) {
        console.error(`[DB] Error stringifying images:`, error)
        storyData.images = "[]"
      }
    }
  }

  await kv.hset(`story:${storyData.id}`, storyData)

  return storyData as Story
}

/**
 * Get a story by ID
 */
export async function getStory(id: string): Promise<Story | null> {
  const storyData = await kv.hgetall(`story:${id}`)

  if (!storyData) {
    return null
  }

  // Validate the data against the schema
  try {
    return StorySchema.parse(storyData)
  } catch (error) {
    console.error(`[DB] Invalid story data:`, error)

    // Try to fix common issues before returning
    if (storyData.storyContent !== undefined && typeof storyData.storyContent !== "string") {
      try {
        storyData.storyContent = JSON.stringify(storyData.storyContent)
      } catch (e) {
        console.error(`[DB] Error stringifying storyContent:`, e)
        storyData.storyContent = "{}"
      }
    }

    if (storyData.images !== undefined && typeof storyData.images !== "string") {
      try {
        storyData.images = JSON.stringify(storyData.images)
      } catch (e) {
        console.error(`[DB] Error stringifying images:`, e)
        storyData.images = "[]"
      }
    }

    return storyData as Story
  }
}

/**
 * Update a story
 */
export async function updateStory(id: string, data: Partial<Story>): Promise<Story | null> {
  const storyExists = await kv.exists(`story:${id}`)

  if (!storyExists) {
    return null
  }

  // Create a copy of the data to avoid modifying the original
  const updatedData = { ...data }

  // Ensure storyContent is a string if provided
  if (updatedData.storyContent !== undefined) {
    if (typeof updatedData.storyContent !== "string") {
      try {
        updatedData.storyContent = JSON.stringify(updatedData.storyContent)
      } catch (error) {
        console.error(`[DB] Error stringifying storyContent:`, error)
        // If stringification fails, set to empty object string
        updatedData.storyContent = "{}"
      }
    }
  }

  // Ensure images is a string if provided
  if (updatedData.images !== undefined) {
    if (typeof updatedData.images !== "string") {
      try {
        updatedData.images = JSON.stringify(updatedData.images)
      } catch (error) {
        console.error(`[DB] Error stringifying images:`, error)
        // If stringification fails, set to empty array string
        updatedData.images = "[]"
      }
    }
  }

  await kv.hset(`story:${id}`, updatedData)

  return getStory(id)
}

/**
 * Delete a story
 */
export async function deleteStory(id: string): Promise<boolean> {
  const deleted = await kv.del(`story:${id}`)

  return deleted === 1
}

/**
 * List all stories
 */
export async function listStories(limit = 100): Promise<Story[]> {
  const storyKeys = await kv.keys("story:*")

  if (!storyKeys || storyKeys.length === 0) {
    return []
  }

  const stories = await Promise.all(
    storyKeys.slice(0, limit).map(async (key) => {
      const storyData = await kv.hgetall(key)

      // Try to fix common issues before returning
      if (storyData && storyData.storyContent !== undefined && typeof storyData.storyContent !== "string") {
        try {
          storyData.storyContent = JSON.stringify(storyData.storyContent)
        } catch (e) {
          console.error(`[DB] Error stringifying storyContent:`, e)
          storyData.storyContent = "{}"
        }
      }

      if (storyData && storyData.images !== undefined && typeof storyData.images !== "string") {
        try {
          storyData.images = JSON.stringify(storyData.images)
        } catch (e) {
          console.error(`[DB] Error stringifying images:`, e)
          storyData.images = "[]"
        }
      }

      return storyData as Story
    }),
  )

  return stories.filter(Boolean)
}
