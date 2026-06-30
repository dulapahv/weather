import { z } from 'zod';

export const reverseQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180)
});
export type ReverseQuery = z.infer<typeof reverseQuerySchema>;

export const nominatimReverseSchema = z.object({
  display_name: z.string().optional(),
  address: z
    .object({
      city: z.string().optional(),
      town: z.string().optional(),
      village: z.string().optional(),
      municipality: z.string().optional(),
      suburb: z.string().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional()
    })
    .optional()
});
export type NominatimReverse = z.infer<typeof nominatimReverseSchema>;

export const reverseResponseSchema = z.object({
  label: z.string()
});
export type ReverseResponse = z.infer<typeof reverseResponseSchema>;
