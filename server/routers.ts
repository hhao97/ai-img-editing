import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { INSPIRATION_CATEGORY_LIST } from "@shared/inspirations";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { createImageGeneration, getUserImageGenerations, createImageEdit, getUserImageEdits, getAllInspirations, getInspirationById, createInspiration, updateInspiration, deleteInspiration } from "./db";
import { generateImageFromPrompt, editImageWithPrompt, validateApiKey } from "./openrouter";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  images: router({
    generate: protectedProcedure
      .input(
        z.object({
          prompt: z.string().min(1, "Prompt is required").max(500),
          apiKey: z.string().min(1, "API Key is required"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Directly attempt to generate the image - this will validate the API key
          const { imageUrl } = await generateImageFromPrompt(input.apiKey, input.prompt);
          await createImageGeneration(ctx.user.id, input.prompt, imageUrl);

          return {
            success: true,
            imageUrl,
          };
        } catch (error) {
          console.error("Image generation error:", error);
          throw error;
        }
      }),

    getHistory: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().positive().default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return await getUserImageGenerations(ctx.user.id, input.limit);
      }),

    edit: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url("Invalid image URL"),
          editPrompt: z.string().min(1, "Edit prompt is required").max(500),
          apiKey: z.string().min(1, "API Key is required"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Directly attempt to edit the image - this will validate the API key
          const { imageUrl: editedImageUrl } = await editImageWithPrompt(
            input.apiKey,
            input.imageUrl,
            input.editPrompt
          );

          await createImageEdit(ctx.user.id, input.imageUrl, input.editPrompt, editedImageUrl);

          return {
            success: true,
            editedImageUrl,
          };
        } catch (error) {
          console.error("Image editing error:", error);
          throw error;
        }
      }),

    getEditHistory: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().positive().default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return await getUserImageEdits(ctx.user.id, input.limit);
      }),

    uploadImage: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          fileData: z.string(),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const buffer = Buffer.from(input.fileData, "base64");
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);

          // 提取文件扩展名（处理中文文件名问题）
          const ext = input.fileName.split('.').pop()?.toLowerCase() || 'jpg';
          // 生成安全的文件名，避免中文字符导致的 InvalidKey 错误
          const safeFileName = `${timestamp}-${random}.${ext}`;
          const fileKey = `images/${ctx.user.id}/${safeFileName}`;

          const { url } = await storagePut(fileKey, buffer, input.mimeType);

          return {
            success: true,
            url,
            fileKey,
          };
        } catch (error) {
          console.error("Image upload error:", error);
          throw error;
        }
      }),
  }),

  inspirations: router({
    getCategories: publicProcedure
      .query(() => {
        return INSPIRATION_CATEGORY_LIST;
      }),

    getAll: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await getAllInspirations(input?.category);
      }),

    getById: publicProcedure
      .input(
        z.object({
          id: z.string().min(1),
        })
      )
      .query(async ({ input }) => {
        return await getInspirationById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(100),
          prompt: z.string().min(1).max(1000),
          imageUrl: z.string().url(),
          imageKey: z.string().optional(),
          category: z.enum([
            "fashion",
            "shoes",
            "accessories",
            "home",
            "electronics",
            "beauty",
            "food",
            "other",
          ]),
          tags: z.array(z.string()).optional(),
          note: z.string().optional(),
          orderWeight: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createInspiration(input);
        return { success: true, id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1).max(100).optional(),
          prompt: z.string().min(1).max(1000).optional(),
          imageUrl: z.string().url().optional(),
          imageKey: z.string().optional(),
          category: z.enum([
            "fashion",
            "shoes",
            "accessories",
            "home",
            "electronics",
            "beauty",
            "food",
            "other",
          ]).optional(),
          tags: z.array(z.string()).optional(),
          note: z.string().optional(),
          orderWeight: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateInspiration(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(
        z.object({
          id: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        await deleteInspiration(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
