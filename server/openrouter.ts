/**
 * OpenRouter API integration for image generation and editing
 * Uses Google Gemini 2.5 Flash model for image operations
 */

import { storagePut } from "./storage";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const GEMINI_MODEL = "google/gemini-2.5-flash-image-preview"; // Google Gemini 2.5 Flash with image support

interface OpenRouterImageGenerationRequest {
  model: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }>;
}

interface OpenRouterImageGenerationResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      images?: Array<{
        type: string;
        image_url: {
          url: string;
        };
        index: number;
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate an image from a text prompt using OpenRouter API
 * Returns a data URL or S3 URL of the generated image
 */
export async function generateImageFromPrompt(
  apiKey: string,
  prompt: string
): Promise<{ imageUrl: string }> {
  if (!apiKey) {
    throw new Error("OpenRouter API Key is required");
  }

  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ecommerce-image-gen.example.com",
        "X-Title": "E-commerce Image Generator",
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages: [
          {
            role: "user",
            content: `Generate a high-quality product image for e-commerce based on this description: ${prompt}. The image should be professional, well-lit, and suitable for online store listings.`,
          },
        ],
      } as OpenRouterImageGenerationRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as OpenRouterImageGenerationResponse;

    // Extract image from response - Gemini returns images in the message.images array
    const images = data.choices[0]?.message.images;
    if (!images || images.length === 0) {
      throw new Error("No image generated in response");
    }

    const imageUrl = images[0].image_url.url;

    // If it's a base64 data URL, convert it to a usable format
    if (imageUrl.startsWith("data:image/")) {
      // Convert base64 to buffer and upload to S3
      const base64Data = imageUrl.split(",")[1];
      if (!base64Data) {
        throw new Error("Invalid base64 image data");
      }

      const imageBuffer = Buffer.from(base64Data, "base64");
      const mimeType = imageUrl.match(/data:(image\/[^;]+)/)?.[1] || "image/png";

      // Upload to S3 with a unique key
      const fileKey = `images/generated/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const { url: s3Url } = await storagePut(fileKey, imageBuffer, mimeType);

      return { imageUrl: s3Url };
    }

    // If it's already a URL, return as-is
    return { imageUrl };
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}

/**
 * Edit an image using OpenRouter API
 * Takes an image URL and edit instructions, returns the edited image URL
 */
export async function editImageWithPrompt(
  apiKey: string,
  imageUrl: string,
  editPrompt: string
): Promise<{ imageUrl: string }> {
  if (!apiKey) {
    throw new Error("OpenRouter API Key is required");
  }

  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ecommerce-image-gen.example.com",
        "X-Title": "E-commerce Image Generator",
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please edit this product image according to the following instructions: ${editPrompt}. Make sure the edited image maintains professional quality suitable for e-commerce.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      } as OpenRouterImageGenerationRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as OpenRouterImageGenerationResponse;

    // Extract edited image from response
    const images = data.choices[0]?.message.images;
    if (!images || images.length === 0) {
      throw new Error("No edited image in response");
    }

    const editedImageUrl = images[0].image_url.url;

    // If it's a base64 data URL, convert it to a usable format
    if (editedImageUrl.startsWith("data:image/")) {
      const base64Data = editedImageUrl.split(",")[1];
      if (!base64Data) {
        throw new Error("Invalid base64 image data");
      }

      const imageBuffer = Buffer.from(base64Data, "base64");
      const mimeType = editedImageUrl.match(/data:(image\/[^;]+)/)?.[1] || "image/png";

      // Upload to S3 with a unique key
      const fileKey = `images/edited/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const { url: s3Url } = await storagePut(fileKey, imageBuffer, mimeType);

      return { imageUrl: s3Url };
    }

    return { imageUrl: editedImageUrl };
  } catch (error) {
    console.error("Image editing error:", error);
    throw error;
  }
}

/**
 * Validate OpenRouter API Key by making a simple request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ecommerce-image-gen.example.com",
        "X-Title": "E-commerce Image Generator",
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages: [
          {
            role: "user",
            content: "Say 'API Key is valid' in one sentence.",
          },
        ],
      } as OpenRouterImageGenerationRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Key validation failed:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("API Key validation error:", error);
    return false;
  }
}
