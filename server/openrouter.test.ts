import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateImageFromPrompt, editImageWithPrompt, validateApiKey } from "./openrouter";

// Mock fetch globally
global.fetch = vi.fn();

describe("OpenRouter API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateImageFromPrompt", () => {
    it("should throw error if API key is missing", async () => {
      await expect(generateImageFromPrompt("", "test prompt")).rejects.toThrow(
        "OpenRouter API Key is required"
      );
    });

    it("should throw error if no image in response", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "", images: [] } }],
        }),
      });

      await expect(generateImageFromPrompt("test-key", "test prompt")).rejects.toThrow(
        "No image generated in response"
      );
    });

    it("should extract image URL from response", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "",
                images: [
                  {
                    type: "image_url",
                    image_url: {
                      url: "https://example.com/image.jpg",
                    },
                    index: 0,
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await generateImageFromPrompt("test-key", "test prompt");
      expect(result.imageUrl).toBe("https://example.com/image.jpg");
    });

    it("should throw error on API failure", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: "Invalid API Key" },
        }),
      });

      await expect(generateImageFromPrompt("test-key", "test prompt")).rejects.toThrow(
        "OpenRouter API error: Invalid API Key"
      );
    });
  });

  describe("editImageWithPrompt", () => {
    it("should throw error if API key is missing", async () => {
      await expect(
        editImageWithPrompt("", "https://example.com/image.jpg", "edit prompt")
      ).rejects.toThrow("OpenRouter API Key is required");
    });

    it("should throw error if image URL is missing", async () => {
      await expect(
        editImageWithPrompt("test-key", "", "edit prompt")
      ).rejects.toThrow("Image URL is required");
    });

    it("should throw error if no image in response", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "", images: [] } }],
        }),
      });

      await expect(
        editImageWithPrompt("test-key", "https://example.com/image.jpg", "edit prompt")
      ).rejects.toThrow("No edited image in response");
    });

    it("should throw error on API failure", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: "Invalid API Key" },
        }),
      });

      await expect(
        editImageWithPrompt("test-key", "https://example.com/image.jpg", "edit prompt")
      ).rejects.toThrow("OpenRouter API error: Invalid API Key");
    });

    it("should successfully edit image", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "",
                images: [
                  {
                    type: "image_url",
                    image_url: {
                      url: "https://example.com/edited-image.jpg",
                    },
                    index: 0,
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await editImageWithPrompt(
        "test-key",
        "https://example.com/image.jpg",
        "make it brighter"
      );
      expect(result.imageUrl).toBe("https://example.com/edited-image.jpg");
    });
  });

  describe("validateApiKey", () => {
    it("should return true for valid API key", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "API Key is valid", images: [] } }],
        }),
      });

      const result = await validateApiKey("valid-key");
      expect(result).toBe(true);
    });

    it("should return false for invalid API key", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: "Invalid API Key" },
        }),
      });

      const result = await validateApiKey("invalid-key");
      expect(result).toBe(false);
    });

    it("should return false on network failure", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await validateApiKey("test-key");
      expect(result).toBe(false);
    });

    it("should return false for empty API key", async () => {
      const result = await validateApiKey("");
      expect(result).toBe(false);
    });
  });
});
