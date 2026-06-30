import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'A search query is required.').max(100),
  count: z.coerce.number().int().min(1).max(20).default(5)
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

const geocodingResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  timezone: z.string().optional()
});

export const geocodingResponseSchema = z.object({
  results: z.array(geocodingResultSchema).optional()
});
export type GeocodingResponse = z.infer<typeof geocodingResponseSchema>;

const nominatimPlaceSchema = z.object({
  place_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  name: z.string().optional(),
  address: z
    .object({
      city: z.string().optional(),
      town: z.string().optional(),
      village: z.string().optional(),
      suburb: z.string().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      postcode: z.string().optional(),
      country: z.string().optional(),
      country_code: z.string().optional()
    })
    .optional()
});

export const nominatimSearchSchema = z.array(nominatimPlaceSchema);
export type NominatimSearch = z.infer<typeof nominatimSearchSchema>;

export const searchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  admin1: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional()
});
export type SearchResult = z.infer<typeof searchResultSchema>;

export const searchResponseSchema = z.object({
  results: z.array(searchResultSchema)
});
export type SearchResponse = z.infer<typeof searchResponseSchema>;
