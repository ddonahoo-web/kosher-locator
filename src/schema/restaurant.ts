import { z } from 'zod'

const urlSchema = z.string().url()

export const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().optional(),
  website: urlSchema.optional(),
  hours: z.string().optional(),
  certification: z.string().optional(),
  cuisine: z.union([z.string(), z.array(z.string())]).optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  imageUrl: urlSchema.optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  priceLevel: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
})

export type Restaurant = z.infer<typeof restaurantSchema>

export const restaurantsArraySchema = z.array(restaurantSchema)

export type RestaurantsArray = z.infer<typeof restaurantsArraySchema>
