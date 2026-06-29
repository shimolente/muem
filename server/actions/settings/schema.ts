import { z } from 'zod';

export const settingsSchema = z.object({
  socials: z.array(
    z.object({
      label: z.string().min(1, 'Label required'),
      href:  z.string().min(1, 'Link required'),
    }),
  ),
  coconutsShared: z.number().int().min(0),
  aboutStats: z.array(
    z.object({
      value: z.string().min(1, 'Value required'),
      label: z.string().min(1, 'Label required'),
      tags:  z.array(z.string()),
    }),
  ),
  contactEmail:    z.string(),
  contactWhatsapp: z.string(),
  contactLocation: z.string(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
