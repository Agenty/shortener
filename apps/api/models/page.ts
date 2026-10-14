import { z } from '@hono/zod-openapi';
import { BaseLink } from './baselink';

export class PageData {
  bio?: string;
  avatar?: string;
  background?: string = '#ffffff';
  social?: { [key: string]: string } = {
    instagram: 'https://instagram.com/johndoe',
    facebook: 'https://facebook.com/johndoe',
    youtube: 'https://youtube.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
  };
  links?: Array<{
    id?: number;
    title?: string;
    url?: string;
    icon?: string;
  }> = [];
  design?: string = 'modern';
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export class Page extends BaseLink {
  data?: PageData;
}

export const pageDataSchema = z.object({
  bio: z.string().max(512).optional().nullable(),
  avatar: z.string().optional().nullable(),
  background: z.string().default('#ffffff'),
  social: z.record(z.string()),
  links: z
    .array(
      z.object({
        id: z.number(),
        title: z.string(),
        url: z.union([z.string().url(), z.string().default('#')]),
        icon: z.string(),
      })
    )
    .default([]),
  design: z.string().default('modern'),
  seo: z.object({
    title: z.string().max(160).optional().nullable(),
    description: z.string().max(250).optional().nullable(),
    image: z.string().max(512).optional().nullable(),
  }),
});

export const pageSchema = z.object({
  key: z.string().max(32).optional().openapi({
    example: 'vikash',
    description: 'To provide custom aliases for your bio pages',
  }),
  name: z.string().min(1).max(64),
  data: pageDataSchema,
  created_at: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .openapi({ readOnly: true }),
  updated_at: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .openapi({ readOnly: true }),
});
