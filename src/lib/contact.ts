import { z } from 'zod'
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter at least two characters.')
    .max(100, 'Keep your name under 100 characters.'),
  email: z
    .email('Please enter a valid email address.')
    .max(254)
    .transform((v) => v.toLowerCase()),
  service: z.string().min(1, 'Please choose a service.').max(100),
  message: z
    .string()
    .trim()
    .min(20, 'Tell us a little more, at least 20 characters.')
    .max(4000, 'Keep your message under 4,000 characters.'),
  budget: z
    .enum(['', 'exploring', 'under-1000', '1000-5000', '5000-15000', '15000-plus'])
    .default(''),
  website: z.string().max(200).default(''),
  submissionId: z.uuid(),
})
export type ContactInput = z.input<typeof contactSchema>
