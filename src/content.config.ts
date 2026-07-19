import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commonFields = {
  title: z.string().min(1),
  date: z.coerce.date(),
  slug: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published']),
};

const workshops = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/workshops' }),
  schema: z.object({
    type: z.literal('workshop'),
    ...commonFields,
  }),
});

const advice = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/advice' }),
  schema: z.object({
    type: z.literal('advice'),
    ...commonFields,
  }),
});

export const collections = { workshops, advice };
