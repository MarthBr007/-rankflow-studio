import { z } from 'zod';

const SeoSchema = z.object({
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
});

const FaqSchema = z
  .array(
    z.object({
      question: z.string().optional(),
      answer: z.string().optional(),
    })
  )
  .optional();

export const LandingSchema = z.object({
  seo: SeoSchema.optional(),
  content: z
    .object({
      h1: z.string().optional(),
      intro: z.string().optional(),
      sections: z.any().optional(),
    })
    .optional(),
  faq: FaqSchema,
  cta: z.any().optional(),
});

export const ProductSchema = z.object({
  seo: SeoSchema.optional(),
  title: z.string().optional(),
  intro: z.string().optional(),
  faq: FaqSchema,
});

export const BlogSchema = z.object({
  seo: SeoSchema.optional(),
  h1: z.string().optional(),
  intro: z.string().optional(),
  sections: z.array(z.any()).optional(),
  faq: FaqSchema,
});

export const SocialSchema = z.object({
  seo: SeoSchema.optional(),
  variants: z.array(z.any()).optional(),
});

export function validateByType(type: string, data: any) {
  if (type === 'landing') return LandingSchema.safeParse(data);
  if (type === 'product') return ProductSchema.safeParse(data);
  if (type === 'blog') return BlogSchema.safeParse(data);
  if (type === 'social') return SocialSchema.safeParse(data);
  return { success: true, data };
}

