import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    translationId: z.string(),
    draft: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    occupation: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
});

export const collections = { blog, authors };
